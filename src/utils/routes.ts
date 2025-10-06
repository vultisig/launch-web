export type RouteKey =
  | "basePath"
  | "merge"
  | "notFound"
  | "pool"
  | "root"
  | "settings"
  | "swap"
  | "staking"
  | "stakingStake"
  | "stakingWithdraw"
  | "wallet";

export const routeTree = {
  basePath: {
    path: import.meta.env.DEV ? "/" : import.meta.env.VITE_BASE_PATH,
  },
  merge: { path: "/merge" },
  notFound: { path: "*" },
  pool: { path: "/pool" },
  root: { path: "/" },
  settings: { path: "/settings" },
  swap: { path: "/swap" },
  staking: { path: "/staking" },
  stakingStake: { path: "/stakingStake" },
  stakingWithdraw: { path: "/stakingWithdraw" },
  wallet: { path: "/wallet" },
} satisfies Record<
  RouteKey,
  { path: string; link?: (...args: string[]) => string }
>;
