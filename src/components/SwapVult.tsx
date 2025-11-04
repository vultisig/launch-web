import { Form, Input, InputNumber, Tooltip } from "antd";
import { debounce } from "lodash";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styled, { useTheme } from "styled-components";
import { useAccount } from "wagmi";

import { TokenDropdown } from "@/components/TokenDropdown";
import { useCore } from "@/hooks/useCore";
import { useSwapVult } from "@/hooks/useSwapVult";
import { ArrowDownUpIcon } from "@/icons/ArrowDownUpIcon";
import { CheckIcon } from "@/icons/CheckIcon";
import { InfoIcon } from "@/icons/InfoIcon";
import { RefreshIcon } from "@/icons/RefreshIcon";
import { SettingsIcon } from "@/icons/SettingsIcon";
import { Button } from "@/toolkits/Button";
import { Spin } from "@/toolkits/Spin";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { modalHash, TxStatus, uniswapTokens } from "@/utils/constants";
import {
  toAmountFormat,
  toNumberFormat,
  toValueFormat,
} from "@/utils/functions";
import { SwapFormProps, TickerKey } from "@/utils/types";

type StateProps = {
  approving?: boolean;
  loading?: boolean;
  maxNetworkFee: number;
  needsApproval?: boolean;
  poolPrice: number;
  priceImpact: number;
  swapping?: boolean;
  values?: Record<TickerKey, number>;
};

