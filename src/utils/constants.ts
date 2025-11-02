import { ChainId, Token } from "@uniswap/sdk-core";

import { GasSettingsProps, TickerKey, TokenProps } from "@/utils/types";

export const modalHash = {
  connect: "#connect",
  settings: "#settings",
  wallet: "#wallet",
} as const;

export const contractAddress = {
  ethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  launchList: "0x1ff646b0bde55d0a134e872cf7a257babdee0c91",
  poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  uniToken: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  uniUsdcPool: "0xd0fc8ba7e267f2bc56044a7715a489d851dc6d78",
  usdcToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  vultToken: "0xb788144df611029c60b859df47e79b7726c4deba",
  vultStake: "0xea56819d589d266b165b287e57d1b63efceb630c",
  vultUsdcPool: "0x6Df52cC6E2E6f6531E4ceB4b083CF49864A89020",
  vultWethPool: "0xeDeC8b375f256B7cf34f0b0d85A13E7b2E3F46af",
  wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  wethUsdcPool: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
} as const;

export const baseContractAddress = {
  iouVult: "0x299A57C1f6761b3dB304dc8B18bb4E60A1CF37b6",
} as const;

export const defaultTokens: Record<TickerKey, TokenProps> = {
  ETH: {
    balance: 0,
    cmcId: 1027,
    contractAddress: contractAddress.ethToken,
    decimals: 18,
    isAirdropToken: false,
    isNative: true,
    name: "Ethereum",
    ticker: "ETH",
    value: 0,
  },
  VULT: {
    balance: 0,
    cmcId: 33502,
    contractAddress: contractAddress.vultToken,
    decimals: 18,
    isAirdropToken: true,
    isNative: false,
    name: "Vult",
    ticker: "VULT",
    value: 0,
  },
  UNI: {
    balance: 0,
    cmcId: 7083,
    contractAddress: contractAddress.uniToken,
    decimals: 18,
    isAirdropToken: true,
    isNative: false,
    name: "Uniswap",
    ticker: "UNI",
    value: 0,
  },
  USDC: {
    balance: 0,
    cmcId: 3408,
    contractAddress: contractAddress.usdcToken,
    decimals: 6,
    isAirdropToken: false,
    isNative: false,
    name: "USD Coin",
    ticker: "USDC",
    value: 0,
  },
  WETH: {
    balance: 0,
    cmcId: 2396,
    contractAddress: contractAddress.wethToken,
    decimals: 18,
    isAirdropToken: false,
    isNative: false,
    name: "Wrapped Ether",
    ticker: "WETH",
    value: 0,
  },
};

export const uniswapTokens: Record<TickerKey, Token> = {
  ETH: new Token(
    ChainId.MAINNET,
    defaultTokens.ETH.contractAddress,
    defaultTokens.ETH.decimals,
    defaultTokens.ETH.ticker,
    defaultTokens.ETH.name
  ),
  UNI: new Token(
    ChainId.MAINNET,
    defaultTokens.UNI.contractAddress,
    defaultTokens.UNI.decimals,
    defaultTokens.UNI.ticker,
    defaultTokens.UNI.name
  ),
  VULT: new Token(
    ChainId.MAINNET,
    defaultTokens.VULT.contractAddress,
    defaultTokens.VULT.decimals,
    defaultTokens.VULT.ticker,
    defaultTokens.VULT.name
  ),
  USDC: new Token(
    ChainId.MAINNET,
    defaultTokens.USDC.contractAddress,
    defaultTokens.USDC.decimals,
    defaultTokens.USDC.ticker,
    defaultTokens.USDC.name
  ),
  WETH: new Token(
    ChainId.MAINNET,
    defaultTokens.WETH.contractAddress,
    defaultTokens.WETH.decimals,
    defaultTokens.WETH.ticker,
    defaultTokens.WETH.name
  ),
};

export const defaultGasSettings: GasSettingsProps = {
  gasLimit: 200000,
  maxFee: 4,
  maxPriorityFee: 1,
  mode: "BASIC",
  slippage: 0.5,
  speed: "Standard",
};

export const launchListABI = [
  {
    inputs: [
      { internalType: "address", name: "initialOwner", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "AccessControlBadConfirmation", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "bytes32", name: "neededRole", type: "bytes32" },
    ],
    name: "AccessControlUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "addr", type: "address" },
    ],
    name: "LaunchListAddressAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "addr", type: "address" },
    ],
    name: "LaunchListAddressRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "pool", type: "address" },
    ],
    name: "LaunchListPoolAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newOraclePool",
        type: "address",
      },
    ],
    name: "OraclePoolUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "enum LaunchList.Phase",
        name: "newPhase",
        type: "uint8",
      },
    ],
    name: "PhaseAdvanced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldPhase1UsdcLimit",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oldPhase2UsdcLimit",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newPhase1UsdcLimit",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newPhase2UsdcLimit",
        type: "uint256",
      },
    ],
    name: "PhaseLimitsUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "pool", type: "address" },
    ],
    name: "PoolRemovedFromLaunchList",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "total",
        type: "uint256",
      },
    ],
    name: "UsdcSpent",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "LAUNCHLIST_SPENDER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "UNISWAP_QUOTER",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USDC",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "USDC_DECIMALS",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WHITELIST_MANAGER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "addressUsdcSpent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "advancePhase",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "currentPhase",
    outputs: [
      { internalType: "enum LaunchList.Phase", name: "", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllLaunchListAddresses",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getLaunchListAddressAtIndex",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLaunchListAddressCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getLaunchListPoolAtIndex",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLaunchListPoolCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
    name: "getRoleAdmin",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenAmount", type: "uint256" }],
    name: "getUsdcValueForToken",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "hasRole",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "isAddressOnLaunchList",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "pool", type: "address" }],
    name: "isPoolOnLaunchList",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "isTransactionAllowed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "launchListAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address[]", name: "addrs", type: "address[]" }],
    name: "launchListAddresses",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "pool", type: "address" }],
    name: "launchListPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address[]", name: "pools", type: "address[]" }],
    name: "launchListPools",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "phase1UsdcLimit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "phase2UsdcLimit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "removeLaunchListAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "pool", type: "address" }],
    name: "removePoolFromLaunchList",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "callerConfirmation", type: "address" },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum LaunchList.Phase",
        name: "newPhase",
        type: "uint8",
      },
    ],
    name: "setPhase",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "phase1UsdcLimit_", type: "uint256" },
      { internalType: "uint256", name: "phase2UsdcLimit_", type: "uint256" },
    ],
    name: "setPhaseLimits",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_uniswapV3OraclePool",
        type: "address",
      },
    ],
    name: "setUniswapV3OraclePool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "uniswapV3OraclePool",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

export const poolsAbi = [
  {
    inputs: [],
    name: "slot0",
    outputs: [
      { internalType: "uint160", name: "sqrtPriceX96", type: "uint160" },
      { internalType: "int24", name: "tick", type: "int24" },
      { internalType: "uint16", name: "observationIndex", type: "uint16" },
      {
        internalType: "uint16",
        name: "observationCardinality",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "observationCardinalityNext",
        type: "uint16",
      },
      { internalType: "uint8", name: "feeProtocol", type: "uint8" },
      { internalType: "bool", name: "unlocked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "liquidity",
    outputs: [{ internalType: "uint128", name: "", type: "uint128" }],
    stateMutability: "view",
    type: "function",
  },
];
