import "@/styles/governance.scss";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { CheckIcon } from "@/icons/CheckIcon";
import { ChevronDownIcon } from "@/icons/ChevronDownIcon";
import { ChevronRightIcon } from "@/icons/ChevronRightIcon";
import { CrossIcon } from "@/icons/CrossIcon";
import { PlusIcon } from "@/icons/PlusIcon";
import { SearchIcon } from "@/icons/SearchIcon";
import { TimerIcon } from "@/icons/TimerIcon";
import { TrashIcon } from "@/icons/TrashIcon";
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
  type Session,
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

type IconName =
  | "search"
  | "arrow"
  | "check"
  | "clock"
  | "plus"
  | "close"
  | "chevron-down"
  | "trash";
function Icon({ name }: { name: IconName }) {
  const icons = {
    search: SearchIcon,
    arrow: ChevronRightIcon,
    check: CheckIcon,
    clock: TimerIcon,
    plus: PlusIcon,
    close: CrossIcon,
    "chevron-down": ChevronDownIcon,
    trash: TrashIcon,
  };
  const Component = icons[name];
  return <Component aria-hidden="true" />;
}

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
  const [sort, setSort] = useState<"Top" | "New">("Top");
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [voteOverrides, setVoteOverrides] = useState<Record<string, VoteChoice | null>>({});
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

  const proposals = useMemo(
    () =>
      (board.data?.proposals ?? []).map((proposal) =>
        proposal.id in voteOverrides
          ? withVote(proposal, voteOverrides[proposal.id] ?? null)
          : proposal,
      ),
    [board.data?.proposals, voteOverrides],
  );
  const filtered = useMemo(() => {
    const matching = proposals.filter((proposal) =>
      `${proposal.title} ${proposal.body}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
    return sort === "New"
      ? [...matching].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      : matching;
  }, [proposals, query, sort]);
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

  const createProposal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const body = String(data.get("body") || "").trim();
    setSubmitting(true);
    setActionError("");
    try {
      const authenticated = await authenticate();
      await createFeatureProposal(authenticated.token, title, body);
      form.reset();
      setProposalOpen(false);
      await board.refetch();
    } catch (error) {
      handleActionError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const vote = async (proposal: FeatureProposal, choice: VoteChoice) => {
    if (!isConnected) {
      window.location.hash = modalHash.connect;
      return;
    }
    setActionError("");
    try {
      const authenticated = await authenticate();
      setVoteOverrides((current) => ({
        ...current,
        [proposal.id]: nextVote(proposal.myVote, choice),
      }));
      const { myVote } = await toggleVote(authenticated.token, proposal.id, choice);
      queryClient.setQueryData<BoardResponse>(
        ["feature-board", authenticated.token],
        (data) =>
          data && {
            ...data,
            proposals: data.proposals.map((item) =>
              item.id === proposal.id ? withVote(item, myVote) : item,
            ),
          },
      );
    } catch (error) {
      handleActionError(error);
      await board.refetch();
    } finally {
      setVoteOverrides((current) => {
        const rest = { ...current };
        delete rest[proposal.id];
        return rest;
      });
    }
  };

  const submitNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const form = event.currentTarget;
    const body = String(new FormData(form).get("note") || "").trim();
    if (!body) return;
    setSubmitting(true);
    setActionError("");
    try {
      const authenticated = await authenticate();
      await addNote(authenticated.token, selected.id, body);
      form.reset();
      await Promise.all([notes.refetch(), board.refetch()]);
    } catch (error) {
      handleActionError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const removeNote = async (noteId: string) => {
    setSubmitting(true);
    setActionError("");
    try {
      const authenticated = await authenticate();
      await deleteNote(authenticated.token, noteId);
      await Promise.all([notes.refetch(), board.refetch()]);
    } catch (error) {
      handleActionError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const removeProposal = async () => {
    if (!selected) return;
    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }
    setSubmitting(true);
    setActionError("");
    try {
      const authenticated = await authenticate();
      await deleteProposal(authenticated.token, selected.id);
      setSelectedId(null);
      await board.refetch();
    } catch (error) {
      handleActionError(error);
    } finally {
      setSubmitting(false);
      setDeleteArmed(false);
    }
  };

  return (
    <div className="governance-app">
      <main id="top">
        <section className="hero">
          <div className="eyebrow">
            <span />
            Vultisig holder feature board
          </div>
          <h1>
            Help shape
            <br />
            <em>what’s next.</em>
          </h1>
          <p>
            Post ideas and vote on what Vultisig builds next. Every wallet with
            at least 100 VULT can post, vote, and discuss — no review queue.
          </p>
          <div className="hero-actions">
            <a href="#proposals" className="primary-button">
              Explore ideas <Icon name="arrow" />
            </a>
            <button className="text-button" onClick={openProposalForm}>
              Post an idea
            </button>
          </div>
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
          <div className="hero-orbit" aria-hidden="true">
            <div className="orb">
              <img src="/logo.svg" alt="" />
            </div>
            <div className="ring one" />
            <div className="ring two" />
            <span className="node n1" />
            <span className="node n2" />
            <span className="node n3" />
          </div>
        </section>

        <section className="stats" aria-label="Feature board statistics">
          <div>
            <strong>
              {board.isLoading ? "—" : proposals.length.toLocaleString()}
            </strong>
            <span>Ideas</span>
          </div>
          <div>
            <strong>{board.isLoading ? "—" : voteCount.toLocaleString()}</strong>
            <span>Votes cast</span>
          </div>
          <div>
            <strong>{board.isLoading ? "—" : noteCount.toLocaleString()}</strong>
            <span>Notes</span>
          </div>
        </section>

        <section className="proposals-section" id="proposals">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span />
                Community input
              </div>
              <h2>Feature ideas</h2>
              <p>Posted and ranked by verified VULT holders.</p>
            </div>
            <button className="secondary-button" onClick={openProposalForm}>
              <Icon name="plus" />
              Post idea
            </button>
          </div>
          <div className="toolbar">
            <div className="tabs">
              {(["Top", "New"] as const).map((item) => (
                <button
                  className={sort === item ? "active" : ""}
                  onClick={() => setSort(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="search">
              <Icon name="search" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ideas"
                aria-label="Search ideas"
              />
            </label>
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
            <div className="proposal-list">
              {filtered.map((proposal) => (
                <article className="proposal-card" key={proposal.id}>
                  <div className="vote-rail">
                    <button
                      aria-label={`Upvote ${proposal.title}`}
                      aria-pressed={proposal.myVote === "up"}
                      className={`vote-button up ${proposal.myVote === "up" ? "active" : ""}`}
                      onClick={() => vote(proposal, "up")}
                    >
                      <Icon name="chevron-down" />
                    </button>
                    <strong className="score">{proposal.score}</strong>
                    <button
                      aria-label={`Downvote ${proposal.title}`}
                      aria-pressed={proposal.myVote === "down"}
                      className={`vote-button down ${proposal.myVote === "down" ? "active" : ""}`}
                      onClick={() => vote(proposal, "down")}
                    >
                      <Icon name="chevron-down" />
                    </button>
                  </div>
                  <div
                    className="proposal-main"
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
                    <h3>{proposal.title}</h3>
                    {proposal.body && <p>{proposal.body}</p>}
                    <div className="proposal-foot">
                      <span>
                        <Icon name="clock" />
                        {formatExactDate(proposal.createdAt)}
                      </span>
                      <span>
                        {proposal.noteCount.toLocaleString()}{" "}
                        {proposal.noteCount === 1 ? "note" : "notes"}
                      </span>
                      <span>by {shortAddress(proposal.authorAddress)}</span>
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
                      ? "Try another search term."
                      : "Be the first VULT holder to post a feature idea."}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="how" id="how-it-works">
          <div>
            <div className="eyebrow">
              <span />
              Simple by design
            </div>
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
              className="modal proposal-modal"
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
              <h2 id="proposal-title">{selected.title}</h2>
              {selected.body && (
                <p className="proposal-body">{selected.body}</p>
              )}
              <div className="proposal-foot">
                <span>
                  <Icon name="clock" />
                  {formatExactDate(selected.createdAt)}
                </span>
                <span>by {shortAddress(selected.authorAddress)}</span>
                <span>
                  {selected.upVotes} up · {selected.downVotes} down
                </span>
              </div>
              <div className="ballot">
                <div className="vote-rail horizontal">
                  <button
                    aria-pressed={selected.myVote === "up"}
                    className={`vote-button up ${selected.myVote === "up" ? "active" : ""}`}
                    onClick={() => vote(selected, "up")}
                  >
                    <Icon name="chevron-down" />
                    Upvote
                  </button>
                  <strong className="score">{selected.score}</strong>
                  <button
                    aria-pressed={selected.myVote === "down"}
                    className={`vote-button down ${selected.myVote === "down" ? "active" : ""}`}
                    onClick={() => vote(selected, "down")}
                  >
                    <Icon name="chevron-down" />
                    Downvote
                  </button>
                </div>
              </div>
              <div className="note-section">
                <h4>Notes</h4>
                {notes.isLoading && <p className="ballot-note">Loading notes…</p>}
                {notes.isSuccess && !notes.data.notes.length && (
                  <p className="ballot-note">
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
                              disabled={submitting}
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
                    disabled={submitting}
                    type="submit"
                  >
                    {submitting
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
                  <button
                    className="secondary-button danger"
                    disabled={submitting}
                    onClick={removeProposal}
                  >
                    <Icon name="trash" />
                    {deleteArmed ? "Confirm delete" : "Delete idea"}
                  </button>
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
              className="modal proposal-modal"
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
              <div className="modal-kicker">Feature idea</div>
              <h2 id="new-proposal-title">Post an idea</h2>
              <p>
                Keep it short. Your idea goes live on the board immediately —
                holders vote it up or down from there.
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
                    placeholder="Anything that helps holders judge the idea."
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
                  className="primary-button full"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
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
