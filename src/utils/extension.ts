import { VultisigWalletProps } from "./types";

const isAvailable = async () => {
  if (!window.vultisig) throw new Error("Please install Vultisig Extension");

  return;
};

export const vultisigConnect = async (): Promise<
  VultisigWalletProps & { account: string }
> => {
  await isAvailable();

  try {
    const [account]: string[] = await window.vultisig.ethereum.request({
      method: "eth_requestAccounts",
    });
    const wallet = (await window.vultisig.getVault()) as VultisigWalletProps;

    return { account, ...wallet };
  } catch {
    throw new Error("Connection failed");
  }
};

export const vultisigPersonalSign = async (
  message: string,
  account: string
) => {
  await isAvailable();

  return await window.vultisig.ethereum.request({
    method: "personal_sign",
    params: [message, account],
  });
};

export const vultisigDisconnect = async () => {
  await isAvailable();

  await window.vultisig.ethereum.request({
    method: "wallet_revokePermissions",
  });
};
