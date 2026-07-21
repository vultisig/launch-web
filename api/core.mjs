import { neon, neonConfig } from "@neondatabase/serverless";
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
  MAX_BODY_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_TITLE_LENGTH,
  MINIMUM_VULT_BALANCE,
  VULT_CONTRACT_ADDRESS,
} from "../shared/featureBoard.js";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const NONCE_TTL_SECONDS = 10 * 60;
const MAX_BODY_BYTES = 24_000;

// Local development only: route the Neon HTTP driver to a local SQL-over-HTTP
// proxy (e.g. ghcr.io/timowilhelm/local-neon-http-proxy). Unset in production.
if (process.env.NEON_LOCAL_FETCH_ENDPOINT) {
  neonConfig.fetchEndpoint = process.env.NEON_LOCAL_FETCH_ENDPOINT;
}

let sqlClient;
const db = () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  sqlClient ||= neon(process.env.DATABASE_URL);
  return sqlClient;
};

const ethereum = () => createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETHEREUM_RPC_URL, {
    retryCount: 1,
    timeout: 8_000,
  }),
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

const normalizeUuid = (value) => {
  const id = String(value || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new ApiError(400, "Invalid ID");
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

// Postgres foreign-key violation on proposal_id means the proposal is gone.
const mapMissingProposal = (query) => query.catch((error) => {
  if (error?.code === "23503") throw new ApiError(404, "Proposal not found");
  throw error;
});
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
      p.created_at AS "createdAt",
      COUNT(v.*) FILTER (WHERE v.choice = 'up')::int AS "upVotes",
      COUNT(v.*) FILTER (WHERE v.choice = 'down')::int AS "downVotes",
      (COUNT(v.*) FILTER (WHERE v.choice = 'up')
        - COUNT(v.*) FILTER (WHERE v.choice = 'down'))::int AS score,
      MAX(v.choice) FILTER (WHERE v.voter_address = ${address}) AS "myVote",
      (SELECT COUNT(*)::int FROM notes n WHERE n.proposal_id = p.id) AS "noteCount"
    FROM proposals p
    LEFT JOIN votes v ON v.proposal_id = p.id
    GROUP BY p.id
    ORDER BY score DESC, p.created_at DESC
    LIMIT 500
  `;
  return json(200, {
    proposals: rows,
    viewer: session ? { address: session.address, isAdmin: session.isAdmin } : null,
    rules: { minimumVult: MINIMUM_VULT_BALANCE, votingModel: "one-wallet-one-vote" },
  });
};

const listNotes = async (parsedUrl) => {
  const proposalId = normalizeUuid(parsedUrl.searchParams.get("proposalId"));
  const rows = await db()`
    SELECT id, author_address AS "authorAddress", body, created_at AS "createdAt"
    FROM notes
    WHERE proposal_id = ${proposalId}
    ORDER BY created_at ASC
    LIMIT 500
  `;
  return json(200, { notes: rows });
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
  if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
    throw new ApiError(400, `Title must be ${MIN_TITLE_LENGTH}–${MAX_TITLE_LENGTH} characters`);
  }
  if (body.length > MAX_BODY_LENGTH) {
    throw new ApiError(400, `Details are limited to ${MAX_BODY_LENGTH} characters`);
  }
  const rows = await db()`
    INSERT INTO proposals(title, body, author_address)
    VALUES (${title}, ${body}, ${session.address})
    RETURNING id
  `;
  return json(201, { id: rows[0].id });
};

const castVote = async (headers, payload) => {
  const session = await sessionFromHeaders(headers);
  await rateLimit(`vote:${session.address}`, 60, 60);
  await requireVult(session.address);
  const choice = String(payload.choice || "");
  if (!["up", "down"].includes(choice)) throw new ApiError(400, "Invalid vote choice");
  const proposalId = normalizeUuid(payload.proposalId);
  const rows = await mapMissingProposal(db()`
    WITH removed AS (
      DELETE FROM votes
      WHERE proposal_id = ${proposalId}
        AND voter_address = ${session.address}
        AND choice = ${choice}
      RETURNING choice
    )
    INSERT INTO votes(proposal_id, voter_address, choice)
    SELECT ${proposalId}, ${session.address}, ${choice}
    WHERE NOT EXISTS (SELECT 1 FROM removed)
    ON CONFLICT (proposal_id, voter_address) DO UPDATE SET
      choice = EXCLUDED.choice, updated_at = now()
    RETURNING choice
  `);
  return json(200, { myVote: rows[0]?.choice || null });
};

const addNote = async (headers, payload) => {
  const session = await sessionFromHeaders(headers);
  await rateLimit(`note:${session.address}`, 30, 3600);
  await requireVult(session.address);
  const body = String(payload.body || "").trim();
  if (body.length < 1 || body.length > MAX_NOTE_LENGTH) {
    throw new ApiError(400, `Notes must be 1–${MAX_NOTE_LENGTH.toLocaleString("en-US")} characters`);
  }
  const proposalId = normalizeUuid(payload.proposalId);
  const rows = await mapMissingProposal(db()`
    INSERT INTO notes(proposal_id, author_address, body)
    VALUES (${proposalId}, ${session.address}, ${body})
    RETURNING id, author_address AS "authorAddress", body, created_at AS "createdAt"
  `);
  return json(201, { note: rows[0] });
};

const deleteNote = async (headers, payload) => {
  const session = await sessionFromHeaders(headers);
  const noteId = normalizeUuid(payload.noteId);
  const rows = await db()`
    DELETE FROM notes
    WHERE id = ${noteId}
      AND (author_address = ${session.address} OR ${session.isAdmin})
    RETURNING id
  `;
  if (!rows[0]) throw new ApiError(404, "Note not found");
  return json(200, { deleted: true });
};

const deleteProposal = async (headers, payload) => {
  const session = await sessionFromHeaders(headers);
  if (!session.isAdmin) throw new ApiError(403, "Admin access required");
  const proposalId = normalizeUuid(payload.proposalId);
  const rows = await db()`
    DELETE FROM proposals WHERE id = ${proposalId} RETURNING id
  `;
  if (!rows[0]) throw new ApiError(404, "Proposal not found");
  return json(200, { deleted: true });
};

export async function handleApi({ method, url, headers = {}, body = "" }) {
  try {
    const parsedUrl = new URL(url, "http://localhost");
    if (method === "GET" && parsedUrl.searchParams.get("action") === "board") return await board(headers);
    if (method === "GET" && parsedUrl.searchParams.get("action") === "notes") return await listNotes(parsedUrl);
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
    if (payload.action === "addNote") return await addNote(headers, payload);
    if (payload.action === "deleteNote") return await deleteNote(headers, payload);
    if (payload.action === "deleteProposal") return await deleteProposal(headers, payload);
    throw new ApiError(404, "Unknown API action");
  } catch (error) {
    if (error instanceof ApiError) return json(error.status, { error: error.message });
    if (error instanceof SyntaxError) return json(400, { error: "Invalid JSON request" });
    console.error(error);
    return json(500, { error: "The feature board is temporarily unavailable" });
  }
}
