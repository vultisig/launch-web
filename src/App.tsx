import "@/styles/governance.scss";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { FormEvent, useDeferredValue, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  useAccount,
  useSignMessage,
  WagmiProvider,
} from "wagmi";

import { useCore } from "@/hooks/useCore";
import { i18nInstance } from "@/i18n/config";
import { CalendarIcon } from "@/icons/CalendarIcon";
import { CheckIcon } from "@/icons/CheckIcon";
import { ChevronDownIcon } from "@/icons/ChevronDownIcon";
import { ChevronRightIcon } from "@/icons/ChevronRightIcon";
import { CrossIcon } from "@/icons/CrossIcon";
import { LightbulbIcon } from "@/icons/LightbulbIcon";
import { MessageSmileIcon } from "@/icons/MessageSmileIcon";
import { NoteIcon } from "@/icons/NoteIcon";
import { SearchIcon } from "@/icons/SearchIcon";
import { TrashIcon } from "@/icons/TrashIcon";
import { UserIcon } from "@/icons/UserIcon";
import { DefaultLayout } from "@/layouts/Default";
import { NotFoundPage } from "@/pages/NotFound";
import { SwapPage } from "@/pages/Swap";
import { AntdProvider } from "@/providers/antd";
import { CoreProvider } from "@/providers/core";
import { StyledProvider } from "@/providers/styled";
import {
  addNote,
  type BoardResponse,
  createFeatureProposal,
  deleteNote,
  deleteProposal,
  FeatureBoardApiError,
  type FeatureProposal,
  fetchBoard,
  fetchNotes,
  formatExactDate,
  type IdeaStatus,
  type Session,
  setIdeaStatus,
  signIn,
  toggleVote,
  type VoteChoice,
} from "@/services/featureBoard";
import { clearFeatureBoardSession, getFeatureBoardSession, setFeatureBoardSession } from "@/storage/featureBoardSession";
import { modalHash } from "@/utils/constants";
import { wagmiConfig } from "@/utils/wagmi";

import {
  MAX_BODY_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_TITLE_LENGTH,
} from "../shared/featureBoard.js";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 15_000 } },
});

const icons = {
  search: SearchIcon,
  arrow: ChevronRightIcon,
  check: CheckIcon,
  calendar: CalendarIcon,
  lightbulb: LightbulbIcon,
  note: NoteIcon,
  message: MessageSmileIcon,
  user: UserIcon,
  close: CrossIcon,
  "chevron-down": ChevronDownIcon,
  trash: TrashIcon,
};
type IconName = keyof typeof icons;
function Icon({ name }: { name: IconName }) {
  const Component = icons[name];
  return <Component aria-hidden="true" />;
}

const BOARD_FILTERS = {
  New: { status: null, sort: "recent" },
  Top: { status: null, sort: "score" },
  Accepted: { status: "accepted", sort: "recent" },
  Declined: { status: "declined", sort: "recent" },
} as const satisfies Record<
  string,
  { status: IdeaStatus | null; sort: "recent" | "score" }
>;
type BoardFilter = keyof typeof BOARD_FILTERS;

type Busy = "" | "post" | "note" | "note-delete" | "idea-delete" | "status";

const shortAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";

const isExpiredSession = (error: unknown) =>
  error instanceof FeatureBoardApiError && error.status === 401;

const nextVote = (
  current: VoteChoice | null,
  choice: VoteChoice,
): VoteChoice | null => (current === choice ? null : choice);

const withVote = (
  proposal: FeatureProposal,
  vote: VoteChoice | null,
): FeatureProposal => {
  const upVotes =
    proposal.upVotes - (proposal.myVote === "up" ? 1 : 0) + (vote === "up" ? 1 : 0);
  const downVotes =
    proposal.downVotes - (proposal.myVote === "down" ? 1 : 0) + (vote === "down" ? 1 : 0);
  return { ...proposal, upVotes, downVotes, score: upVotes - downVotes, myVote: vote };
};