export const SwapVult = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({
    maxNetworkFee: 0,
    poolPrice: 0,
    priceImpact: 0,
  });
  const {
    approving,
    loading,
    maxNetworkFee,
    needsApproval,
    priceImpact,
    swapping,
    values,
  } = state;
  const { currency, gasSettings, message, setTransactions, tokens } = useCore();
  const { address, isConnected } = useAccount();
  const [form] = Form.useForm<SwapFormProps>();
  const {
    isWhitelist,
    checkApproval,
    executeSwap,
    getMaxNetworkFee,
    getPoolPrice,
    getPriceImpact,
    getTokensValue,
    getUniswapQuote,
    requestApproval,
  } = useSwapVult();
  const colors = useTheme();

  const handleChangeToken = (ticker: TickerKey, reverse: boolean) => {
    if (!loading) {
      const values = form.getFieldsValue();
      const allocateAmount = reverse ? values.allocateAmount : undefined;
      const allocateToken = reverse ? values.allocateToken : ticker;
      const buyToken = reverse ? ticker : values.buyToken;

      form.setFieldsValue({
        allocateAmount,
        allocateToken,
        buyAmount: undefined,
        buyToken,
      });

      if (allocateAmount) {
        handleUpdateQuote(allocateToken, buyToken, allocateAmount, false);
      }
    }
  };

  const handleChangeValues = debounce(
    ({ allocateAmount, buyAmount }: SwapFormProps, values: SwapFormProps) => {
      if (Number.isFinite(allocateAmount)) {
        form.setFieldValue("buyAmount", undefined);

        if (allocateAmount) {
          handleUpdateQuote(
            values.allocateToken,
            values.buyToken,
            values.allocateAmount,
            false
          );
        }
      }

      if (Number.isFinite(buyAmount)) {
        form.setFieldValue("allocateAmount", undefined);

        if (buyAmount) {
          handleUpdateQuote(
            values.buyToken,
            values.allocateToken,
            values.buyAmount,
            true
          );
        }
      }
    },
    800
  );

  const handleSwap = () => {
    if (address && !approving && !swapping) {
      const values = form.getFieldsValue();
      const tokenIn = values.allocateToken === "ETH" ? uniswapTokens.WETH : uniswapTokens[values.allocateToken];
      const tokenOut = values.buyToken === "ETH" ? uniswapTokens.WETH : uniswapTokens[values.buyToken];

      if (needsApproval) {
        setState((prevState) => ({ ...prevState, approving: true }));

        requestApproval(
          values.allocateAmount,
          tokenIn.address,
          tokenIn.decimals
        )
          .then(() => {
            setState((prevState) => ({ ...prevState, needsApproval: false }));
          })
          .catch(() => {
            setState((prevState) => ({ ...prevState, needsApproval: true }));
          })
          .finally(() => {
            setState((prevState) => ({ ...prevState, approving: false }));
          });
      } else {
        setState((prevState) => ({ ...prevState, swapping: true }));

        executeSwap(values.allocateAmount, values.buyAmount, tokenIn, tokenOut)
          .then((txHash) => {
            if (txHash) {
              const date = new Date();

              setTransactions(address, [
                {
                  ...values,
                  date: date.getTime(),
                  hash: txHash,
                  status: TxStatus.PENDING,
                },
              ]);
            }
          })
          .finally(() => {
            setState((prevState) => ({ ...prevState, swapping: false }));
          });
      }
    }
  };

  const handleSwitchToken = () => {
    if (!loading) {
      const { allocateToken, buyAmount, buyToken } = form.getFieldsValue();

      form.setFieldsValue({
        allocateAmount: buyAmount,
        allocateToken: buyToken,
        buyAmount: undefined,
        buyToken: allocateToken,
      });

      if (buyAmount) {
        handleUpdateQuote(buyToken, allocateToken, buyAmount, false);
      }
    }
  };

  const handleUseFullAmount = (ticker: TickerKey) => {
    if (!loading && isConnected) {
      let fullAmount = tokens[ticker].balance;

      // If the token is ETH, we need to reserve some for gas fees
      if (ticker === "ETH") {
        // Get max network fee using the existing function
        const estimatedGasFeeInCurrency = getMaxNetworkFee(1);
        const ethValuePerUnit = values?.ETH || 1;
        const estimatedGasFeeEth = estimatedGasFeeInCurrency / ethValuePerUnit;

        // Add a 10% buffer to ensure we have enough for gas fluctuations
        const gasFeeWithBuffer = estimatedGasFeeEth * 1.1;

        // If balance is too low, set amount to 0 and show a warning
        if (fullAmount > gasFeeWithBuffer) {
          fullAmount -= gasFeeWithBuffer;
        } else {
          // Show warning message to the user
          message.warning(
            t("insufficientBalance") + ". " + t("pleaseAddMoreEthForGas")
          );
          // Set the amount to 0
          fullAmount = 0;
        }
      }

      // Round to 6 decimal places to avoid floating point precision issues
      fullAmount = Math.floor(fullAmount * 1000000) / 1000000;

      form.setFieldValue("allocateAmount", fullAmount);
      form.setFieldValue("buyAmount", undefined);

      handleUpdateQuote(
        ticker,
        form.getFieldValue("buyToken"),
        fullAmount,
        false
      );
    }
  };

  const handleUpdateQuote = (
    tickerA: TickerKey,
    tickerB: TickerKey,
    amountIn: number,
    reverse: boolean
  ) => {
    const tokenA = tickerA === "ETH" ? uniswapTokens.WETH : uniswapTokens[tickerA];
    const tokenB = tickerB === "ETH" ? uniswapTokens.WETH : uniswapTokens[tickerB];

    setState((prevState) => ({ ...prevState, loading: true }));

    getUniswapQuote(tokenA, tokenB, amountIn)
      .then((amountOut) => {
        Promise.all([
          getTokensValue(),
          getPoolPrice(tokenA, tokenB),
          getPriceImpact(tokenA, tokenB, amountIn),
          checkApproval(
            reverse ? amountOut : amountIn,
            reverse ? tokenB : tokenA
          ).then(({ needsApproval }) => needsApproval),
        ]).then(([values, poolPrice, priceImpact, needsApproval]) => {
          form.setFieldValue(
            reverse ? "allocateAmount" : "buyAmount",
            amountOut
          );

          setState((prevState) => ({
            ...prevState,
            loading: false,
            maxNetworkFee: getMaxNetworkFee(values.ETH),
            needsApproval,
            poolPrice,
            priceImpact,
            values,
          }));
        });
      })
      .catch((error) => {
        console.log(error);

        setState((prevState) => ({ ...prevState, loading: false }));
      });
  };

  const handleRefresh = () => {
    if (!loading) {
      const { allocateToken, buyAmount, buyToken } = form.getFieldsValue();
      handleUpdateQuote(buyToken, allocateToken, buyAmount, false);
    }
  };

  return (
    <Form
      form={form}
      initialValues={{ allocateToken: "USDC", buyToken: "VULT" }}
      onFinish={handleSwap}
      onValuesChange={handleChangeValues}
    >
      <VStack
        $style={{
          backgroundColor: colors.bgSecondary.toHex(),
          borderRadius: "20px",
          gap: "16px",
          padding: "16px",
        }}
      >
        <HStack
          $style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          {loading ? (
            <Spin />
          ) : (
            <Button
              icon={<RefreshIcon fontSize={24} />}
              onClick={handleRefresh}
              ghost
            />
          )}
          <Stack
            as="span"
            $style={{ fontSize: "22px", fontWeight: "500", lineHeight: "24px" }}
          >
            {t("swap")}
          </Stack>
          <Button
            icon={<SettingsIcon fontSize={24} />}
            href={modalHash.settings}
            ghost
          />
        </HStack>
        <VStack $style={{ alignItems: "center" }}>
          <VStack
            $style={{
              borderColor: colors.borderNormal.toHex(),
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "12px",
              padding: "16px",
              width: "100%",
            }}
          >
            <Stack as="span" $style={{ fontSize: "12px", fontWeight: "500" }}>
              {t("iWantToAllocate")}
            </Stack>
            <Form.Item<SwapFormProps>
              shouldUpdate={(prevValues, curValues) =>
                prevValues.allocateToken !== curValues.allocateToken
              }
              noStyle
            >
              {({ getFieldValue }) => {
                const amount: number = getFieldValue("allocateAmount") || 0;
                const ticker: TickerKey = getFieldValue("allocateToken");
                const value: number = values ? values[ticker] : 0;

                return (
                  <>
                    <HStack
                      $style={{ gap: "8px", justifyContent: "space-between" }}
                    >
                      <Form.Item<SwapFormProps> name="allocateAmount" noStyle>
                        <SwapInput
                          controls={false}
                          min={0}
                          placeholder="0"
                          formatter={(value = "") => toNumberFormat(value)}
                          readOnly={loading}
                        />
                      </Form.Item>
                      <TokenDropdown
                        ticker={ticker}
                        onChange={(value) => handleChangeToken(value, false)}
                      />
                    </HStack>
                    <HStack
                      $style={{
                        justifyContent: "space-between",
                        marginTop: "8px",
                      }}
                    >
                      <Stack
                        as="span"
                        $style={{ color: colors.textTertiary.toHex() }}
                      >
                        {toValueFormat(amount * value, currency)}
                      </Stack>
                      {isConnected && (
                        <Tooltip title={t("clickToUseFullAmount")}>
                          <HStack
                            onClick={() => handleUseFullAmount(ticker)}
                            $style={{
                              color: colors.textTertiary.toHex(),
                              cursor: "pointer",
                              gap: "4px",
                            }}
                            $hover={{ color: colors.textSecondary.toHex() }}
                          >
                            <Stack as="span">{`${t("available")}:`}</Stack>
                            <Stack as="span" $style={{ fontWeight: "600" }}>
                              {toAmountFormat(tokens[ticker].balance)}
                            </Stack>
                          </HStack>
                        </Tooltip>
                      )}
                    </HStack>
                  </>
                );
              }}
            </Form.Item>
            <Form.Item<SwapFormProps> name="allocateToken" noStyle>
              <Input type="hidden" />
            </Form.Item>
          </VStack>
          <Stack
            as={Button}
            icon={
              loading ? (
                <Spin size="small" />
              ) : (
                <ArrowDownUpIcon fontSize={20} />
              )
            }
            onClick={handleSwitchToken}
            $style={{
              borderRadius: "12px !important",
              height: "36px !important",
              margin: "-14px 0",
              padding: "0 !important",
              width: "36px",
              zIndex: "1",
            }}
          />
          <VStack
            $style={{
              borderColor: colors.borderNormal.toHex(),
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "12px",
              padding: "16px",
              width: "100%",
            }}
          >
            <Stack as="span" $style={{ fontSize: "12px", fontWeight: "500" }}>
              {t("toBuy")}
            </Stack>
            <Form.Item<SwapFormProps>
              shouldUpdate={(prevValues, curValues) =>
                prevValues.buyToken !== curValues.buyToken
              }
              noStyle
            >
              {({ getFieldValue }) => {
                const amount: number = getFieldValue("buyAmount") || 0;
                const ticker: TickerKey = getFieldValue("buyToken");
                const value: number = values ? values[ticker] : 0;

                return (
                  <>
                    <HStack
                      $style={{ gap: "8px", justifyContent: "space-between" }}
                    >
                      <Form.Item<SwapFormProps> name="buyAmount" noStyle>
                        <SwapInput
                          controls={false}
                          min={0}
                          placeholder="0"
                          formatter={(value = "") => toNumberFormat(value)}
                          readOnly
                        />
                      </Form.Item>
                      <TokenDropdown
                        ticker={ticker}
                        onChange={(value) => handleChangeToken(value, true)}
                      />
                    </HStack>
                    <HStack
                      $style={{
                        justifyContent: "space-between",
                        marginTop: "8px",
                      }}
                    >
                      <Stack
                        as="span"
                        $style={{ color: colors.textTertiary.toHex() }}
                      >
                        {toValueFormat(amount * value, currency)}
                      </Stack>
                      {isConnected && (
                        <HStack
                          $style={{
                            color: colors.textTertiary.toHex(),
                            gap: "4px",
                          }}
                        >
                          <Stack as="span">{`${t("amount")}:`}</Stack>
                          <Stack as="span" $style={{ fontWeight: "600" }}>
                            {toAmountFormat(tokens[ticker].balance)}
                          </Stack>
                        </HStack>
                      )}
                    </HStack>
                  </>
                );
              }}
            </Form.Item>
            <Form.Item<SwapFormProps> name="buyToken" noStyle>
              <Input type="hidden" />
            </Form.Item>
          </VStack>
        </VStack>
        <Form.Item<SwapFormProps>
          shouldUpdate={(prevValues, curValues) =>
            prevValues.allocateAmount !== curValues.allocateAmount ||
            prevValues.buyAmount !== curValues.buyAmount ||
            prevValues.allocateToken !== curValues.allocateToken ||
            prevValues.buyToken !== curValues.buyToken
          }
          noStyle
        >
          {({ getFieldsValue }) => {
            const { allocateAmount, allocateToken, buyAmount, buyToken } =
              getFieldsValue();

            const items =
              allocateAmount && buyAmount
                ? [
                    {
                      color: colors.success.toHex(),
                      label: t("maxSlippage"),
                      value: `${gasSettings.slippage}%`,
                    },
                    {
                      label: t("minReceived"),
                      value: buyAmount * (1 - gasSettings.slippage / 100),
                    },
                    {
                      color: colors.success.toHex(),
                      label: t("networkFeeEst"),
                      value: gasSettings.speed,
                    },
                    {
                      label: t("maxNetworkFee"),
                      value: toValueFormat(maxNetworkFee, currency, 6),
                    },
                    {
                      color: colors.error.toHex(),
                      label: t("priceImpact"),
                      value: `${priceImpact}%`,
                    },
                    {
                      color: colors.success.toHex(),
                      label: t("route"),
                      value: `${allocateToken} → ${buyToken}`,
                    },
                  ]
                : [];

            return loading ? (
              <Button disabled>{t("loading")}</Button>
            ) : (
              <>
                {items.length > 0 && (
                  <VStack $style={{ gap: "12px" }}>
                    {items.map(({ color, label, value }, index) => (
                      <HStack
                        key={index}
                        $style={{
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Stack
                          as="span"
                          $style={{ fontWeight: "500", lineHeight: "24px" }}
                        >
                          {label}
                        </Stack>
                        <Stack
                          as="span"
                          $style={{
                            fontWeight: "500",
                            lineHeight: "24px",
                            ...(color ? { color } : {}),
                          }}
                        >
                          {value}
                        </Stack>
                      </HStack>
                    ))}
                  </VStack>
                )}
                {isConnected ? (
                  <>
                    <HStack
                      $style={{
                        alignItems: "center",
                        borderRadius: "12px",
                        gap: "8px",
                        height: "50px",
                        padding: "0 16px",
                        ...(isWhitelist
                          ? {
                              backgroundColor: colors.success.toRgba(0.1),
                              color: colors.success.toHex(),
                            }
                          : {
                              backgroundColor: colors.bgTertiary.toHex(),
                            }),
                      }}
                    >
                      {isWhitelist ? (
                        <CheckIcon fontSize={16} />
                      ) : (
                        <InfoIcon fontSize={16} />
                      )}
                      <Stack as="span" $style={{ fontWeight: "500" }}>
                        {t(isWhitelist ? "whitelisted" : "notWhitelisted")}
                      </Stack>
                    </HStack>
                    {allocateAmount && buyAmount ? (
                      allocateAmount > tokens[allocateToken].balance ? (
                        <Button disabled>{t("insufficientBalance")}</Button>
                      ) : approving ? (
                        <Button disabled>{t("approve")}</Button>
                      ) : (
                        <Button onClick={handleSwap}>
                          {needsApproval ? t("approve") : t("swap")}
                        </Button>
                      )
                    ) : (
                      <Button disabled>{t("enterAmount")}</Button>
                    )}
                  </>
                ) : (
                  <Button disabled={loading} href={modalHash.connect}>
                    {t("connectWallet")}
                  </Button>
                )}
              </>
            );
          }}
        </Form.Item>
      </VStack>
    </Form>
  );
};

const SwapInput = styled(InputNumber)`
  border: none;
  box-shadow: none;
  outline: none;
  width: 100%;

  .ant-input-number-input {
    color: ${({ theme }) => theme.textSecondary.toHex()};
    font-size: 22px;
    font-weight: 500;
    height: 40px;
    padding: 0;
  }
`;
