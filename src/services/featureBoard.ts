import type { Address, Hex } from "viem";

export type VoteChoice = "for" | "against" | "abstain";
export type ProposalState = "pending" | "rejected" | "upcoming" | "active" | "closed";

export type FeatureProposal = {
  id: string;
  title: string;
  body: string;
  authorAddress: string;
  moderationState: "pending" | "approved" | "rejected";
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  state: ProposalState;
  voteCount: number;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  myVote: VoteChoice | null;
};

export type BoardResponse = {
  proposals: FeatureProposal[];
  viewer: { address: string; isAdmin: boolean } | null;
  rules: { minimumVult: number; votingModel: string };
};

export type Session = {
  token: string;
  address: Address;
  balance: number;
  isAdmin: boolean;
};

export class FeatureBoardApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const request = async <T>(
  action: string,
  payload: Record<string, unknown> = {},
  token?: string,
) => {
  const response = await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await parseResponse<T>(response);
  if (!response.ok) {
    throw new FeatureBoardApiError(
      data.error || `Request failed (${response.status})`,
      response.status,
    );
  }
  return data;
};

const parseResponse = async <T>(response: Response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(response.ok
      ? "The server returned an unexpected response"
      : `Request failed (${response.status})`);
  }
  return response.json() as Promise<T & { error?: string }>;
};

export const fetchBoard = async (token?: string) => {
  const response = await fetch("/api?action=board", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await parseResponse<BoardResponse>(response);
  if (!response.ok) throw new Error(data.error || "Could not load the feature board");
  return data;
};

export const signIn = async (
  address: Address,
  sign: (message: string) => Promise<Hex>,
) => {
  const { message } = await request<{ message: string }>("nonce", { address });
  const signature = await sign(message);
  return request<Session>("verify", { message, signature });
};

export const createFeatureProposal = (
  token: string,
  title: string,
  body: string,
) => request<{ id: string; moderationState: "pending" }>(
  "createProposal",
  { title, body },
  token,
);

export const submitVote = (
  token: string,
  proposalId: string,
  choice: VoteChoice,
) => request<{ recorded: true; choice: VoteChoice }>(
  "vote",
  { proposalId, choice },
  token,
);

export const moderateProposal = (
  token: string,
  proposalId: string,
  moderationState: "approved" | "rejected",
  startsAt?: string,
  endsAt?: string,
) => request<{ updated: true }>(
  "moderate",
  { proposalId, moderationState, startsAt, endsAt },
  token,
);

export const formatExactDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
