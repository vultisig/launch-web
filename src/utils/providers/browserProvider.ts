import { BrowserProvider, Provider } from "ethers/providers";

export const getBrowserProvider = (): Provider => {
  return new BrowserProvider(window.ethereum);
};
