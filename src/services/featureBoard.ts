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
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

export const fetchBoard = async (token?: string) => {
  const response = await fetch("/api?action=board", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = (await response.json()) as BoardResponse & { error?: string };
  if (!response.ok) throw new Error(data.error || "Could not load the feature board");
  return data;
};

export const signIn = async (
  address: Address,
  sign: (message: string) => Promise<Hex>,
) => {
  const { message } = await request<{ message: string }>("nonce", { address });
  const signature = await sign(message);
  return request<Session>("verify", { address, signature });
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
