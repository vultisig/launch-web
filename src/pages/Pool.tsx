import { Form, Input, Layout, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { useAccount } from "wagmi";

import { LinearChart } from "@/components/LinearChart";
import { useCore } from "@/hooks/useCore";

import { Button } from "@/toolkits/Button";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import {
  contractAddress,
  defaultTokens,
  feeTierOptions,
  TxStatus,
  uniswapTokens,
} from "@/utils/constants";
import { toAmountFormat, toValueFormat } from "@/utils/functions";
import { defaultPeriod, Period, periodNames, periods } from "@/utils/period";
import { CreateLPTokensFormProps, TickerKey } from "@/utils/types";
import { useAddLiquidity } from "@/hooks/useAddLiquidity";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { Contract } from "ethers";
import { getRPCProvider } from "@/utils/providers";
import { Spin } from "@/toolkits/Spin";
import { useChartData } from "@/hooks/useChartData";
import { computePoolAddress, FeeAmount } from "@uniswap/v3-sdk";

import { debounce } from "lodash";

const { Content } = Layout;

type Range = "full" | "custom";
type CreateLPPositionProps = {
  maxPrice: number;
  minPrice: number;
} & CreateLPTokensFormProps;

type StateProps = {
  createPositionButtonTitle: string;
  createPositionButtonLoading: boolean;
  feeTier: FeeAmount;
  token0: TickerKey;
  token1: TickerKey;
  token0Price: number;
};

export const PoolPage = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>("full");
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const [state, setState] = useState<StateProps>({
    createPositionButtonTitle: t("addLiquidity"),
    createPositionButtonLoading: false,
    feeTier: FeeAmount.HIGH,
    token0: defaultTokens.VULT.ticker,
    token1: defaultTokens.USDC.ticker,
    token0Price: 0,
  });

  const {
    createPositionButtonTitle,
    createPositionButtonLoading,
    token0,
    token1,
    token0Price,
  } = state;
  const { data, loading } = useChartData(token0, period);
  const { currency, setCurrentPage, tokens } = useCore();
  const { isConnected } = useAccount();
  const [form] = Form.useForm<CreateLPPositionProps>();
  const colors = useTheme();

  useEffect(() => setCurrentPage("pool"), []);

  const {
    prepareMint,
    getApprovalRequirements,
    approveAll,
    executeMint,
    getTxStatuses,
  } = useAddLiquidity();

  const pool = useMemo(() => {
    const poolAddress = computePoolAddress({
      factoryAddress: contractAddress.poolFactory,
      tokenA: token0 === "ETH" ? uniswapTokens.WETH : uniswapTokens[token0],
      tokenB: token1 === "ETH" ? uniswapTokens.WETH : uniswapTokens[token1],
      fee: FeeAmount.HIGH,
    });
    return new Contract(poolAddress, IUniswapV3PoolABI.abi, getRPCProvider());
  }, [token0, token1]);

  const contractToken0 = useMemo(() => {
    const fetchToken0 = async () => {
      const token0Addr = await pool.token0();
      return Object.values(defaultTokens).find(
        (token) =>
          token.contractAddress?.toLowerCase() === token0Addr.toLowerCase()
      )!;
    };
    return fetchToken0();
  }, [pool]);

  const contractToken1 = useMemo(() => {
    const fetchToken1 = async () => {
      const token1Addr = await pool.token1();
      return Object.values(defaultTokens).find(
        (token) =>
          token.contractAddress?.toLowerCase() === token1Addr.toLowerCase()
      )!;
    };
    return fetchToken1();
  }, [pool]);

  const poolPrice = useMemo(async () => {
    const decimalsToken0 = (await contractToken0).decimals;
    const decimalsToken1 = (await contractToken1).decimals;
    const decimalAdjustment = 10 ** (decimalsToken0 - decimalsToken1);
    const { sqrtPriceX96 } = await pool.slot0();
    const price = (Number(sqrtPriceX96) / 2 ** 96) ** 2 * decimalAdjustment;
    const token0Price =
      token0 === (await contractToken0).ticker
        ? price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 5,
          })
        : (1 / price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 5,
          });

    setState((prevState) => ({
      ...prevState,
      token0Price: parseFloat(token0Price),
    }));
    return price;
  }, [pool, contractToken0, contractToken1]);

  const updateTokensRatio = async ({
    amount0,
    amount1,
  }: {
    amount0?: number;
    amount1?: number;
  }) => {
    const price = await poolPrice;
    if (!amount0 && !amount1) {
      form.setFieldsValue({
        amount0: undefined,
        amount1: undefined,
      });
      return;
    }

    if (amount0) {
      form.setFieldsValue({
        amount1: Number(
          Number(
            token0 === (await contractToken0).ticker
              ? amount0 * price
              : amount0 / price
          ).toFixed(5)
        ),
      });
    } else if (amount1) {
      form.setFieldsValue({
        amount0: Number(
          Number(
            token1 === (await contractToken1).ticker
              ? amount1 / price
              : amount1 * price
          ).toFixed(5)
        ),
      });
    }
  };

  const handleCreatePosition = async () => {
    const { amount0, token0, amount1, token1 } = form.getFieldsValue();
    console.log({ amount0, token0, amount1, token1 });

    if (amount0 && amount1 && amount0 > 0 && amount1 > 0) {
      setState({ ...state, createPositionButtonLoading: true });
      const mintPayload = await prepareMint(
        Number(amount0).toFixed(uniswapTokens.UNI.decimals).toString(),
        Number(amount1).toFixed(uniswapTokens.USDC.decimals).toString(),
        defaultTokens.UNI,
        defaultTokens.USDC
      );
      console.log("mintPayload", mintPayload);
      const approvalRequirements = await getApprovalRequirements(mintPayload);
      if (approvalRequirements.length > 0) {
        setState({
          ...state,
          createPositionButtonLoading: true,
          createPositionButtonTitle: "Waiting for token approvals...",
        });
        const approvalHashes = await approveAll(
          approvalRequirements,
          true
        ).catch((error) => {
          console.error("Error approving tokens:", error);
          setState({ ...state, createPositionButtonLoading: false });
          return;
        });
        if (approvalHashes) {
          await waitForTxConfirmation(approvalHashes);
        }
      }
      try {
        // check if all approval requirements are met
        if (
          (await getApprovalRequirements(mintPayload)).every(
            (requirement) => requirement.needed === false
          )
        ) {
          const txHash = await executeMint(mintPayload);

          if (txHash) {
            console.log("txHash mint success", txHash);

            await waitForTxConfirmation([txHash]);
            setState({
              ...state,
              createPositionButtonLoading: false,
              createPositionButtonTitle: t("addLiquidity"),
            });
            message.success(t("transactionSuccess"));
          } else {
            setState({
              ...state,
              createPositionButtonLoading: false,
              createPositionButtonTitle: t("addLiquidity"),
            });
            message.error(t("transactionFailed"));
          }
        } else {
          message.error("Approval requirements not met");
        }
      } catch {
        setState({
          ...state,
          createPositionButtonLoading: false,
          createPositionButtonTitle: t("addLiquidity"),
        });
        message.error(t("transactionFailed"));
      }
    }
  };

  const waitForTxConfirmation = async (
    txHashes: string[],
    startedAt = Date.now(),
    retryCount = 0
  ) => {
    const MAX_RETRIES = 180;
    const POLL_INTERVAL_MS = 1000;
    const TIMEOUT_MS = 180_000;

    if (retryCount >= MAX_RETRIES || Date.now() - startedAt >= TIMEOUT_MS) {
      setState((prevState) => ({
        ...prevState,
        approving: false,
        needsApproval: true,
      }));
      message.error(t("transactionTimeout"));
      return;
    }

    try {
      const statuses = await getTxStatuses(txHashes);

      // Check if all transactions are successful
      const allSuccessful = statuses.every(
        (status) => status === TxStatus.SUCCESS
      );
      const anyFailed = statuses.some((status) => status === TxStatus.FAILED);
      const anyPending = statuses.some((status) => status === TxStatus.PENDING);

      if (allSuccessful) {
        setState((prevState) => ({
          ...prevState,
          needsApproval: false,
          createPositionButtonLoading: true,
          createPositionButtonTitle: t("executingAddLiquidity"),
        }));

        return;
      }

      if (anyFailed) {
        setState((prevState) => ({
          ...prevState,
          needsApproval: true,
          createPositionButtonLoading: false,
          createPositionButtonTitle: t("addLiquidity"),
        }));

        return;
      }

      if (anyPending) {
        setState((prevState) => ({
          ...prevState,
          createPositionButtonLoading: true,
        }));
        setTimeout(() => {
          waitForTxConfirmation(txHashes, startedAt, retryCount + 1);
        }, POLL_INTERVAL_MS);
        return;
      }

      const backoffDelay = Math.min(
        POLL_INTERVAL_MS * Math.pow(2, Math.floor(retryCount / 10)),
        10000
      );
      setTimeout(() => {
        waitForTxConfirmation(txHashes, startedAt, retryCount + 1);
      }, backoffDelay);
    } catch (error) {
      console.error("Error checking transaction status:", error);

      const backoffDelay = Math.min(
        POLL_INTERVAL_MS * Math.pow(2, Math.floor(retryCount / 5)),
        10000
      );
      setTimeout(() => {
        waitForTxConfirmation(txHashes, startedAt, retryCount + 1);
      }, backoffDelay);
    }
  };

  const handleSelectFeeTier = (feeTier: FeeAmount) => {
    setState((prevState) => ({ ...prevState, feeTier }));
  };

  const handleChangeFormValues = debounce(
    ({ amount0, amount1, token1 }: CreateLPPositionProps) => {
      if (token1) {
        setState((prevState) => ({ ...prevState, token1 }));
      } else {
        updateTokensRatio({ amount0, amount1 });
      }
    },
    100
  );

  return (
    <VStack as={Content} $style={{ gap: "24px", maxWidth: "1600px" }}>
      <VStack $style={{ gap: "16px" }}>
        <Stack
          as="span"
          $style={{ fontSize: "16px", fontWeight: "500" }}
        >{`Your Positions > New Position`}</Stack>
        <Stack as="span" $style={{ fontSize: "40px", fontWeight: "600" }}>
          New Position
        </Stack>
      </VStack>
      <Form
        autoComplete="off"
        form={form}
        initialValues={{
          token0: defaultTokens.VULT.ticker,
          token1: defaultTokens.USDC.ticker,
        }}
        onValuesChange={handleChangeFormValues}
      >
        <Stack
          $style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          $media={{ xl: { $style: { flexDirection: "row" } } }}
        >
          <VStack $style={{ gap: "16px", overflow: "hidden", width: "100%" }}>
            <VStack
              $style={{
                backgroundColor: colors.bgSecondary.toHex(),
                borderRadius: "20px",
                gap: "16px",
                padding: "16px",
              }}
            >
              <Stack
                as="span"
                $style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                Tokens
              </Stack>
              <HStack
                $style={{
                  borderColor: colors.borderNormal.toHex(),
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderRadius: "12px",
                  gap: "16px",
                  padding: "16px 12px",
                }}
              >
                <HStack
                  $style={{
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: colors.bgTertiary.toHex(),
                    padding: "8px 12px 8px 8px",
                    borderRadius: "20px",
                    width: "100%",
                  }}
                >
                  <Stack
                    as="img"
                    alt={token0}
                    src={`/tokens/${token0.toLowerCase()}.svg`}
                    $style={{
                      height: "24px",
                      width: "24px",
                    }}
                  />
                  <Stack
                    as="span"
                    $style={{ fontSize: "14px", fontWeight: "500" }}
                  >
                    {token0}
                  </Stack>
                </HStack>
                <HStack
                  $style={{
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: colors.bgTertiary.toHex(),
                    padding: "8px 12px 8px 8px",
                    borderRadius: "20px",
                    width: "100%",
                  }}
                >
                  <Stack
                    as="img"
                    alt={token1}
                    src={`/tokens/${token1.toLowerCase()}.svg`}
                    $style={{ height: "24px", width: "24px" }}
                  />
                  <Stack
                    as="span"
                    $style={{ fontSize: "14px", fontWeight: "500" }}
                  >
                    {token1}
                  </Stack>
                </HStack>
              </HStack>
              <VStack $style={{ gap: "12px" }}>
                <Stack
                  as="span"
                  $style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    lineHeight: "20px",
                  }}
                >
                  Fee tier
                </Stack>
                <Stack
                  as="span"
                  $style={{
                    color: colors.textSecondary.toHex(),
                    fontSize: "13px",
                    fontWeight: "500",
                    lineHeight: "18px",
                  }}
                >
                  The amount earned providing liquidity. Choose an amount that
                  suits your risk tolerance and strategy.
                </Stack>
              </VStack>
              <HStack $style={{ flexWrap: "nowrap", gap: "12px" }}>
                {feeTierOptions.map(({ value, label, description }, index) => (
                  <VStack
                    key={index}
                    onClick={() => handleSelectFeeTier(value)}
                    $style={{
                      backgroundColor:
                        value === state.feeTier
                          ? colors.bgTertiary.toHex()
                          : colors.bgSecondary.toHex(),
                      borderColor:
                        value === state.feeTier
                          ? colors.accentFour.toHex()
                          : colors.borderNormal.toHex(),
                      borderStyle: "solid",
                      borderWidth: "1px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      gap: "8px",
                      padding: "12px",
                      width: "100%",
                    }}
                    $hover={{
                      backgroundColor: colors.bgTertiary.toHex(),
                    }}
                  >
                    <Stack
                      as="span"
                      $style={{
                        fontSize: "17px",
                        fontWeight: "600",
                        lineHeight: "20px",
                      }}
                    >
                      {`${label}`}
                    </Stack>
                    <Stack
                      as="span"
                      $style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        lineHeight: "18px",
                      }}
                    >
                      {description}
                      {/* $3.26 TVL 0% select */}
                    </Stack>
                  </VStack>
                ))}
              </HStack>
            </VStack>
            <VStack
              $style={{
                alignItems: "flex-start",
                backgroundColor: colors.bgSecondary.toHex(),
                borderRadius: "20px",
                gap: "16px",
                padding: "16px",
              }}
            >
              <Stack
                as="span"
                $style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                Current price: {token0Price} {token1} (${token0Price})
              </Stack>
              <HStack
                $style={{
                  borderColor: colors.borderLight.toHex(),
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderRadius: "12px",
                  gap: "4px",
                  overflow: "hidden",
                  padding: "4px",
                }}
              >
                {periods.map((value) => (
                  <VStack
                    key={value}
                    onClick={() => setPeriod(value)}
                    $style={{
                      alignItems: "center",
                      backgroundColor:
                        value === period
                          ? colors.bgTertiary.toHex()
                          : "transparent",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "12px",
                      height: "36px",
                      justifyContent: "center",
                      width: "76px",
                    }}
                    $hover={{
                      backgroundColor: colors.bgTertiary.toHex(),
                    }}
                  >
                    {value === loading ? (
                      <Spin size="small" />
                    ) : (
                      periodNames[value]
                    )}
                  </VStack>
                ))}
              </HStack>
              <Stack $style={{ width: "100%" }}>
                <LinearChart data={loading ? [] : data} />
              </Stack>
            </VStack>
          </VStack>
          <VStack $style={{ gap: "16px", overflow: "hidden", width: "100%" }}>
            <VStack
              $style={{
                backgroundColor: colors.bgSecondary.toHex(),
                borderRadius: "20px",
                gap: "16px",
                padding: "16px",
              }}
            >
              <Stack
                as="span"
                $style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                Set price range
              </Stack>
              <HStack
                $style={{
                  backgroundColor: colors.bgTertiary.toHex(),
                  borderRadius: "26px",
                  gap: "4px",
                  padding: "4px",
                }}
              >
                <VStack
                  as="span"
                  onClick={() => setRange("full")}
                  $style={{
                    alignItems: "center",
                    borderRadius: "22px",
                    cursor: "pointer",
                    fontSize: "16px",
                    height: "42px",
                    justifyContent: "center",
                    width: "100%",
                    ...(range === "full"
                      ? {
                          backgroundColor: colors.buttonPrimary.toHex(),
                          color: colors.neutral50.toHex(),
                          fontWeight: "600",
                        }
                      : {}),
                  }}
                >
                  Full range
                </VStack>
                <VStack
                  // onClick={() => setRange("custom")}
                  $style={{
                    alignItems: "center",
                    borderRadius: "22px",
                    cursor: "not-allowed",
                    fontSize: "16px",
                    height: "42px",
                    justifyContent: "center",
                    width: "100%",
                    ...(range === "custom"
                      ? {
                          backgroundColor: colors.buttonPrimary.toHex(),
                          color: colors.neutral50.toHex(),
                        }
                      : {}),
                  }}
                  as="span"
                >
                  Custom range
                </VStack>
              </HStack>
              <Stack
                as="span"
                $style={{
                  color: colors.textSecondary.toHex(),
                  fontSize: "13px",
                  fontWeight: "500",
                  lineHeight: "18px",
                }}
              >
                Providing full range liquidity ensures continuous market
                participation across all possible prices, offering simplicity
                but with potential for higher impermanent loss.
              </Stack>
              <HStack
                $style={{
                  alignItems: "center",
                  gap: "12px",
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  as="span"
                  $style={{ fontSize: "20px", fontWeight: "500" }}
                >
                  {`Current price: ${token0Price} ${token0} per ${token1}`}
                </Stack>
                <HStack
                  $style={{
                    backgroundColor: colors.bgTertiary.toHex(),
                    borderRadius: "26px",
                    gap: "4px",
                    padding: "4px",
                  }}
                >
                  <VStack
                    as="span"
                    $style={{
                      alignItems: "center",
                      borderRadius: "22px",
                      cursor: "pointer",
                      fontSize: "12px",
                      height: "32px",
                      justifyContent: "center",
                      width: "82px",
                      // active
                      backgroundColor: colors.buttonPrimary.toHex(),
                      color: colors.neutral50.toHex(),
                      fontWeight: "600",
                    }}
                  >
                    {defaultTokens.UNI.ticker}
                  </VStack>
                  <VStack
                    $style={{
                      alignItems: "center",
                      borderRadius: "22px",
                      cursor: "pointer",
                      fontSize: "12px",
                      height: "32px",
                      justifyContent: "center",
                      width: "82px",
                    }}
                    as="span"
                  >
                    {defaultTokens.USDC.ticker}
                  </VStack>
                </HStack>
              </HStack>
              <Stack $style={{ width: "100%" }}>
                <Form.Item<CreateLPPositionProps>
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.maxPrice !== currentValues.maxPrice ||
                    prevValues.minPrice !== currentValues.minPrice
                  }
                  noStyle
                >
                  {({ getFieldsValue }) => {
                    const { maxPrice = 0, minPrice = 0 } = getFieldsValue();

                    return (
                      <LinearChart
                        data={loading ? [] : data}
                        yAxisPlotBands={[
                          { from: Number(minPrice), to: Number(maxPrice) },
                        ]}
                      />
                    );
                  }}
                </Form.Item>
              </Stack>
              <Stack
                as="span"
                $style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                TVL in selected range: 100% (Full Range)
              </Stack>
              <HStack $style={{ gap: "16px" }}>
                <VStack
                  $style={{
                    backgroundColor: colors.bgTertiary.toHex(),
                    borderRadius: "12px",
                    gap: "12px",
                    padding: "16px 20px",
                    width: "100%",
                  }}
                >
                  <Stack
                    as="span"
                    $style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      lineHeight: "16px",
                    }}
                  >
                    Min price
                  </Stack>
                  <Form.Item<CreateLPPositionProps> name="minPrice" noStyle>
                    <Stack
                      as={Input}
                      disabled={range === "full"}
                      placeholder="0"
                      $style={{
                        backgroundColor: "transparent !important",
                        border: "none",
                        borderRadius: "0",
                        fontSize: "22px",
                        fontWeight: "500",
                        height: "32px",
                        padding: "0",
                      }}
                    />
                  </Form.Item>
                  <Stack
                    as="span"
                    $style={{
                      color: colors.textSecondary.toHex(),
                      fontSize: "14px",
                      fontWeight: "500",
                      lineHeight: "16px",
                    }}
                  >
                    {`${token0} per ${token1}`}
                  </Stack>
                </VStack>
                <VStack
                  $style={{
                    backgroundColor: colors.bgTertiary.toHex(),
                    borderRadius: "12px",
                    gap: "12px",
                    padding: "16px 20px",
                    width: "100%",
                  }}
                >
                  <Stack
                    as="span"
                    $style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      lineHeight: "16px",
                    }}
                  >
                    Max price
                  </Stack>
                  <Form.Item<CreateLPPositionProps> name="maxPrice" noStyle>
                    <Stack
                      disabled={range === "full"}
                      as={Input}
                      placeholder={range === "full" ? "∞" : "0"}
                      $style={{
                        backgroundColor: "transparent !important",
                        border: "none",
                        borderRadius: "0",
                        fontSize: "22px",
                        fontWeight: "500",
                        height: "32px",
                        padding: "0",
                      }}
                    />
                  </Form.Item>
                  <Stack
                    as="span"
                    $style={{
                      color: colors.textSecondary.toHex(),
                      fontSize: "14px",
                      fontWeight: "500",
                      lineHeight: "16px",
                    }}
                  >
                    {`${token0} per ${token1}`}
                  </Stack>
                </VStack>
              </HStack>
              <VStack $style={{ gap: "12px" }}>
                <Stack
                  as="span"
                  $style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    lineHeight: "20px",
                  }}
                >
                  Deposit tokens
                </Stack>
                <Stack
                  as="span"
                  $style={{
                    color: colors.textSecondary.toHex(),
                    fontSize: "13px",
                    fontWeight: "500",
                    lineHeight: "18px",
                  }}
                >
                  Specify the token amounts for your liquidity contribution.
                </Stack>
              </VStack>
              <HStack $style={{ gap: "16px" }}>
                <VStack
                  $style={{
                    backgroundColor: colors.bgTertiary.toHex(),
                    borderRadius: "12px",
                    gap: "12px",
                    padding: "16px 20px",
                    width: "100%",
                  }}
                >
                  {/* <Stack
                  as="span"
                  $style={{
                    color: colors.textTertiary.toHex(),
                    lineHeight: "20px",
                  }}
                >
                  Deposit (50%)
                </Stack> */}
                  <HStack
                    $style={{
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "space-between",
                    }}
                  >
                    <Form.Item<CreateLPPositionProps> name="amount0" noStyle>
                      <Stack
                        as={Input}
                        placeholder="0"
                        $style={{
                          backgroundColor: "transparent !important",
                          border: "none",
                          borderRadius: "0",
                          fontSize: "22px",
                          fontWeight: "500",
                          height: "32px",
                          padding: "0",
                        }}
                      />
                    </Form.Item>
                    <HStack $style={{ alignItems: "center", gap: "8px" }}>
                      <Stack
                        as="img"
                        alt={token0}
                        src={`/tokens/${token0.toLowerCase()}.svg`}
                        $style={{ height: "24px", width: "24px" }}
                      />
                      <Stack
                        as="span"
                        $style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        {token0}
                      </Stack>
                    </HStack>
                  </HStack>
                  <HStack
                    $style={{
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "space-between",
                    }}
                  >
                    <Stack
                      as="span"
                      $style={{
                        color: colors.textTertiary.toHex(),
                        lineHeight: "20px",
                      }}
                    >
                      {toValueFormat(0, currency)}
                    </Stack>
                    {isConnected && (
                      <HStack $style={{ alignItems: "center", gap: "4px" }}>
                        <Stack
                          as="span"
                          $style={{
                            color: colors.textTertiary.toHex(),
                            lineHeight: "20px",
                          }}
                        >
                          {`${t("amount")}: ${toAmountFormat(
                            tokens[token0].balance
                          )}`}
                        </Stack>
                        <Stack
                          as="span"
                          $style={{
                            color: colors.accentFour.toHex(),
                            cursor: "pointer",
                            lineHeight: "20px",
                          }}
                        >
                          MAX
                        </Stack>
                      </HStack>
                    )}
                  </HStack>
                </VStack>
                <VStack
                  $style={{
                    backgroundColor: colors.bgTertiary.toHex(),
                    borderRadius: "12px",
                    gap: "12px",
                    padding: "16px 20px",
                    width: "100%",
                  }}
                >
                  {/* <Stack
                  as="span"
                  $style={{
                    color: colors.textTertiary.toHex(),
                    lineHeight: "20px",
                  }}
                >
                  Deposit (50%)
                </Stack> */}
                  <HStack
                    $style={{
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "space-between",
                    }}
                  >
                    <Form.Item<CreateLPPositionProps> name="amount1" noStyle>
                      <Stack
                        as={Input}
                        placeholder="0"
                        $style={{
                          backgroundColor: "transparent !important",
                          border: "none",
                          borderRadius: "0",
                          fontSize: "22px",
                          fontWeight: "500",
                          height: "32px",
                          padding: "0",
                        }}
                      />
                    </Form.Item>
                    <HStack $style={{ alignItems: "center", gap: "8px" }}>
                      <Stack
                        as="img"
                        alt={token1}
                        src={`/tokens/${token1.toLowerCase()}.svg`}
                        $style={{ height: "24px", width: "24px" }}
                      />
                      <Stack
                        as="span"
                        $style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        {token1}
                      </Stack>
                    </HStack>
                  </HStack>
                  <HStack
                    $style={{
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "space-between",
                    }}
                  >
                    <Stack
                      as="span"
                      $style={{
                        color: colors.textTertiary.toHex(),
                        lineHeight: "20px",
                      }}
                    >
                      {toValueFormat(0, currency)}
                    </Stack>
                    {isConnected && (
                      <HStack $style={{ alignItems: "center", gap: "4px" }}>
                        <Stack
                          as="span"
                          $style={{
                            color: colors.textTertiary.toHex(),
                            lineHeight: "20px",
                          }}
                        >
                          {`${t("amount")}: ${toAmountFormat(
                            tokens[token1].balance
                          )}`}
                        </Stack>
                        <Stack
                          as="span"
                          $style={{
                            color: colors.accentFour.toHex(),
                            cursor: "pointer",
                            lineHeight: "20px",
                          }}
                        >
                          MAX
                        </Stack>
                      </HStack>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              <Stack
                as={Button}
                loading={createPositionButtonLoading}
                disabled={createPositionButtonLoading}
                $style={{ fontSize: "16px", fontWeight: "600 !important" }}
                onClick={handleCreatePosition}
              >
                {createPositionButtonTitle}
              </Stack>
            </VStack>
          </VStack>
        </Stack>
      </Form>
    </VStack>
  );
};
