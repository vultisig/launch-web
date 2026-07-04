# Vultisig Feature Board

A wallet-gated product-feedback board for VULT holders, integrated into Vultisig Launch. The feature board is the primary `/` page and the existing swap remains available at `/swap`; the unused Pool and Claim navigation is removed. This is intentionally not a governance protocol: proposals and votes inform Vultisig's product roadmap, while the Vultisig team retains moderation and scheduling control.

## Product rules

- A wallet must currently hold at least 100 VULT on Ethereum to submit or vote.
- Each eligible wallet gets one vote per proposal.
- Voters can update their choice while voting remains open.
- New proposals are private to their author and admins until approved.
- Admins approve or reject submissions and set exact voting start/end dates.
- Wallet login uses a gasless signed message. No token approvals or transactions are requested.

The server independently verifies signatures and VULT balances. Client-side balance displays are never trusted for authorization.

## Stack

- React, Vite, Wagmi and Viem
- One Vercel Function at `/api`
- Neon serverless Postgres
- Ethereum RPC for current VULT balances

## Local setup

1. Create a Neon database through the Vercel Marketplace or Neon dashboard.
2. Copy `.env.example` to `.env.local` and configure:

```env
DATABASE_URL=postgresql://...
ETHEREUM_RPC_URL=https://...
ADMIN_WALLETS=0xAdminAddress,0xSecondAdmin
VITE_WALLETCONNECT_PROJECT_ID=your_reown_project_id
```

`ADMIN_WALLETS` is a comma-separated list of team-controlled Ethereum addresses. It does not custody funds; it only grants moderation controls in this application.

3. Apply the schema and start both the API and web app:

```bash
npm install
npm run db:schema
npm run dev
```

Open `http://localhost:5173`.

## Production deployment

1. Link the repository to Vercel.
2. Add Neon from the Vercel Marketplace so `DATABASE_URL` is provisioned.
3. Add `ETHEREUM_RPC_URL`, `ADMIN_WALLETS`, and `VITE_WALLETCONNECT_PROJECT_ID` for Production and Preview.
4. Run `npm run db:schema` once against the production database.
5. Deploy and test with one admin wallet and one eligible holder wallet.

No ENS name, Snapshot space, governance wallet, smart contract, or treasury setup is required.

## Security model

- Nonces expire after 10 minutes and are consumed once.
- Sessions are random, hashed in storage, and expire after seven days.
- Proposal/vote writes re-check the live VULT balance server-side.
- Database constraints prevent duplicate votes and invalid proposal states.
- Auth, proposal and vote endpoints are rate-limited.
- User content is rendered as plain text; React escapes it by default.
- Bearer-token writes are not vulnerable to cross-site request forgery.

## Release checks

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

The SQL schema is stored in `db/schema.sql`; the API is in `api/core.mjs`.
