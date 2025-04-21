export default {
  root: "/",
  basePath: import.meta.env.DEV ? "/" : import.meta.env.VITE_BASE_PATH,
  merge: "/merge",
  settings: "/settings",
  swap: "/swap",
  staking: "/staking",
  stakingStake: "/staking/stake",
  stakingWithdraw: "/staking/withdraw",
  wallet: "/wallet",
};
