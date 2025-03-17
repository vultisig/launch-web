import { useState, useEffect, useCallback } from "react";
import { Contract, parseUnits } from "ethers";
import { useAccount, useWalletClient } from "wagmi";

import { encodeFunctionData, erc20Abi, formatUnits } from "viem";

import { getRPCProvider } from "utils/providers/rpcProvider";
import { ContractAddress } from "utils/constants";
import { UniswapTokenProps } from "utils/interfaces";
import { getStoredGasSettings } from "utils/storage";

const useTokenApproval = (token?: UniswapTokenProps, amount?: number) => {
  const { address } = useAccount();
  const rpcClient = getRPCProvider();
  const { data: walletClient } = useWalletClient();
  const [approvedAmount, setApprovedAmount] = useState(BigInt(0));
  const [isApproving, setIsApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(true);

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
      const gasSetting = getStoredGasSettings();
      const approvalData = encodeApproval(
        ContractAddress.SWAP_ROUTER as `0x${string}`,
        parseUnits(String(amount), token.decimals)
      );

      const tx = await walletClient.sendTransaction({
        to: token.address as `0x${string}`,
        data: approvalData,
        gas: gasSetting.gasLimit > 0 ? BigInt(gasSetting.gasLimit) : undefined,
        maxPriorityFeePerGas:
          gasSetting.maxPriorityFee > 0
            ? BigInt(parseUnits(gasSetting.maxPriorityFee.toString(), "gwei"))
            : undefined,
        maxFeePerGas:
          gasSetting.maxFee > 0
            ? BigInt(parseUnits(gasSetting.maxFee.toString(), "gwei"))
            : undefined,
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