function VoteRail({
  horizontal,
  proposal,
  onVote,
}: {
  horizontal?: boolean;
  proposal: FeatureProposal;
  onVote: (proposal: FeatureProposal, choice: VoteChoice) => void;
}) {
  return (
    <div className={`vote-rail ${horizontal ? "horizontal" : ""}`}>
      <button
        aria-label={`Upvote ${proposal.title}`}
        aria-pressed={proposal.myVote === "up"}
        className={`vote-button up ${proposal.myVote === "up" ? "active" : ""}`}
        onClick={() => onVote(proposal, "up")}
      >
        <Icon name="chevron-down" />
      </button>
      <strong className="score">{proposal.score}</strong>
      <button
        aria-label={`Downvote ${proposal.title}`}
        aria-pressed={proposal.myVote === "down"}
        className={`vote-button down ${proposal.myVote === "down" ? "active" : ""}`}
        onClick={() => onVote(proposal, "down")}
      >
        <Icon name="chevron-down" />
      </button>
    </div>
  );
}

function FeatureBoard() {
  const { setCurrentPage } = useCore();
  useEffect(() => {
    document.title = "Vultisig Feature Board";
    setCurrentPage("features");
  }, [setCurrentPage]);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [session, setSession] = useState<Session | null>(getFeatureBoardSession);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<BoardFilter>("New");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<Busy>("");
  const [actionError, setActionError] = useState("");
  const [deleteArmed, setDeleteArmed] = useState(false);
  const activeSession =
    session &&
    address &&
    session.address.toLowerCase() === address.toLowerCase()
      ? session
      : null;

  const board = useQuery({
    queryKey: ["feature-board", activeSession?.token],
    queryFn: () => fetchBoard(activeSession?.token),
    refetchInterval: 30_000,
  });
  useEffect(() => {
    if (activeSession && board.isSuccess && !board.data.viewer) {
      clearFeatureBoardSession();
      setSession(null);
    }
  }, [activeSession, board.data?.viewer, board.isSuccess]);
  const authenticate = async () => {
    if (!address) throw new Error("Connect a wallet first");
    if (activeSession) return activeSession;
    const next = await signIn(address, (message) =>
      signMessageAsync({ message }),
    );
    setFeatureBoardSession(next);
    setSession(next);
    await queryClient.invalidateQueries({ queryKey: ["feature-board"] });
    return next;
  };

  const proposals = board.data?.proposals ?? [];
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(() => {
    const { status, sort } = BOARD_FILTERS[filter];
    const needle = deferredQuery.trim().toLowerCase();
    const matching = proposals.filter(
      (proposal) =>
        (status === null || proposal.status === status) &&
        `${proposal.title} ${proposal.body}`.toLowerCase().includes(needle),
    );
    // "score" keeps the server's ORDER BY score DESC from the board query
    return sort === "score"
      ? matching
      : [...matching].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [proposals, deferredQuery, filter]);
  const voteCount = proposals.reduce(
    (sum, proposal) => sum + proposal.upVotes + proposal.downVotes,
    0,
  );
  const noteCount = proposals.reduce(
    (sum, proposal) => sum + proposal.noteCount,
    0,
  );
  const selected = proposals.find((proposal) => proposal.id === selectedId) ?? null;

  const notes = useQuery({
    queryKey: ["feature-board-notes", selectedId],
    queryFn: () => fetchNotes(selectedId!),
    enabled: Boolean(selectedId),
  });

  const handleActionError = (error: unknown) => {
    if (isExpiredSession(error)) {
      clearFeatureBoardSession();
      setSession(null);
    }
    setActionError(errorMessage(error));
  };

  const openProposalForm = () => {
    setActionError("");
    if (!isConnected) window.location.hash = modalHash.connect;
    else setProposalOpen(true);
  };

  const openProposal = (proposal: FeatureProposal) => {
    setSelectedId(proposal.id);
    setActionError("");
    setDeleteArmed(false);
  };

  const runAction = async (
    kind: Exclude<Busy, "">,
    action: (token: string) => Promise<unknown>,
  ) => {
    setBusy(kind);
    setActionError("");
    try {
      const { token } = await authenticate();
      await action(token);
    } catch (error) {
      handleActionError(error);
    } finally {
      setBusy("");
    }
  };

  const createProposal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const body = String(data.get("body") || "").trim();
    await runAction("post", async (token) => {
      await createFeatureProposal(token, title, body);
      form.reset();
      setProposalOpen(false);
      await board.refetch();
    });
  };

  const patchBoard = (
    token: string | undefined,
    proposalId: string,
    transform: (proposal: FeatureProposal) => FeatureProposal,
  ) =>
    queryClient.setQueryData<BoardResponse>(
      ["feature-board", token],
      (data) =>
        data && {
          ...data,
          proposals: data.proposals.map((item) =>
            item.id === proposalId ? transform(item) : item,
          ),
        },
    );

  const vote = async (proposal: FeatureProposal, choice: VoteChoice) => {
    if (!isConnected) {
      window.location.hash = modalHash.connect;
      return;
    }
    setActionError("");
    patchBoard(activeSession?.token, proposal.id, (item) =>
      withVote(item, nextVote(item.myVote, choice)),
    );
    try {
      const authenticated = await authenticate();
      const { myVote } = await toggleVote(authenticated.token, proposal.id, choice);
      patchBoard(authenticated.token, proposal.id, (item) => withVote(item, myVote));
    } catch (error) {
      handleActionError(error);
      await board.refetch();
    }
  };

  const submitNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const form = event.currentTarget;
    const body = String(new FormData(form).get("note") || "").trim();
    if (!body) return;
    await runAction("note", async (token) => {
      await addNote(token, selected.id, body);
      form.reset();
      await Promise.all([notes.refetch(), board.refetch()]);
    });
  };

  const removeNote = (noteId: string) =>
    runAction("note-delete", async (token) => {
      await deleteNote(token, noteId);
      await Promise.all([notes.refetch(), board.refetch()]);
    });

  const removeProposal = async () => {
    if (!selected) return;
    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }
    await runAction("idea-delete", async (token) => {
      await deleteProposal(token, selected.id);
      setSelectedId(null);
      await board.refetch();
    });
    setDeleteArmed(false);
  };

  const applyStatus = (status: IdeaStatus) => {
    if (!selected) return;
    const { id } = selected;
    setDeleteArmed(false);
    return runAction("status", async (token) => {
      const { status: applied } = await setIdeaStatus(token, id, status);
      patchBoard(token, id, (item) => ({ ...item, status: applied }));
    });
  };

  return (
    <div className="governance-app">
      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <h1>
              Help shape
              <br />
              what’s next.
            </h1>
            <p>
              Post ideas and vote on what Vultisig builds next. Every wallet
              with at least 100 VULT can post, vote, and discuss.
            </p>
            <div className="trust-row">
              <span>
                <Icon name="check" />
                100 VULT to participate
              </span>
              <span>
                <Icon name="check" />
                One wallet, one vote
              </span>
              <span>
                <Icon name="check" />
                No transaction or gas
              </span>
            </div>
            <div className="hero-actions">
              <a href="#proposals" className="primary-button">
                Explore ideas <Icon name="arrow" />
              </a>
              <button className="secondary-button" onClick={openProposalForm}>
                Post an idea <Icon name="lightbulb" />
              </button>
            </div>
          </div>
          <img
            alt=""
            className="hero-art"
            fetchPriority="high"
            height="561"
            src="/hero-illustration.webp"
            width="661"
          />
        </section>

        <section className="board" id="proposals">
          <div className="board-heading">
            <h2>Feature ideas</h2>
            <p>Posted and ranked by verified VULT holders.</p>
          </div>

          <div className="stats" aria-label="Feature board statistics">
            {(
              [
                { icon: "lightbulb", label: "Ideas posted", value: proposals.length },
                { icon: "message", label: "Votes cast", value: voteCount },
                { icon: "note", label: "Notes", value: noteCount },
              ] as const
            ).map(({ icon, label, value }) => (
              <div key={label}>
                <span className="stat-chip">
                  <Icon name={icon} />
                </span>
                <div className="stat-copy">
                  <span>{label}</span>
                  <strong>{board.isLoading ? "—" : value.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="toolbar">
            <div className="tabs">
              {(Object.keys(BOARD_FILTERS) as BoardFilter[]).map((item) => (
                <button
                  aria-pressed={filter === item}
                  className={filter === item ? "active" : ""}
                  onClick={() => setFilter(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="toolbar-actions">
              <label className="search">
                <Icon name="search" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search ideas"
                  aria-label="Search ideas"
                />
              </label>
              <button className="primary-button" onClick={openProposalForm}>
                Post an idea <Icon name="lightbulb" />
              </button>
            </div>
          </div>

          {board.isLoading && (
            <div className="empty">
              <strong>Loading feature ideas…</strong>
            </div>
          )}
          {board.isError && (
            <div className="empty error-state">
              <strong>The feature board is temporarily unavailable</strong>
              <p>{errorMessage(board.error)}</p>
              <button
                className="secondary-button"
                onClick={() => board.refetch()}
              >
                Try again
              </button>
            </div>
          )}
          {board.isSuccess && (
            <div className="idea-list">
              {filtered.map((proposal) => (
                <article className="idea-card" key={proposal.id}>
                  <VoteRail proposal={proposal} onVote={vote} />
                  <div
                    className="idea-main"
                    onClick={() => openProposal(proposal)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openProposal(proposal);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="idea-title">
                      <h3>{proposal.title}</h3>
                      {proposal.status !== "none" && (
                        <span className={`status-badge ${proposal.status}`}>
                          {proposal.status}
                        </span>
                      )}
                    </div>
                    {proposal.body && <p>{proposal.body}</p>}
                    <div className="idea-meta">
                      <span>
                        <Icon name="calendar" />
                        {formatExactDate(proposal.createdAt)}
                      </span>
                      <span>
                        <Icon name="note" />
                        {proposal.noteCount.toLocaleString()}{" "}
                        {proposal.noteCount === 1 ? "note" : "notes"}
                      </span>
                      <span>
                        <Icon name="user" />
                        by {shortAddress(proposal.authorAddress)}
                      </span>
                    </div>
                  </div>
                  <button
                    aria-label={`Open ${proposal.title}`}
                    className="open-button"
                    onClick={() => openProposal(proposal)}
                  >
                    <Icon name="arrow" />
                  </button>
                </article>
              ))}
              {!filtered.length && (
                <div className="empty">
                  <strong>No ideas found</strong>
                  <p>
                    {proposals.length
                      ? "Try another tab or search term."
                      : "Be the first VULT holder to post a feature idea."}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="how" id="how-it-works">
          <div>
            <h2>From idea to signal</h2>
          </div>
          <div className="steps">
            <div>
              <b>01</b>
              <h3>Connect</h3>
              <p>
                Connect a wallet holding at least 100 VULT and sign one gasless
                login message. No transaction is sent.
              </p>
            </div>
            <div>
              <b>02</b>
              <h3>Post</h3>
              <p>
                Share a short idea. It goes live on the board instantly — no
                review queue.
              </p>
            </div>
            <div>
              <b>03</b>
              <h3>Vote & discuss</h3>
              <p>
                Upvote or downvote any idea straight from the list, and add
                notes to make the case.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <a className="brand" href="#top">
          <img src="/logo.svg" alt="" />
          <span>Vultisig</span>
        </a>
        <p>Product direction informed by VULT holders.</p>
        <span>© 2026 Vultisig</span>
      </footer>

      {selected &&
        createPortal(
          <div
            className="modal-backdrop"
            onMouseDown={() => setSelectedId(null)}
          >
            <div
              className="modal"
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="proposal-title"
            >
              <button
                aria-label="Close idea details"
                className="modal-close"
                onClick={() => setSelectedId(null)}
              >
                <Icon name="close" />
              </button>
              <div className="idea-title">
                <h2 id="proposal-title">{selected.title}</h2>
                {selected.status !== "none" && (
                  <span className={`status-badge ${selected.status}`}>
                    {selected.status}
                  </span>
                )}
              </div>
              {selected.body && (
                <p className="proposal-body">{selected.body}</p>
              )}
              <div className="idea-meta">
                <span>
                  <Icon name="calendar" />
                  {formatExactDate(selected.createdAt)}
                </span>
                <span>
                  <Icon name="user" />
                  by {shortAddress(selected.authorAddress)}
                </span>
                <span>
                  {selected.upVotes} up · {selected.downVotes} down
                </span>
              </div>
              <div className="ballot">
                <VoteRail horizontal proposal={selected} onVote={vote} />
              </div>
              <div className="note-section">
                <h4>Notes</h4>
                {notes.isLoading && <p className="muted-note">Loading notes…</p>}
                {notes.isSuccess && !notes.data.notes.length && (
                  <p className="muted-note">
                    No notes yet. Make the case for this idea.
                  </p>
                )}
                {notes.isSuccess && notes.data.notes.length > 0 && (
                  <ul className="note-list">
                    {notes.data.notes.map((note) => (
                      <li key={note.id}>
                        <div className="note-head">
                          <span>{shortAddress(note.authorAddress)}</span>
                          <span>{formatExactDate(note.createdAt)}</span>
                          {(activeSession?.isAdmin ||
                            activeSession?.address.toLowerCase() ===
                              note.authorAddress.toLowerCase()) && (
                            <button
                              aria-label="Delete note"
                              className="note-delete"
                              disabled={busy !== ""}
                              onClick={() => removeNote(note.id)}
                            >
                              <Icon name="trash" />
                            </button>
                          )}
                        </div>
                        <p>{note.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <form onSubmit={submitNote}>
                  <textarea
                    maxLength={MAX_NOTE_LENGTH}
                    name="note"
                    placeholder="Add a note…"
                    required
                    rows={3}
                  />
                  <button
                    className="secondary-button"
                    disabled={busy !== ""}
                    type="submit"
                  >
                    {busy === "note"
                      ? "Verifying wallet…"
                      : activeSession
                        ? "Add note"
                        : "Sign message & add note"}
                  </button>
                </form>
              </div>
              {activeSession?.isAdmin && (
                <div className="admin-panel">
                  <h4>Admin</h4>
                  <div className="admin-actions">
                    {selected.status !== "accepted" && (
                      <button
                        className="secondary-button success"
                        disabled={busy !== ""}
                        onClick={() => applyStatus("accepted")}
                      >
                        Accept
                      </button>
                    )}
                    {selected.status !== "declined" && (
                      <button
                        className="secondary-button danger"
                        disabled={busy !== ""}
                        onClick={() => applyStatus("declined")}
                      >
                        Decline
                      </button>
                    )}
                    {selected.status !== "none" && (
                      <button
                        className="secondary-button"
                        disabled={busy !== ""}
                        onClick={() => applyStatus("none")}
                      >
                        Clear status
                      </button>
                    )}
                    <button
                      className="secondary-button danger"
                      disabled={busy !== ""}
                      onClick={removeProposal}
                    >
                      <Icon name="trash" />
                      {busy === "idea-delete"
                        ? "Deleting…"
                        : deleteArmed
                          ? "Confirm delete"
                          : "Delete idea"}
                    </button>
                  </div>
                </div>
              )}
              {actionError && (
                <p className="action-error" role="alert">
                  {actionError}
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}

      {proposalOpen &&
        createPortal(
          <div
            className="modal-backdrop"
            onMouseDown={() => setProposalOpen(false)}
          >
            <div
              className="modal"
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-proposal-title"
            >
              <button
                aria-label="Close new idea dialog"
                className="modal-close"
                onClick={() => setProposalOpen(false)}
              >
                <Icon name="close" />
              </button>
              <h2 id="new-proposal-title">Post an idea</h2>
              <p className="modal-sub">
                Keep it short. Your idea goes live on the board immediately.
                Holders vote it up or down from there.
              </p>
              <form onSubmit={createProposal}>
                <label>
                  Idea
                  <input
                    maxLength={MAX_TITLE_LENGTH}
                    name="title"
                    required
                    minLength={MIN_TITLE_LENGTH}
                    placeholder="What should Vultisig build?"
                  />
                  <small className="field-hint">
                    Up to {MAX_TITLE_LENGTH} characters
                  </small>
                </label>
                <label>
                  Details <span className="optional">(optional)</span>
                  <textarea
                    maxLength={MAX_BODY_LENGTH}
                    name="body"
                    rows={4}
                    placeholder="Anything that helps holders understand the idea."
                  />
                  <small className="field-hint">
                    Up to {MAX_BODY_LENGTH} characters
                  </small>
                </label>
                {actionError && (
                  <p className="action-error" role="alert">
                    {actionError}
                  </p>
                )}
                <button
                  className="primary-button pill"
                  type="submit"
                  disabled={busy === "post"}
                >
                  {busy === "post"
                    ? "Verifying wallet…"
                    : activeSession
                      ? "Post idea"
                      : "Sign message & post idea"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export const App = () => (
  <I18nextProvider i18n={i18nInstance}>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <CoreProvider>
          <StyledProvider>
            <AntdProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<DefaultLayout />}>
                    <Route index element={<FeatureBoard />} />
                    <Route path="/swap" element={<SwapPage />} />
                  </Route>
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </BrowserRouter>
            </AntdProvider>
          </StyledProvider>
        </CoreProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </I18nextProvider>
);
