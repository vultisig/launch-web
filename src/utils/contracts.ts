export const CONTRACTS = {
  quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  poolFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  WETHToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  USDCToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  WETHUSDCPool: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
};

export const POOLS_ABI = [
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
