import { neon } from "@neondatabase/serverless";
import { createHash, randomBytes } from "node:crypto";
import {
  createPublicClient,
  erc20Abi,
  formatUnits,
  http,
} from "viem";
import { mainnet } from "viem/chains";
import { createSiweMessage, generateSiweNonce, parseSiweMessage } from "viem/siwe";

import {
  FEATURE_BOARD_CHAIN_ID,
  MINIMUM_VULT_BALANCE,
  VULT_CONTRACT_ADDRESS,
} from "../shared/featureBoard.js";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const NONCE_TTL_SECONDS = 10 * 60;
const MAX_BODY_BYTES = 24_000;

let sqlClient;
const db = () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  sqlClient ||= neon(process.env.DATABASE_URL);
  return sqlClient;
};

const ethereum = () => createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETHEREUM_RPC_URL),
});

const json = (status, body) => ({
  status,
  headers: {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  },
  body,
});

/** @returns {import("viem").Address} */
const normalizeAddress = (value) => {
  const address = String(value || "").toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(address)) throw new ApiError(400, "Invalid wallet address");
  return /** @type {import("viem").Address} */ (address);
};

const normalizeProposalId = (value) => {
  const id = String(value || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new ApiError(400, "Invalid proposal ID");
  }
  return id;
};

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const adminWallets = () => new Set(
  String(process.env.ADMIN_WALLETS || "")
    .split(",")
    .map((address) => address.trim().toLowerCase())
    .filter(Boolean),
);

const sessionFromHeaders = async (headers, required = true) => {
  const token = String(headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) {
    if (required) throw new ApiError(401, "Connect and sign in first");
    return null;
  }
  const rows = await db()`
    SELECT address FROM sessions
    WHERE token_hash = ${hashToken(token)} AND expires_at > now()
    LIMIT 1
  `;
  if (!rows[0]) {
    if (required) throw new ApiError(401, "Your session expired. Sign in again");
    return null;
  }
  return { address: rows[0].address, isAdmin: adminWallets().has(rows[0].address) };
};

const vultBalance = async (address) => {
  if (!process.env.ETHEREUM_RPC_URL) throw new Error("ETHEREUM_RPC_URL is not configured");
  const raw = await ethereum().readContract(/** @type {any} */ ({
    address: VULT_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  }));
  return Number(formatUnits(/** @type {bigint} */ (raw), 18));
};

const requireVult = async (address) => {
  if (adminWallets().has(address)) {
    return vultBalance(address).catch(() => 0);
  }
  const balance = await vultBalance(address);
  if (balance < MINIMUM_VULT_BALANCE) {
    throw new ApiError(403, `At least ${MINIMUM_VULT_BALANCE} VULT is required`);
  }
  return balance;
};

const rateLimit = async (key, maximum, seconds) => {
  const id = `${key}:${Math.floor(Date.now() / (seconds * 1000))}`;
  const rows = await db()`
    INSERT INTO rate_limits(id, request_count, expires_at)
    VALUES (${id}, 1, now() + (${seconds} * interval '1 second'))
    ON CONFLICT (id) DO UPDATE SET request_count = rate_limits.request_count + 1
    RETURNING request_count
  `;
  if (rows[0].request_count > maximum) throw new ApiError(429, "Too many requests. Please try again shortly");
};

const cleanupExpiredRows = async () => {
  await Promise.all([
    db()`DELETE FROM auth_challenges WHERE expires_at <= now()`,
    db()`DELETE FROM sessions WHERE expires_at <= now()`,
    db()`DELETE FROM rate_limits WHERE expires_at <= now()`,
  ]);
};

