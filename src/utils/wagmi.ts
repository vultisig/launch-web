import { createConfig, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { metaMask, safe, walletConnect } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [mainnet, base],
  connectors: [
    walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
