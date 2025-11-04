import { FeeAmount } from "@uniswap/v3-sdk";
import { Contract, parseUnits } from "ethers";
import { encodeFunctionData, erc20Abi, maxUint256 } from "viem";
import { useAccount, useWalletClient } from "wagmi";

import { getGasSettings } from "@/storage/gasSettings";
import {
  contractAddress,
  NonFungiblePositionManagerAbi,
  TxStatus,
} from "@/utils/constants";
import { getBrowserProvider, getRPCProvider } from "@/utils/providers";
import { TokenProps } from "@/utils/types";
import { waitForTransactionReceipt } from "wagmi/actions";
import { wagmiConfig } from "@/utils/wagmi";

type MintParams = {
  token0: `0x${string}`;
  token1: `0x${string}`;
  fee: number;
  tickLower: number;
  tickUpper: number;
  amount0Desired: bigint;
  amount1Desired: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  recipient: `0x${string}`;
  deadline: bigint;
};

type PreparedMint = {
  params: MintParams;
  value: bigint; // native ETH to send
  token0Addr: `0x${string}`;
  token1Addr: `0x${string}`;
  amount0Desired: bigint;
  amount1Desired: bigint;
  isWeth0: boolean;
  isWeth1: boolean;
};

type ApprovalNeed = {
  token: `0x${string}`;
  amount: bigint;
  needed: boolean;
};

function sortTokens(
  a: `0x${string}`,
  b: `0x${string}`
): [`0x${string}`, `0x${string}`, boolean] {
  return a.toLowerCase() < b.toLowerCase() ? [a, b, false] : [b, a, true];
}
const fullRangeTicks = (fee: number) => {
  const MIN_TICK = -887272;
  const MAX_TICK = 887272;

  const spacing = ({ 100: 1, 500: 10, 3000: 60, 10000: 200 } as const)[fee];
  if (!spacing) throw new Error(`Unsupported fee tier: ${fee}`);

  const tickLower = Math.ceil(MIN_TICK / spacing) * spacing;
  const tickUpper = Math.floor(MAX_TICK / spacing) * spacing;

  return { tickLower, tickUpper, tickSpacing: spacing };
};

