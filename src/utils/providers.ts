import { BrowserProvider, JsonRpcProvider, Provider } from "ethers/providers";

export const getBrowserProvider = (): Promise<Provider> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.ethereum) {
      resolve(new BrowserProvider(window.ethereum));
    } else {
      const checkProvider = setInterval(() => {
        if (window.ethereum) {
          clearInterval(checkProvider);
          resolve(new BrowserProvider(window.ethereum));
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkProvider);
        reject(new Error("Ethereum provider is not available."));
      }, 5000);
    }
  });
};

export const getRPCProvider = (): Provider => {
  return new JsonRpcProvider(`https://eth.llamarpc.com/`); //${import.meta.env.VITE_SERVER_ADDRESS}/eth/
};
