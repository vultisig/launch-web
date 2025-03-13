import { useState, useEffect, useCallback } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { useAccount, useWalletClient } from "wagmi";

import { encodeFunctionData, erc20Abi } from "viem";
import { rootApiAddress } from "utils/api";

const useTokenApproval = (
  tokenAddress: string,
  spenderAddress: string,
  amount?: number
) => {
  const { address } = useAccount();

  const { data: walletClient } = useWalletClient();
  const [approvedAmount, setApprovedAmount] = useState(BigInt(0));
  const [isApproving, setIsApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  const rpcClient = new JsonRpcProvider(`${rootApiAddress}/eth/`);

  const checkApproval = useCallback(async () => {
    if (!walletClient || !tokenAddress || !spenderAddress || !address) return;
    try {
      const tokenContract = new Contract(tokenAddress, erc20Abi, rpcClient);
      const allowance = await tokenContract.allowance(address, spenderAddress);
      setApprovedAmount(allowance);
      setNeedsApproval(amount && amount > 0 ? allowance < amount : false);
    } catch (error) {
      console.error("Error checking approval:", error);
    }
  }, [walletClient, tokenAddress, spenderAddress, amount, address, rpcClient]);

  const requestApproval = async () => {
    if (
      !walletClient ||
      !tokenAddress ||
      !spenderAddress ||
      !address ||
      !amount
    )
      return;

    try {
      setIsApproving(true);
      const approvalData = encodeApproval(
        spenderAddress as `0x${string}`,
        BigInt(amount)
      );

      const tx = await walletClient.sendTransaction({
        to: tokenAddress as `0x${string}`,
        data: approvalData,
      });

      await rpcClient.waitForTransaction(tx);
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const encodeApproval = (spender: `0x${string}`, amount: bigint) => {
    return encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount],
    });
  };

  useEffect(() => {
    if (walletClient && address) {
      checkApproval();
    }
  }, [walletClient, address, checkApproval]);

  return { approvedAmount, needsApproval, isApproving, requestApproval };
};

export default useTokenApproval;
