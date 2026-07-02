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
import { formatUnits } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSignMessage,
  WagmiProvider,
} from "wagmi";
import { mainnet } from "wagmi/chains";

import { useCore } from "@/hooks/useCore";
import { i18nInstance } from "@/i18n/config";
import { DefaultLayout } from "@/layouts/Default";
import { NotFoundPage } from "@/pages/NotFound";
import { SwapPage } from "@/pages/Swap";
import { AntdProvider } from "@/providers/antd";
import { CoreProvider } from "@/providers/core";
import { StyledProvider } from "@/providers/styled";
import {
  createFeatureProposal,
  type FeatureProposal,
  fetchBoard,
  formatExactDate,
  moderateProposal,
  type Session,
  signIn,
  submitVote,
  type VoteChoice,
} from "@/services/featureBoard";
import { wagmiConfig } from "@/utils/wagmi";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 15_000 } },
});
const MIN_VULT = 100;
const MAX_TITLE_LENGTH = 160;
const MAX_BODY_LENGTH = 10_000;
const VULT_CONTRACT = "0xb788144df611029c60b859df47e79b7726c4deba" as const;
const SESSION_KEY = "vultisig-feature-board-session";

const tokenAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

type IconName =
  | "search"
  | "arrow"
  | "check"
  | "users"
  | "clock"
  | "plus"
  | "close";
