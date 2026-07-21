# Feature Board API

Integration contract for the Vultisig core apps (iOS, Android, Windows/macOS desktop, browser extension) to read and write the VULT holder feature board.

- **Base URL:** `https://launch.vultisig.com/api` (local development: `http://localhost:5173/api`)
- **Transport:** one endpoint; `GET` with an `action` query parameter for reads, `POST` with a JSON body containing `action` for writes.
- **CORS:** open (`Access-Control-Allow-Origin: *`). Auth is a Bearer header, never a cookie, so no ambient credentials exist. Native apps can ignore CORS entirely; browser contexts (extension) work without extra host permissions.
- **Content type:** `application/json` both ways.
- **Shared constants:** limits below mirror `shared/featureBoard.js` — the single source of truth for both this API and the web client.

## Eligibility

Posting an idea, voting, and adding a note require a wallet currently holding at least **100 VULT** on Ethereum mainnet (`0xb788144df611029c60b859df47e79b7726c4deba`); the server re-checks the live balance on each of those writes, and client-side balances are display-only. Deleting a note or idea is gated on authorship/admin status instead of balance. Reads are public.

## Authentication (SIWE, gasless)

Sessions are obtained by signing a SIWE message with the vault's Ethereum key (`personal_sign`). No transaction, no gas, no approvals.

1. `POST {"action":"nonce","address":"0x…"}` → `{ "message": "<SIWE message>" }`
   The message binds to the request host, so call `nonce` and `verify` against the same base URL.
2. Sign `message` with the wallet (EIP-191 personal message signature).
3. `POST {"action":"verify","message":"…","signature":"0x…"}` → `{ "token", "address", "balance", "isAdmin" }`
   Fails `403` if the wallet holds under 100 VULT.
4. Send `Authorization: Bearer <token>` on subsequent writes.

Nonces expire after 10 minutes and are single-use. Tokens live 7 days; a `401` means re-run the flow.

## Endpoints

### `GET /api?action=board`

Public. Optional `Authorization` header personalizes `myVote` and `viewer`.

```json
{
  "proposals": [
    {
      "id": "uuid",
      "title": "string",
      "body": "string (may be empty)",
      "authorAddress": "0x…",
      "createdAt": "ISO-8601",
      "upVotes": 0,
      "downVotes": 0,
      "score": 0,
      "noteCount": 0,
      "myVote": "up" | "down" | null
    }
  ],
  "viewer": { "address": "0x…", "isAdmin": false } | null,
  "rules": { "minimumVult": 100, "votingModel": "one-wallet-one-vote" }
}
```

Sorted by `score` descending, then newest. Capped at 500 rows.

### `GET /api?action=notes&proposalId=<uuid>`

Public. Returns `{ "notes": [{ "id", "authorAddress", "body", "createdAt" }] }`, oldest first, capped at 500.

### `POST {"action":"createProposal","title":"…","body":"…"}` (auth)

Title 8–120 characters; `body` optional, up to 500. Goes live immediately — there is no review state. Returns `201 { "id": "uuid" }`.

### `POST {"action":"vote","proposalId":"uuid","choice":"up"|"down"}` (auth)

Toggle semantics, one vote per wallet per proposal:
- no existing vote → records `choice`
- same `choice` again → removes the vote
- opposite `choice` → switches

Returns `200 { "myVote": "up" | "down" | null }` — the wallet's state after the call. Idempotency warning: repeating a request toggles again; treat `myVote` in the response as truth rather than retrying blindly.

### `POST {"action":"addNote","proposalId":"uuid","body":"…"}` (auth)

Plain-text note, 1–1,000 characters. Returns `201 { "note": { "id", "authorAddress", "body", "createdAt" } }`. Render as plain text — never as HTML/markdown.

### `POST {"action":"deleteNote","noteId":"uuid"}` (auth)

Allowed for the note's author or an admin. Returns `200 { "deleted": true }`.

### `POST {"action":"deleteProposal","proposalId":"uuid"}` (admin only)

Removes the proposal and cascades its votes and notes. Returns `200 { "deleted": true }`.

## Errors

Always `{ "error": "human-readable message" }` with the status telling the story:

| Status | Meaning |
|--------|---------|
| 400 | Malformed input (length caps, bad ID, bad JSON) |
| 401 | Missing/expired session — re-run the SIWE flow |
| 403 | Under 100 VULT, or admin action without admin wallet |
| 404 | Proposal/note does not exist (including deleted-while-voting races) |
| 405 | Wrong method |
| 413 | Body over 24 KB |
| 429 | Rate limited — back off and retry after a minute |
| 500 | Server fault |

## Rate limits (per wallet)

| Action | Limit |
|--------|-------|
| nonce | 10 / minute (per IP) |
| verify | 20 / minute (per IP) |
| createProposal | 5 / hour |
| vote | 60 / minute |
| addNote | 30 / hour |
| deleteNote | 30 / hour |
| deleteProposal | 30 / hour |

## Per-surface notes

- **iOS / Android / desktop:** call the API directly; sign the SIWE message with the vault's ECDSA Ethereum key through the normal keysign flow. Message signing only — surface it as such in the signing UI.
- **Browser extension:** works from extension pages/service worker via `fetch`; CORS is open and preflight (`OPTIONS`) is handled.
- **Display:** `score = upVotes − downVotes` is server-computed; render `body` and note text as plain text.