const requestOrigin = (headers) => {
  const host = String(headers.host || "").trim().toLowerCase();
  if (!host || !/^[a-z0-9.-]+(?::\d{1,5})?$/.test(host)) {
    throw new ApiError(400, "Invalid request host");
  }
  const forwardedProto = String(headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim();
  const protocol = forwardedProto === "https" || forwardedProto === "http"
    ? forwardedProto
    : host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https";
  return { domain: host, uri: `${protocol}://${host}` };
};

const board = async (headers) => {
  const session = await sessionFromHeaders(headers, false);
  const address = session?.address || "";
  const rows = await db()`
    SELECT
      p.id, p.title, p.body, p.author_address AS "authorAddress",
      p.moderation_state AS "moderationState",
      p.voting_starts_at AS "startsAt", p.voting_ends_at AS "endsAt",
      p.created_at AS "createdAt",
      CASE
        WHEN p.moderation_state = 'pending' THEN 'pending'
        WHEN p.moderation_state = 'rejected' THEN 'rejected'
        WHEN p.voting_starts_at > now() THEN 'upcoming'
        WHEN p.voting_ends_at > now() THEN 'active'
        ELSE 'closed'
      END AS state,
      COUNT(v.*)::int AS "voteCount",
      COUNT(v.*) FILTER (WHERE v.choice = 'for')::int AS "forVotes",
      COUNT(v.*) FILTER (WHERE v.choice = 'against')::int AS "againstVotes",
      COUNT(v.*) FILTER (WHERE v.choice = 'abstain')::int AS "abstainVotes",
      MAX(v.choice) FILTER (WHERE v.voter_address = ${address}) AS "myVote"
    FROM proposals p
    LEFT JOIN votes v ON v.proposal_id = p.id
    WHERE p.moderation_state = 'approved'
       OR (p.moderation_state = 'pending' AND ${address} <> '' AND p.author_address = ${address})
       OR (p.moderation_state = 'pending' AND ${session?.isAdmin || false})
    GROUP BY p.id
    ORDER BY
      CASE WHEN p.moderation_state = 'pending' THEN 0 ELSE 1 END,
      p.created_at DESC
    LIMIT 500
  `;
  return json(200, {
    proposals: rows,
    viewer: session ? { address: session.address, isAdmin: session.isAdmin } : null,
    rules: { minimumVult: MINIMUM_VULT_BALANCE, votingModel: "one-wallet-one-vote" },
  });
};

const issueNonce = async (payload, requestKey, headers) => {
  await rateLimit(`nonce:${requestKey}`, 10, 60);
  await cleanupExpiredRows();
  const address = normalizeAddress(payload.address);
  const nonce = generateSiweNonce();
  const issuedAt = new Date();
  const expirationTime = new Date(issuedAt.getTime() + NONCE_TTL_SECONDS * 1000);
  const { domain, uri } = requestOrigin(headers);
  const message = createSiweMessage({
    address,
    chainId: FEATURE_BOARD_CHAIN_ID,
    domain,
    expirationTime,
    issuedAt,
    nonce,
    statement: "Sign in to participate in the Vultisig Feature Board. This does not trigger a transaction or cost gas.",
    uri,
    version: "1",
  });
  await db()`
    INSERT INTO auth_challenges(nonce, address, expires_at)
    VALUES (${nonce}, ${address}, ${expirationTime.toISOString()})
  `;
  return json(200, { message });
};

const verifySignIn = async (payload, requestKey, headers) => {
  await rateLimit(`verify:${requestKey}`, 20, 60);
  const message = String(payload.message || "");
  const signature = /** @type {import("viem").Hex} */ (String(payload.signature || ""));
  if (!/^0x[0-9a-f]+$/i.test(signature)) {
    throw new ApiError(400, "Invalid wallet signature");
  }
  let parsed;
  try {
    parsed = parseSiweMessage(message);
  } catch {
    throw new ApiError(400, "Invalid sign-in message");
  }
  const address = normalizeAddress(parsed.address);
  const nonce = String(parsed.nonce || "");
  const { domain, uri } = requestOrigin(headers);
  const rows = await db()`
    SELECT nonce FROM auth_challenges
    WHERE address = ${address} AND nonce = ${nonce} AND expires_at > now()
    LIMIT 1
  `;
  if (!rows[0]) throw new ApiError(401, "Sign-in request expired. Try again");
  if (parsed.domain !== domain || parsed.uri !== uri || parsed.chainId !== FEATURE_BOARD_CHAIN_ID) {
    throw new ApiError(401, "Sign-in request does not match this site");
  }
  const valid = await ethereum().verifySiweMessage({
    address,
    domain,
    message,
    nonce,
    signature,
  });
  if (!valid) throw new ApiError(401, "Wallet signature could not be verified");
  const consumed = await db()`
    DELETE FROM auth_challenges
    WHERE address = ${address} AND nonce = ${nonce} AND expires_at > now()
    RETURNING nonce
  `;
  if (!consumed[0]) throw new ApiError(401, "Sign-in request was already used");
  const balance = await requireVult(address);
  const token = randomBytes(32).toString("hex");
  await db()`
    INSERT INTO sessions(token_hash, address, expires_at)
    VALUES (${hashToken(token)}, ${address}, now() + (${SESSION_TTL_SECONDS} * interval '1 second'))
  `;
  return json(200, { token, address, balance, isAdmin: adminWallets().has(address) });
};

const createProposal = async (headers, payload) => {
  const session = await sessionFromHeaders(headers);
  await rateLimit(`proposal:${session.address}`, 5, 3600);
  await requireVult(session.address);
  const title = String(payload.title || "").trim();
  const body = String(payload.body || "").trim();
  if (title.length < 8 || title.length > 160) throw new ApiError(400, "Title must be 8–160 characters");
  if (body.length < 24 || body.length > 10_000) throw new ApiError(400, "Proposal must be 24–10,000 characters");
  const rows = await db()`
    INSERT INTO proposals(title, body, author_address)
    VALUES (${title}, ${body}, ${session.address})
    RETURNING id
  `;
  return json(201, { id: rows[0].id, moderationState: "pending" });
};

const castVote = async (headers, payload) => {
  const session = await sessionFromHeaders(headers);
  await rateLimit(`vote:${session.address}`, 60, 60);
  await requireVult(session.address);
  const choice = String(payload.choice || "");
  if (!["for", "against", "abstain"].includes(choice)) throw new ApiError(400, "Invalid vote choice");
  const proposalId = normalizeProposalId(payload.proposalId);
  const active = await db()`
    SELECT id FROM proposals
    WHERE id = ${proposalId} AND moderation_state = 'approved'
      AND voting_starts_at <= now() AND voting_ends_at > now()
    LIMIT 1
  `;
  if (!active[0]) throw new ApiError(409, "This proposal is not currently open for voting");
  await db()`
    INSERT INTO votes(proposal_id, voter_address, choice)
    VALUES (${proposalId}, ${session.address}, ${choice})
    ON CONFLICT (proposal_id, voter_address) DO UPDATE SET
      choice = EXCLUDED.choice, updated_at = now()
  `;
  return json(200, { recorded: true, choice });
};

const moderate = async (headers, payload) => {
  const session = await sessionFromHeaders(headers);
  if (!session.isAdmin) throw new ApiError(403, "Admin access required");
  const state = String(payload.moderationState || "");
  if (!["approved", "rejected"].includes(state)) throw new ApiError(400, "Invalid moderation state");
  const startsAt = state === "approved" ? new Date(payload.startsAt) : null;
  const endsAt = state === "approved" ? new Date(payload.endsAt) : null;
  if (state === "approved" &&
      (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || endsAt <= startsAt || endsAt <= new Date())) {
    throw new ApiError(400, "Choose a valid voting start and end time");
  }
  const proposalId = normalizeProposalId(payload.proposalId);
  const rows = await db()`
    UPDATE proposals SET
      moderation_state = ${state},
      voting_starts_at = ${startsAt?.toISOString() || null},
      voting_ends_at = ${endsAt?.toISOString() || null},
      updated_at = now()
    WHERE id = ${proposalId}
    RETURNING id
  `;
  if (!rows[0]) throw new ApiError(404, "Proposal not found");
  return json(200, { updated: true });
};

export async function handleApi({ method, url, headers = {}, body = "" }) {
  try {
    const parsedUrl = new URL(url, "http://localhost");
    if (method === "GET" && parsedUrl.searchParams.get("action") === "board") return await board(headers);
    if (method !== "POST") throw new ApiError(405, "Method not allowed");
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) throw new ApiError(413, "Request is too large");
    const payload = JSON.parse(body || "{}");
    const requestKey = String(
      headers["x-real-ip"] || headers["x-vercel-forwarded-for"] || "local",
    ).split(",")[0].trim();
    if (payload.action === "nonce") return await issueNonce(payload, requestKey, headers);
    if (payload.action === "verify") return await verifySignIn(payload, requestKey, headers);
    if (payload.action === "createProposal") return await createProposal(headers, payload);
    if (payload.action === "vote") return await castVote(headers, payload);
    if (payload.action === "moderate") return await moderate(headers, payload);
    throw new ApiError(404, "Unknown API action");
  } catch (error) {
    if (error instanceof ApiError) return json(error.status, { error: error.message });
    if (error instanceof SyntaxError) return json(400, { error: "Invalid JSON request" });
    console.error(error);
    return json(500, { error: "The feature board is temporarily unavailable" });
  }
}