function Icon({ name }: { name: IconName }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const readSession = (): Session | null => {
  try {
    const value = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return value?.token && value?.address ? value : null;
  } catch {
    return null;
  }
};

const statusLabel = (proposal: FeatureProposal) =>
  ({
    pending: "Pending review",
    rejected: "Rejected",
    upcoming: "Upcoming",
    active: "Active",
    closed: "Closed",
  })[proposal.state];

const timingLabel = (proposal: FeatureProposal) => {
  if (proposal.state === "pending")
    return `Submitted ${formatExactDate(proposal.createdAt)}`;
  if (proposal.state === "rejected") return "Not selected for voting";
  if (proposal.state === "upcoming")
    return `Starts ${formatExactDate(proposal.startsAt!)}`;
  if (proposal.state === "active")
    return `Ends ${formatExactDate(proposal.endsAt!)}`;
  return `Ended ${formatExactDate(proposal.endsAt!)}`;
};

const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";

function FeatureBoard() {
  const { setCurrentPage } = useCore();
  useEffect(() => {
    document.title = "Vultisig Feature Board";
    setCurrentPage("features");
  }, [setCurrentPage]);

  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [session, setSession] = useState<Session | null>(readSession);
  const [walletOpen, setWalletOpen] = useState(false);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [selected, setSelected] = useState<FeatureProposal | null>(null);
  const [choice, setChoice] = useState<VoteChoice | null>(null);
  const [tab, setTab] = useState<"All" | "Active" | "Upcoming" | "Closed">(
    "All",
  );
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
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
  const { data: rawBalance, isLoading: balanceLoading } = useReadContract({
    address: VULT_CONTRACT,
    abi: tokenAbi,
    chainId: mainnet.id,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
  const balance =
    rawBalance === undefined ? 0 : Number(formatUnits(rawBalance, 18));

  const authenticate = async () => {
    if (!address) throw new Error("Connect a wallet first");
    if (activeSession) return activeSession;
    const next = await signIn(address, (message) =>
      signMessageAsync({ message }),
    );
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
    await queryClient.invalidateQueries({ queryKey: ["feature-board"] });
    return next;
  };

  const proposals = board.data?.proposals ?? [];
  const filtered = useMemo(
    () =>
      proposals.filter((proposal) => {
        const statusMatches = tab === "All" || statusLabel(proposal) === tab;
        const queryMatches = `${proposal.title} ${proposal.body}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return statusMatches && queryMatches;
      }),
    [proposals, query, tab],
  );
  const activeCount = proposals.filter(
    (proposal) => proposal.state === "active",
  ).length;
  const upcomingCount = proposals.filter(
    (proposal) => proposal.state === "upcoming",
  ).length;
  const ballotCount = proposals.reduce(
    (sum, proposal) => sum + proposal.voteCount,
    0,
  );

  const openProposalForm = () => {
    setActionError("");
    if (!isConnected) setWalletOpen(true);
    else setProposalOpen(true);
  };

  const createProposal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setActionError("");
    try {
      const authenticated = await authenticate();
      const data = new FormData(event.currentTarget);
      await createFeatureProposal(
        authenticated.token,
        String(data.get("title") || "").trim(),
        String(data.get("body") || "").trim(),
      );
      event.currentTarget.reset();
      setProposalOpen(false);
      await board.refetch();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const vote = async () => {
    if (!selected || !choice) return;
    setSubmitting(true);
    setActionError("");
    try {
      const authenticated = await authenticate();
      await submitVote(authenticated.token, selected.id, choice);
      await board.refetch();
      setSelected((current) =>
        current ? { ...current, myVote: choice } : current,
      );
      setChoice(null);
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const moderate = async (
    event: FormEvent<HTMLFormElement>,
    moderationState: "approved" | "rejected",
  ) => {
    event.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setActionError("");
    try {
      const authenticated = await authenticate();
      const data = new FormData(event.currentTarget);
      await moderateProposal(
        authenticated.token,
        selected.id,
        moderationState,
        String(data.get("startsAt") || ""),
        String(data.get("endsAt") || ""),
      );
      setSelected(null);
      await board.refetch();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const rejectProposal = async () => {
    if (!selected) return;
    setSubmitting(true);
    setActionError("");
    try {
      const authenticated = await authenticate();
      await moderateProposal(authenticated.token, selected.id, "rejected");
      setSelected(null);
      await board.refetch();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setSubmitting(false);
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
            Suggest improvements and vote on upcoming Vultisig features. Every
            wallet with at least 100 VULT gets one vote.
          </p>
          <div className="hero-actions">
            <a href="#proposals" className="primary-button">
              Explore proposals <Icon name="arrow" />
            </a>
            <button className="text-button" onClick={openProposalForm}>
              Submit an idea
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
            <span>Proposals</span>
          </div>
          <div>
            <strong>{board.isLoading ? "—" : activeCount}</strong>
            <span>Active votes</span>
          </div>
          <div>
            <strong>{board.isLoading ? "—" : upcomingCount}</strong>
            <span>Upcoming</span>
          </div>
          <div>
            <strong>
              {board.isLoading ? "—" : ballotCount.toLocaleString()}
            </strong>
            <span>Ballots cast</span>
          </div>
        </section>

        <section className="proposals-section" id="proposals">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span />
                Community input
              </div>
              <h2>Feature proposals</h2>
              <p>Ideas submitted and voted on by verified VULT holders.</p>
            </div>
            <button className="secondary-button" onClick={openProposalForm}>
              <Icon name="plus" />
              New proposal
            </button>
          </div>
          <div className="toolbar">
            <div className="tabs">
              {(["All", "Active", "Upcoming", "Closed"] as const).map(
                (item) => (
                  <button
                    className={tab === item ? "active" : ""}
                    onClick={() => setTab(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <label className="search">
              <Icon name="search" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search proposals"
                aria-label="Search proposals"
              />
            </label>
          </div>
          {board.isLoading && (
            <div className="empty">
              <strong>Loading feature proposals…</strong>
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
              {filtered.map((proposal) => {
                const decided = proposal.forVotes + proposal.againstVotes;
                const forPercent = decided
                  ? Math.round((proposal.forVotes / decided) * 100)
                  : 0;
                return (
                  <article
                    className="proposal-card"
                    key={proposal.id}
                    onClick={() => {
                      setSelected(proposal);
                      setActionError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelected(proposal);
                      }
                    }}
                    tabIndex={0}
                  >
                    <div className="proposal-main">
                      <div className="proposal-meta">
                        <span className={`badge ${proposal.state}`}>
                          {statusLabel(proposal)}
                        </span>
                        {proposal.moderationState === "pending" && (
                          <span>Only visible to you and admins</span>
                        )}
                      </div>
                      <h3>{proposal.title}</h3>
                      <p>{proposal.body}</p>
                      <div className="proposal-foot">
                        <span>
                          <Icon name="clock" />
                          {timingLabel(proposal)}
                        </span>
                        <span>
                          <Icon name="users" />
                          {proposal.voteCount.toLocaleString()} ballots
                        </span>
                        <span>
                          by{" "}
                          {`${proposal.authorAddress.slice(0, 6)}...${proposal.authorAddress.slice(-4)}`}
                        </span>
                      </div>
                    </div>
                    <div className="vote-summary">
                      {proposal.state === "pending" ? (
                        <div className="upcoming-mark">
                          <span>Moderation</span>
                          <strong>Awaiting review</strong>
                        </div>
                      ) : proposal.state === "upcoming" ? (
                        <div className="upcoming-mark">
                          <span>Scheduled</span>
                          <strong>{formatExactDate(proposal.startsAt!)}</strong>
                        </div>
                      ) : (
                        <>
                          <div className="vote-label">
                            <span>For</span>
                            <strong>{forPercent}%</strong>
                          </div>
                          <div className="progress">
                            <span style={{ width: `${forPercent}%` }} />
                          </div>
                          <div className="vote-label muted">
                            <span>Against</span>
                            <span>{100 - forPercent}%</span>
                          </div>
                        </>
                      )}
                      <button aria-label={`View ${proposal.title}`}>
                        <Icon name="arrow" />
                      </button>
                    </div>
                  </article>
                );
              })}
              {!filtered.length && (
                <div className="empty">
                  <strong>No proposals found</strong>
                  <p>
                    {proposals.length
                      ? "Try another status or search term."
                      : "Be the first VULT holder to submit a feature idea."}
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
                Connect a wallet holding at least 100 VULT and sign a gasless
                login message.
              </p>
            </div>
            <div>
              <b>02</b>
              <h3>Suggest</h3>
              <p>
                Submit an idea. Vultisig reviews it for clarity and schedules
                the voting window.
              </p>
            </div>
            <div>
              <b>03</b>
              <h3>Vote</h3>
              <p>
                Cast one vote per wallet. You can update your choice while
                voting is open.
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

      {walletOpen &&
        createPortal(
          <div
            className="modal-backdrop"
            onMouseDown={() => setWalletOpen(false)}
          >
            <div
              className="modal wallet-modal"
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="wallet-title"
            >
              <button
                aria-label="Close wallet dialog"
                className="modal-close"
                onClick={() => setWalletOpen(false)}
              >
                <Icon name="close" />
              </button>
              <div className="modal-kicker">Wallet access</div>
              <h2 id="wallet-title">
                {isConnected
                  ? "Your feature-board wallet"
                  : "Connect to participate"}
              </h2>
              <p>
                {isConnected
                  ? "Your VULT stays in your wallet. Signing in only proves wallet ownership."
                  : "Connect the Ethereum wallet holding your VULT. No assets or approvals are requested."}
              </p>
              {isConnected ? (
                <>
                  <div className="balance-card">
                    <span>{address}</span>
                    <strong>
                      {balanceLoading
                        ? "Checking…"
                        : balance.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}{" "}
                      <small>VULT</small>
                    </strong>
                    <i>
                      <Icon name="check" />
                      {activeSession
                        ? "Signed in"
                        : balance >= MIN_VULT
                          ? "Eligible—sign when you propose or vote"
                          : `${MIN_VULT} VULT required`}
                    </i>
                  </div>
                  <button
                    className="secondary-button full"
                    onClick={() => {
                      disconnect();
                      localStorage.removeItem(SESSION_KEY);
                      setSession(null);
                      setWalletOpen(false);
                    }}
                  >
                    Disconnect wallet
                  </button>
                </>
              ) : (
                <div className="connector-list">
                  {connectors
                    .filter((connector) => connector.name !== "Safe")
                    .map((connector) => (
                      <button
                        key={connector.uid}
                        disabled={connecting}
                        onClick={() =>
                          connect(
                            { connector },
                            { onSuccess: () => setWalletOpen(false) },
                          )
                        }
                      >
                        {connector.icon ? (
                          <img
                            className="connector-image"
                            src={connector.icon}
                            alt=""
                          />
                        ) : (
                          <span className="connector-icon">
                            {connector.name[0]}
                          </span>
                        )}
                        <b>{connector.name}</b>
                        <Icon name="arrow" />
                      </button>
                    ))}
                </div>
              )}
              <small className="privacy-note">
                Eligibility is verified again by the server whenever you submit
                or vote.
              </small>
            </div>
          </div>,
          document.body,
        )}

      {selected &&
        createPortal(
          <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
            <div
              className="modal proposal-modal"
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="proposal-title"
            >
              <button
                aria-label="Close proposal details"
                className="modal-close"
                onClick={() => setSelected(null)}
              >
                <Icon name="close" />
              </button>
              <div className="proposal-meta">
                <span className={`badge ${selected.state}`}>
                  {statusLabel(selected)}
                </span>
              </div>
              <h2 id="proposal-title">{selected.title}</h2>
              <p className="proposal-body">{selected.body}</p>
              <div className="detail-box">
                <h4>
                  {selected.state === "pending"
                    ? "Submission"
                    : "Voting window"}
                </h4>
                <p>
                  {selected.state === "pending" ? (
                    `Submitted ${formatExactDate(selected.createdAt)}. Vultisig will review and schedule it.`
                  ) : (
                    <>
                      <strong>Starts:</strong>{" "}
                      {formatExactDate(selected.startsAt!)}
                      <br />
                      <strong>Ends:</strong> {formatExactDate(selected.endsAt!)}
                    </>
                  )}
                </p>
              </div>
              <div className="result-list">
                {(["for", "against", "abstain"] as VoteChoice[]).map((item) => {
                  const count =
                    item === "for"
                      ? selected.forVotes
                      : item === "against"
                        ? selected.againstVotes
                        : selected.abstainVotes;
                  const percent = selected.voteCount
                    ? Math.round((count / selected.voteCount) * 100)
                    : 0;
                  return (
                    <div className="result-row" key={item}>
                      <div>
                        <span>{item[0].toUpperCase() + item.slice(1)}</span>
                        <strong>{percent}%</strong>
                      </div>
                      <div className="progress">
                        <span style={{ width: `${percent}%` }} />
                      </div>
                      <small>{count} wallets</small>
                    </div>
                  );
                })}
              </div>
              {selected.state === "active" && (
                <div className="ballot">
                  <h4>
                    {selected.myVote ? "Update your vote" : "Cast your vote"}
                  </h4>
                  <div className="vote-options dynamic">
                    {(["for", "against", "abstain"] as VoteChoice[]).map(
                      (item) => (
                        <button
                          className={
                            (choice || selected.myVote) === item
                              ? "selected"
                              : ""
                          }
                          onClick={() => setChoice(item)}
                          key={item}
                        >
                          <span>{item[0].toUpperCase() + item.slice(1)}</span>
                          <small>One wallet, one vote</small>
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    className="primary-button full"
                    disabled={!choice || submitting}
                    onClick={vote}
                  >
                    {submitting
                      ? "Verifying wallet…"
                      : activeSession
                        ? "Submit vote"
                        : "Sign in & submit vote"}
                  </button>
                </div>
              )}
              {activeSession?.isAdmin && selected.state === "pending" && (
                <form
                  className="admin-panel"
                  onSubmit={(event) => moderate(event, "approved")}
                >
                  <h4>Admin review</h4>
                  <div className="date-grid">
                    <label>
                      Voting starts
                      <input name="startsAt" type="datetime-local" required />
                    </label>
                    <label>
                      Voting ends
                      <input name="endsAt" type="datetime-local" required />
                    </label>
                  </div>
                  <div className="admin-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={submitting}
                      onClick={rejectProposal}
                    >
                      Reject
                    </button>
                    <button
                      className="primary-button"
                      type="submit"
                      disabled={submitting}
                    >
                      Approve & schedule
                    </button>
                  </div>
                </form>
              )}
              {actionError && (
                <p className="action-error" role="alert">
                  {actionError}
                </p>
              )}
              <div className="modal-footer-row">
                <span>{selected.voteCount.toLocaleString()} ballots</span>
                <strong>One wallet = one vote</strong>
              </div>
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
                aria-label="Close new proposal dialog"
                className="modal-close"
                onClick={() => setProposalOpen(false)}
              >
                <Icon name="close" />
              </button>
              <div className="modal-kicker">Feature proposal</div>
              <h2 id="new-proposal-title">Bring an idea forward</h2>
              <p>
                Describe the user problem and desired outcome. Vultisig will
                review it before scheduling a vote.
              </p>
              <form onSubmit={createProposal}>
                <label>
                  Proposal title
                  <input
                    maxLength={MAX_TITLE_LENGTH}
                    name="title"
                    required
                    minLength={8}
                    placeholder="What should Vultisig build?"
                  />
                  <small className="field-hint">
                    Up to {MAX_TITLE_LENGTH} characters
                  </small>
                </label>
                <label>
                  Full proposal
                  <textarea
                    maxLength={MAX_BODY_LENGTH}
                    name="body"
                    required
                    minLength={24}
                    rows={8}
                    placeholder="Describe the problem, proposed change, tradeoffs, and success criteria."
                  />
                  <small className="field-hint">
                    Up to {MAX_BODY_LENGTH.toLocaleString()} characters
                  </small>
                </label>
                <div className="form-note">
                  <Icon name="check" />
                  Submitted for Vultisig review before voting
                </div>
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
                      ? "Submit for review"
                      : "Sign in & submit for review"}
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