export const useAddLiquidity = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const gasSetting = getGasSettings();
  const rpcClient = getRPCProvider();

  const NFPM = contractAddress.nonfungiblePositionManager as `0x${string}`;

  const prepareMint = async (
    rawAmountA: string,
    rawAmountB: string,
    tokenA: TokenProps,
    tokenB: TokenProps
  ): Promise<PreparedMint> => {
    if (!address || !walletClient) throw new Error("wallet not ready");

    const addrA = tokenA.contractAddress as `0x${string}`;
    const addrB = tokenB.contractAddress as `0x${string}`;

    const [token0Addr, token1Addr, swapped] = sortTokens(addrA, addrB);
    const isWeth0 =
      token0Addr.toLowerCase() === contractAddress.wethToken.toLowerCase();
    const isWeth1 =
      token1Addr.toLowerCase() === contractAddress.wethToken.toLowerCase();

    const amtA = parseUnits(rawAmountA, tokenA.decimals);
    const amtB = parseUnits(rawAmountB, tokenB.decimals);
    const amount0Desired = swapped ? amtB : amtA;
    const amount1Desired = swapped ? amtA : amtB;

    // slippage mins
    const bps = 10_000n;
    const slippageBps = BigInt(Math.floor(gasSetting.slippage * 100));
    const amount0Min = (amount0Desired * (bps - slippageBps)) / bps;
    const amount1Min = (amount1Desired * (bps - slippageBps)) / bps;

    const { tickLower, tickUpper, tickSpacing } = fullRangeTicks(
      FeeAmount.MEDIUM
    );
    console.log("tickLower", tickLower);
    console.log("tickUpper", tickUpper);
    console.log("tickSpacing", tickSpacing);
    const params: MintParams = {
      token0: token0Addr,
      token1: token1Addr,
      fee: FeeAmount.MEDIUM,
      tickLower,
      tickUpper,
      amount0Desired,
      amount1Desired,
      amount0Min,
      amount1Min,
      recipient: address as `0x${string}`,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 20 * 60),
    };

    const value = isWeth0 ? amount0Desired : isWeth1 ? amount1Desired : 0n;

    return {
      params,
      value,
      token0Addr,
      token1Addr,
      amount0Desired,
      amount1Desired,
      isWeth0,
      isWeth1,
    };
  };

  const getApprovalRequirements = async (
    prep: PreparedMint
  ): Promise<ApprovalNeed[]> => {
    if (!address) throw new Error("no address");

    const needs: ApprovalNeed[] = [];

    if (!prep.isWeth0) {
      const token0Contract = new Contract(prep.token0Addr, erc20Abi, rpcClient);
      const allowance0: bigint = await token0Contract.allowance(
        address as `0x${string}`,
        NFPM
      );

      needs.push({
        token: prep.token0Addr,
        amount: prep.amount0Desired,
        needed: allowance0 < prep.amount0Desired,
      });
    }

    if (!prep.isWeth1) {
      const token1Contract = new Contract(prep.token1Addr, erc20Abi, rpcClient);
      const allowance1: bigint = await token1Contract.allowance(
        address as `0x${string}`,
        NFPM
      );
      needs.push({
        token: prep.token1Addr,
        amount: prep.amount1Desired,
        needed: allowance1 < prep.amount1Desired,
      });
    }

    return needs;
  };

  async function approveToken(
    token: `0x${string}`,
    amount: bigint,
    approveExact = false
  ): Promise<`0x${string}`> {
    if (!walletClient) throw new Error("wallet not ready");
    const hash = await walletClient.writeContract({
      abi: erc20Abi,
      address: token,
      functionName: "approve",
      args: [NFPM, approveExact ? amount : maxUint256],
    });
    return hash;
  }

  const approveAll = async (
    needs: ApprovalNeed[],
    approveExact = false
  ): Promise<`0x${string}`[]> => {
    const toApprove = needs.filter((n) => n.needed);
    const hashes: `0x${string}`[] = [];
    for (const n of toApprove) {
      const h = await approveToken(n.token, n.amount, approveExact);
      hashes.push(h);
    }
    return hashes;
  };

  const executeMint = async (prep: PreparedMint): Promise<`0x${string}`> => {
    if (!walletClient) throw new Error("wallet not ready");

    const calldata = encodeFunctionData({
      abi: NonFungiblePositionManagerAbi,
      functionName: "mint",
      args: [prep.params],
    });

    const txHash = await walletClient.sendTransaction({
      to: NFPM,
      data: calldata,
      value: prep.value,
      gas: gasSetting.gasLimit > 0 ? BigInt(gasSetting.gasLimit) : undefined,
      maxPriorityFeePerGas:
        gasSetting.maxPriorityFee > 0
          ? BigInt(parseUnits(String(gasSetting.maxPriorityFee), "gwei"))
          : undefined,
      maxFeePerGas:
        gasSetting.maxFee > 0
          ? BigInt(parseUnits(String(gasSetting.maxFee), "gwei"))
          : undefined,
    });

    return txHash;
  };

  const getTxStatuses = async (txHashes: string[]): Promise<TxStatus[]> => {
    const provider = await getBrowserProvider();
    if (!provider) {
      console.error("Ethereum provider is not available.");
      return [];
    }

    const receipts = await Promise.all(
      txHashes.map(
        async (txHash) =>
          await waitForTransactionReceipt(wagmiConfig, {
            hash: txHash as `0x${string}`,
          })
      )
    );

    return receipts.map((receipt) =>
      receipt === null
        ? TxStatus.PENDING
        : receipt.status === "success"
        ? TxStatus.SUCCESS
        : TxStatus.FAILED
    );
  };

  return {
    getTxStatuses,
    prepareMint,
    getApprovalRequirements,
    approveToken,
    approveAll,
    executeMint,
  };
};
