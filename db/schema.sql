CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS auth_nonces (
  address TEXT PRIMARY KEY CHECK (address ~ '^0x[0-9a-f]{40}$'),
  nonce TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  address TEXT NOT NULL CHECK (address ~ '^0x[0-9a-f]{40}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_address_idx ON sessions(address);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limits_expiry_idx ON rate_limits(expires_at);

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(160) NOT NULL CHECK (char_length(title) BETWEEN 8 AND 160),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 24 AND 10000),
  author_address TEXT NOT NULL CHECK (author_address ~ '^0x[0-9a-f]{40}$'),
  moderation_state TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_state IN ('pending', 'approved', 'rejected')),
  voting_starts_at TIMESTAMPTZ,
  voting_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (moderation_state <> 'approved') OR
    (voting_starts_at IS NOT NULL AND voting_ends_at > voting_starts_at)
  )
);
CREATE INDEX IF NOT EXISTS proposals_state_idx
  ON proposals(moderation_state, voting_starts_at, voting_ends_at);

CREATE TABLE IF NOT EXISTS votes (
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  voter_address TEXT NOT NULL CHECK (voter_address ~ '^0x[0-9a-f]{40}$'),
  choice TEXT NOT NULL CHECK (choice IN ('for', 'against', 'abstain')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (proposal_id, voter_address)
);
CREATE INDEX IF NOT EXISTS votes_proposal_idx ON votes(proposal_id);
