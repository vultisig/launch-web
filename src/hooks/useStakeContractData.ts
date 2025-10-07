import { useReadContracts } from "wagmi";

import { STAKE_ABI } from "@/utils/abis/stake";
import { contractAddress } from "@/utils/constants";

export const useStakeContractData = (address?: string) => {
  const {
    data: contractData,
    refetch: refetchContractData,
    isLoading: loadingContractData,
  } = useReadContracts({
    contracts: [
      {
        abi: STAKE_ABI,
        functionName: "lastRewardBalance",
        address: contractAddress.vultStake,
      },
      {
        abi: STAKE_ABI,
        functionName: "totalStaked",
        address: contractAddress.vultStake,
      },
    ],
  });

  const {
    data: userData,
    refetch: refetchUserData,
    isLoading: loadingUserData,
  } = useReadContracts({
    contracts: [
      {
        args: [address],
        abi: STAKE_ABI,
        functionName: "pendingRewards",
        address: contractAddress.vultStake,
      },
      {
        args: [address],
        abi: STAKE_ABI,
        functionName: "userAmount",
        address: contractAddress.vultStake,
      },
    ],
    query: {
      enabled: !!address,
    },
  });

  const lastRewardBalance = contractData?.[0]?.result
    ? BigInt(contractData[0].result.toString())
    : 0n;
  const totalStaked = contractData?.[1]?.result
    ? BigInt(contractData[1].result.toString())
    : 0n;
  const pendingRewards = userData?.[0]?.result
    ? BigInt(userData[0].result.toString())
    : 0n;
  const userAmount = userData?.[1]?.result
    ? BigInt(userData[1].result.toString())
    : 0n;

  const loading = loadingContractData || loadingUserData;

  return {
    lastRewardBalance,
    totalStaked,
    pendingRewards,
    userAmount,
    refetch: () => {
      refetchContractData();
      refetchUserData();
    },
    loading,
  };
};
