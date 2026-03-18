# Vult Launch

Web frontend for the [VULT token](https://docs.vultisig.com/vultisig-token/vult) DEX — swap tokens via Uniswap V3 and claim airdrop allocations.

**Live:** [launch.vultisig.com](https://launch.vultisig.com)

## Tech Stack

- **Framework:** React 18, TypeScript ~5.9, Vite
- **Wallet:** Wagmi + Viem (WalletConnect, MetaMask, Safe connectors)
- **DEX:** Uniswap V3 SDK (swap routing, quoting, pool pricing)
- **Styling:** styled-components + Ant Design (light/dark themes)
- **Data:** Axios, React Query, Highcharts
- **i18n:** i18next (en, es, pt, it, de, hr)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Setup

```sh
npm install
cp .env.example .env
```

Fill in the `.env` values:

| Variable | Description |
|----------|-------------|
| `VITE_GRAPH_API_KEY` | TheGraph / CoinMarketCap API key |
| `VITE_WALLETCONNECT_PROJECT_ID` | [WalletConnect Cloud](https://cloud.walletconnect.com) project ID |
| `VITE_SERVER_ADDRESS` | Backend server URL (balance & price data) |
| `VITE_RPC_MAINNET` | Ethereum mainnet RPC endpoint |
| `VITE_RPC_LOCAL` | Local RPC endpoint (optional) |
| `VITE_BASE_PATH` | Base path for deployment (optional) |
| `VITE_TALK_ADDRESS` | Whitelist & attestation service URL (claim flow) |

### Development

```sh
npm run dev        # Start dev server (network-accessible via --host)
```

### Build & Preview

```sh
npm run build      # Type-check (tsc) + production build
npm run preview    # Serve the production build locally
```

### Linting & Type Checking

```sh
npm run lint       # ESLint check
npm run lint:fix   # ESLint auto-fix
npm run typecheck  # TypeScript type check (no emit)
npm run knip       # Detect unused files and exports
```

## Project Structure

```
src/
  components/     # Feature components (SwapVult, SettingsModal, ConnectModal, etc.)
  context/        # React context definitions (CoreContext)
  hooks/          # Custom hooks (useCore, useSwapVult, useGoBack, useResizeObserver)
  i18n/           # i18next config and locale files
  icons/          # SVG icon components
  layouts/        # Page layouts (DefaultLayout with header/footer)
  pages/          # Route pages (Swap, Claim, Pool, NotFound)
  providers/      # Provider wrappers (CoreProvider, AntdProvider, StyledProvider)
  storage/        # LocalStorage persistence (theme, language, currency, gas, transactions)
  styles/         # Global SCSS (fonts, normalize, resets)
  toolkits/       # Layout primitives (Stack, HStack, VStack, Button, Divider, Spin)
  utils/          # Config and helpers (api, routes, wagmi, theme, currency)
```

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | — | Redirects to `/swap` |
| `/swap` | SwapPage | Uniswap V3 token swap interface |
| `/claim` | ClaimPage | VULT token airdrop claim |
| `*` | NotFoundPage | 404 fallback |

## External Services

| Service | Usage |
|---------|-------|
| Uniswap V3 (on-chain) | Swap routing and execution |
| MetaMask Gas API | Suggested gas fees |
| CoinMarketCap | Token price quotes |
| GeckoTerminal | Pool volume data |
| Custom backend (`VITE_SERVER_ADDRESS`) | Balance queries, price aggregation |

## Path Aliases

`@` is aliased to `src/` in `vite.config.ts` and `tsconfig.app.json`:

```ts
import { SwapPage } from "@/pages/Swap";
```
