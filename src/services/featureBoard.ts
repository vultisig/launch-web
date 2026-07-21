import type { Address, Hex } from "viem";

export type VoteChoice = "up" | "down";

export type FeatureProposal = {
  id: string;
  title: string;
  body: string;
  authorAddress: string;
  createdAt: string;
  upVotes: number;
  downVotes: number;
  score: number;
  noteCount: number;
  myVote: VoteChoice | null;
};

export type ProposalNote = {
  id: string;
  authorAddress: string;
  body: string;
  createdAt: string;
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

const get = async <T>(query: string, token?: string) => {
  const response = await fetch(`/api?${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await parseResponse<T>(response);
  if (!response.ok) throw new FeatureBoardApiError(
    data.error || `Request failed (${response.status})`,
    response.status,
  );
  return data;
};

export const fetchBoard = (token?: string) =>
  get<BoardResponse>("action=board", token);

export const fetchNotes = (proposalId: string) =>
  get<{ notes: ProposalNote[] }>(`action=notes&proposalId=${proposalId}`);

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
) => request<{ id: string }>("createProposal", { title, body }, token);

export const toggleVote = (
  token: string,
  proposalId: string,
  choice: VoteChoice,
) => request<{ myVote: VoteChoice | null }>("vote", { proposalId, choice }, token);

export const addNote = (
  token: string,
  proposalId: string,
  body: string,
) => request<{ note: ProposalNote }>("addNote", { proposalId, body }, token);

export const deleteNote = (token: string, noteId: string) =>
  request<{ deleted: true }>("deleteNote", { noteId }, token);

export const deleteProposal = (token: string, proposalId: string) =>
  request<{ deleted: true }>("deleteProposal", { proposalId }, token);

export const formatExactDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
