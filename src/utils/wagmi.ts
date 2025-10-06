import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { metaMask, safe, walletConnect } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
  },
});
