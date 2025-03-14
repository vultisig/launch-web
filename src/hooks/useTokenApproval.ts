import { useState, useEffect, useCallback } from "react";
import { Contract, parseUnits } from "ethers";
import { useAccount, useWalletClient } from "wagmi";

import { encodeFunctionData, erc20Abi, formatUnits } from "viem";

import { getRPCProvider } from "utils/providers/rpcProvider";
import { ContractAddress } from "utils/constants";
import { Token } from "utils/tokens";

const useTokenApproval = (token?: Token, amount?: number) => {
  const { address } = useAccount();
  const rpcClient = getRPCProvider();
  const { data: walletClient } = useWalletClient();
  const [approvedAmount, setApprovedAmount] = useState(BigInt(0));
  const [isApproving, setIsApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  const checkApproval = useCallback(async () => {
    if (
      !walletClient ||
      !token?.address ||
      !ContractAddress.SWAP_ROUTER ||
      !address
    )
      return;
    try {
      const tokenContract = new Contract(token.address, erc20Abi, rpcClient);
      const allowance = await tokenContract.allowance(
        address,
        ContractAddress.SWAP_ROUTER
      );
      setApprovedAmount(allowance);
      setNeedsApproval(
        amount && amount > 0
          ? Number(formatUnits(allowance, token.decimals)) < amount
          : false
      );
    } catch (error) {
      console.error("Error checking approval:", error);
    }
  }, [
    walletClient,
    token?.address,
    ContractAddress.SWAP_ROUTER,
    amount,
    address,
    rpcClient,
  ]);

  const requestApproval = async () => {
    if (
      !walletClient ||
      !token?.address ||
      !ContractAddress.SWAP_ROUTER ||
      !address ||
      !amount
    )
      return;

    try {
      setIsApproving(true);
      const approvalData = encodeApproval(
        ContractAddress.SWAP_ROUTER as `0x${string}`,
        parseUnits(String(amount), token.decimals)
      );

      const tx = await walletClient.sendTransaction({
        to: token.address as `0x${string}`,
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
