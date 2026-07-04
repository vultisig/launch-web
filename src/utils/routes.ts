export type RouteKey = "basePath" | "features" | "notFound" | "root" | "swap";

export const routeTree = {
  basePath: {
    path: import.meta.env.DEV ? "/" : import.meta.env.VITE_BASE_PATH,
  },
  features: { path: "/" },
  notFound: { path: "*" },
  root: { path: "/" },
  swap: { path: "/swap" },
} satisfies Record<
  RouteKey,
  { path: string; link?: (...args: string[]) => string }
>;
