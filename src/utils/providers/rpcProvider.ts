import { JsonRpcProvider, Provider } from "ethers";

export const getRPCProvider = (): Provider => {
  return new JsonRpcProvider(`${import.meta.env.VITE_SERVER_ADDRESS}/eth/`);
};
