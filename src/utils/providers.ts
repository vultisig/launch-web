import { BrowserProvider, JsonRpcProvider, Provider } from "ethers/providers";

export const getBrowserProvider = (): Provider => {
  return new BrowserProvider(window.ethereum);
};

export const getRPCProvider = (): Provider => {
  return new JsonRpcProvider(`${import.meta.env.VITE_SERVER_ADDRESS}/eth/`);
};
