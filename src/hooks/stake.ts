import { STAKE_ABI } from "utils/abis/stake";
import { ContractAddress } from "utils/constants";
import { useReadContracts } from "wagmi";

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
        address: ContractAddress.VULT_STAKE,
      },
      {
        abi: STAKE_ABI,
        functionName: "totalStaked",
        address: ContractAddress.VULT_STAKE,
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
        address: ContractAddress.VULT_STAKE,
      },
      {
        args: [address],
        abi: STAKE_ABI,
        functionName: "userAmount",
        address: ContractAddress.VULT_STAKE,
      },
    ],
    query: {
      enabled: !!address,
    },
  });

  const lastRewardBalance = Number(contractData?.[0]?.result || 0);
  const totalStaked = Number(contractData?.[1]?.result || 0);
  const pendingRewards = Number(userData?.[0]?.result || 0);
  const userAmount = Number(userData?.[1]?.result || 0);

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
