import { Form, Input, InputNumber, Tooltip } from "antd";
import { debounce } from "lodash";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { useAccount } from "wagmi";

import { TokenDropdown } from "@/components/TokenDropdown";
import { useCore } from "@/hooks/useCore";
import { useSwapVult } from "@/hooks/useSwapVult";
import { ArrowDownUpIcon } from "@/icons/ArrowDownUpIcon";
import { CheckIcon } from "@/icons/CheckIcon";
import { InfoIcon } from "@/icons/InfoIcon";
import { RefreshIcon } from "@/icons/RefreshIcon";
import { SettingsIcon } from "@/icons/SettingsIcon";
import { getGasSettings } from "@/storage/gasSettings";
import { setTransaction } from "@/storage/transaction";
import { Button } from "@/toolkits/Button";
import { Spin } from "@/toolkits/Spin";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { modalHash, uniswapTokens } from "@/utils/constants";
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
  const { currency, message, tokens } = useCore();
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
  const gasSettings = getGasSettings();
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
      if (allocateAmount !== undefined) {
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

      if (buyAmount !== undefined) {
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
      const tokenIn = uniswapTokens[values.allocateToken];
      const tokenOut = uniswapTokens[values.buyToken];

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

              setTransaction(address, {
                ...values,
                date: date.getTime(),
                hash: txHash,
                status: "pending",
              });
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
    const tokenA = uniswapTokens[tickerA];
    const tokenB = uniswapTokens[tickerB];

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
      initialValues={{ allocateToken: "USDC", buyToken: "UNI" }}
      onFinish={handleSwap}
      onValuesChange={handleChangeValues}
      className="swap-vult"
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
        <div className="swap">
          <div className="item">
            <span className="title">{t("iWantToAllocate")}</span>
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
                    <div className="balance">
                      <Form.Item<SwapFormProps> name="allocateAmount" noStyle>
                        <InputNumber
                          controls={false}
                          formatter={(value = 0) => toNumberFormat(value)}
                          min={0}
                          placeholder="0"
                          readOnly={loading}
                        />
                      </Form.Item>
                      <TokenDropdown
                        ticker={ticker}
                        onChange={(value) => handleChangeToken(value, false)}
                      />
                    </div>
                    <div className="price">
                      <span>{toValueFormat(amount * value, currency)}</span>
                      {isConnected && (
                        <Tooltip title={t("clickToUseFullAmount")}>
                          <span
                            className="available-balance clickable"
                            onClick={() => handleUseFullAmount(ticker)}
                          >
                            {t("available")}:{" "}
                            <span className="balance-amount">
                              {toAmountFormat(tokens[ticker].balance)}
                            </span>
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </>
                );
              }}
            </Form.Item>
            <Form.Item<SwapFormProps> name="allocateToken" noStyle>
              <Input type="hidden" />
            </Form.Item>
          </div>
          <div className="switch" onClick={handleSwitchToken}>
            {loading ? <Spin /> : <ArrowDownUpIcon />}
          </div>
          <div className="item">
            <span className="title">{t("toBuy")}</span>
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
                    <div className="balance">
                      <Form.Item<SwapFormProps> name="buyAmount" noStyle>
                        <InputNumber
                          controls={false}
                          formatter={(value = 0) => toNumberFormat(value)}
                          min={0}
                          placeholder="0"
                          readOnly={loading}
                        />
                      </Form.Item>
                      <TokenDropdown
                        ticker={ticker}
                        onChange={(value) => handleChangeToken(value, true)}
                      />
                    </div>
                    <div className="price">
                      <span>{toValueFormat(amount * value, currency)}</span>
                      {isConnected && (
                        <span>
                          {`${t("amount")}: ${toAmountFormat(
                            tokens[ticker].balance
                          )}`}
                        </span>
                      )}
                    </div>
                  </>
                );
              }}
            </Form.Item>
            <Form.Item<SwapFormProps> name="buyToken" noStyle>
              <Input type="hidden" />
            </Form.Item>
          </div>
        </div>
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

            return loading ? (
              <Button disabled>{t("loading")}</Button>
            ) : (
              <>
                {allocateAmount && buyAmount ? (
                  <div className="info">
                    <div className="item">
                      <span className="label">{t("maxSlippage")}</span>
                      <span className="value success">{`${gasSettings.slippage}%`}</span>
                    </div>
                    <div className="item">
                      <span className="label">{t("minReceived")}</span>
                      <span className="value">
                        {buyAmount * (1 - gasSettings.slippage / 100)}
                      </span>
                    </div>
                    <div className="item">
                      <span className="label">{t("networkFeeEst")}</span>
                      <span className="value success">{gasSettings.speed}</span>
                    </div>
                    <div className="item">
                      <span className="label">{t("maxNetworkFee")}</span>
                      <span className="value">
                        {toValueFormat(maxNetworkFee, currency, 6)}
                      </span>
                    </div>
                    <div className="item">
                      <span className="label">{t("priceImpact")}</span>
                      <span className="value error">{`${priceImpact}%`}</span>
                    </div>
                    <div className="item">
                      <span className="label">{t("route")}</span>
                      <span className="value success">{`${allocateToken} → ${buyToken}`}</span>
                    </div>
                  </div>
                ) : null}
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
