import { createConfig, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const connectors = [
  injected({
    target: {
      id: "vultisig",
      name: "Vultisig",
      provider: (window) =>
        (window as Window & { vultisig?: { ethereum?: any } })?.vultisig
          ?.ethereum,
    },
  }),
  ...(walletConnectProjectId
    ? [walletConnect({ projectId: walletConnectProjectId })]
    : []),
  metaMask(),
  safe(),
];

export const wagmiConfig = createConfig({
  chains: [mainnet, base],
  connectors,
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
