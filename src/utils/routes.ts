export type RouteKey =
  | "basePath"
  | "claim"
  | "notFound"
  | "pool"
  | "root"
  | "swap";

export const routeTree = {
  basePath: {
    path: import.meta.env.DEV ? "/" : import.meta.env.VITE_BASE_PATH,
  },
  claim: { path: "/claim" },
  notFound: { path: "*" },
  pool: { path: "/pool" },
  root: { path: "/" },
  swap: { path: "/swap" },
} satisfies Record<
  RouteKey,
  { path: string; link?: (...args: string[]) => string }
>;
