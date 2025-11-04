import { FeeAmount, TICK_SPACINGS } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { Contract, parseUnits } from "ethers";
import { encodeFunctionData, erc20Abi, maxUint256 } from "viem";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";

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
import { mainnet } from "viem/chains";

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

/**
 * Convert price to tick, aligned to tick spacing
 * Price is in terms of token0/token1 (e.g., VULT per USDC)
 */
const priceToTick = (
  price: number,
  fee: number,
  token0: Token,
  token1: Token,
  swapped: boolean
): number => {
  const spacing = TICK_SPACINGS[fee as keyof typeof TICK_SPACINGS];
  if (!spacing) throw new Error(`Unsupported fee tier: ${fee}`);

  // Price is in terms of token0/token1
  // If tokens were swapped during sorting, we need to invert the price
  const actualPrice = swapped ? 1 / price : price;

  // Calculate tick from price
  // In Uniswap V3: price = 1.0001^tick
  // So: tick = log(price) / log(1.0001)
  // We need to account for decimal differences between tokens
  const decimalAdjustment = Math.pow(10, token0.decimals - token1.decimals);
  const adjustedPrice = actualPrice * decimalAdjustment;

  // Calculate tick: tick = floor(log(price) / log(1.0001))
  const tick = Math.floor(Math.log(adjustedPrice) / Math.log(1.0001));

  // Align to tick spacing (round down for lower, round up for upper)
  const alignedTick = Math.floor(tick / spacing) * spacing;

  return alignedTick;
};

/**
 * Calculate ticks from price range
 * Note: When tokens are swapped, prices invert, so min/max must be swapped
 */
const calculateTicksFromPriceRange = (
  minPrice: number | undefined,
  maxPrice: number | undefined,
  fee: number,
  token0: Token,
  token1: Token,
  swapped: boolean
): { tickLower: number; tickUpper: number } => {
  if (minPrice === undefined || maxPrice === undefined) {
    return fullRangeTicks(fee);
  }

  const spacing = TICK_SPACINGS[fee as keyof typeof TICK_SPACINGS];
  if (!spacing) throw new Error(`Unsupported fee tier: ${fee}`);

  // When tokens are swapped, prices are inverted
  // So if minPrice < maxPrice in original terms, after inversion:
  // 1/maxPrice < 1/minPrice, meaning the order is reversed
  // Therefore, we need to swap min and max when calculating ticks if swapped
  const priceForLowerTick = swapped ? maxPrice : minPrice;
  const priceForUpperTick = swapped ? minPrice : maxPrice;

  const tickLower = priceToTick(
    priceForLowerTick,
    fee,
    token0,
    token1,
    swapped
  );
  const tickUpper = priceToTick(
    priceForUpperTick,
    fee,
    token0,
    token1,
    swapped
  );

  // Ensure tickLower < tickUpper
  if (tickLower >= tickUpper) {
    throw new Error("Min price must be less than max price");
  }

  return { tickLower, tickUpper };
};

export const useAddLiquidity = () => {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const gasSetting = getGasSettings();
  const rpcClient = getRPCProvider();
  const { switchChainAsync } = useSwitchChain();
  const NFPM = contractAddress.nonfungiblePositionManager as `0x${string}`;

  const prepareMint = async (
    rawAmountA: string,
    rawAmountB: string,
    tokenA: TokenProps,
    tokenB: TokenProps,
    options?: {
      minPrice?: number;
      maxPrice?: number;
      fee?: FeeAmount;
    }
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

    const fee = options?.fee ?? FeeAmount.HIGH;

    // Create Token objects for price-to-tick conversion
    const token0Uniswap = new Token(
      1, // ChainId.MAINNET
      token0Addr,
      swapped ? tokenB.decimals : tokenA.decimals,
      swapped ? tokenB.ticker : tokenA.ticker,
      swapped ? tokenB.name : tokenA.name
    );
    const token1Uniswap = new Token(
      1, // ChainId.MAINNET
      token1Addr,
      swapped ? tokenA.decimals : tokenB.decimals,
      swapped ? tokenA.ticker : tokenB.ticker,
      swapped ? tokenA.name : tokenB.name
    );

    // Calculate ticks based on price range or use full range
    let tickLower: number;
    let tickUpper: number;
    if (options?.minPrice !== undefined && options?.maxPrice !== undefined) {
      const ticks = calculateTicksFromPriceRange(
        options.minPrice,
        options.maxPrice,
        fee,
        token0Uniswap,
        token1Uniswap,
        swapped
      );
      tickLower = ticks.tickLower;
      tickUpper = ticks.tickUpper;
    } else {
      const fullRange = fullRangeTicks(fee);
      tickLower = fullRange.tickLower;
      tickUpper = fullRange.tickUpper;
    }

    const params: MintParams = {
      token0: token0Addr,
      token1: token1Addr,
      fee,
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
    if (chainId !== mainnet.id) {
      await switchChainAsync({ chainId: mainnet.id });
    }
    const hash = await walletClient.writeContract({
      chain: mainnet,
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
    if (chainId !== mainnet.id) {
      await switchChainAsync({ chainId: mainnet.id });
    }
    const txHash = await walletClient.sendTransaction({
      chain: mainnet,
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
