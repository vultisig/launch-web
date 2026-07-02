import { createConfig, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { metaMask, safe, walletConnect } from "wagmi/connectors";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const connectors = [
  ...(walletConnectProjectId
    ? [walletConnect({ projectId: walletConnectProjectId })]
    : []),
  metaMask(),
  safe(),
];

export const wagmiConfig = createConfig({
  chains: [mainnet, base],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
