import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Form, Input, InputNumber, Spin, Tooltip, message } from "antd";
import { debounce } from "lodash";
import { useAccount } from "wagmi";

import { useBaseContext } from "context";
import { HashKey, TickerKey, TxStatus, uniswapTokens } from "utils/constants";
import { SwapFormProps } from "utils/interfaces";
import { getStoredGasSettings, setStoredTransaction } from "utils/storage";
import useSwapVult from "hooks/swap";
import constantKeys from "i18n/constant-keys";

import { ArrowDownUp, Check, Info, RefreshCW, SettingsTwo } from "icons";
import Settings from "components/swap-settings";
import TokenDropdown from "components/token-dropdown";

interface InitialState {
  approving?: boolean;
  loading?: boolean;
  maxNetworkFee: number;
  needsApproval?: boolean;
  poolPrice: number;
  priceImpact: number;
  settingsMode?: boolean;
  swapping?: boolean;
  values?: Record<TickerKey, number>;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const initialState: InitialState = {
    maxNetworkFee: 0,
    poolPrice: 0,
    priceImpact: 0,
  };
  const [state, setState] = useState(initialState);
  const {
    approving,
    loading,
    maxNetworkFee,
    needsApproval,
    priceImpact,
    settingsMode,
    swapping,
    values,
  } = state;
  const { currency, tokens, updateTokenBalances } = useBaseContext();
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
    getTxStatus,
  } = useSwapVult();
  const gasSettings = getStoredGasSettings();

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

  const handleMode = (settingsMode: boolean, updated?: boolean) => {
    setState((prevState) => ({ ...prevState, settingsMode }));

    if (updated)
      form.setFieldsValue({
        allocateAmount: undefined,
        buyAmount: undefined,
      });
  };

  const waitForTxConfirmation = async (txHash: string) => {
    const status = await getTxStatus(txHash);
    switch (status) {
      case TxStatus.PENDING:
        setState((prevState) => ({ ...prevState, approving: true }));
        setTimeout(() => {
          waitForTxConfirmation(txHash);
        }, 1000);
        break;
      case TxStatus.FAILED:
        setState((prevState) => ({
          ...prevState,
          approving: false,
          needsApproval: true,
        }));
        break;
      case TxStatus.SUCCESS:
        setState((prevState) => ({
          ...prevState,
          approving: false,
          needsApproval: false,
        }));
        break;
    }
  };

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
          .then((txHash) => {
            waitForTxConfirmation(txHash);
          })
          .catch(() => {
            setState((prevState) => ({
              ...prevState,
              needsApproval: true,
              approving: false,
            }));
          });
      } else {
        setState((prevState) => ({ ...prevState, swapping: true }));

        executeSwap(values.allocateAmount, values.buyAmount, tokenIn, tokenOut)
          .then((txHash) => {
            if (txHash) {
              const date = new Date();

              setStoredTransaction(address, {
                ...values,
                date: date.getTime(),
                hash: txHash,
                status: TxStatus.PENDING,
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
      if (ticker === TickerKey.ETH) {
        // Get max network fee using the existing function
        const estimatedGasFeeInCurrency = getMaxNetworkFee(1);
        const ethValuePerUnit = values?.[TickerKey.ETH] || 1;
        const estimatedGasFeeEth = estimatedGasFeeInCurrency / ethValuePerUnit;

        // Add a 10% buffer to ensure we have enough for gas fluctuations
        const gasFeeWithBuffer = estimatedGasFeeEth * 1.1;

        // If balance is too low, set amount to 0 and show a warning
        if (fullAmount > gasFeeWithBuffer) {
          fullAmount -= gasFeeWithBuffer;
        } else {
          // Show warning message to the user
          messageApi.warning(
            t(constantKeys.INSUFFICIENT_BALANCE) +
              ". " +
              t(constantKeys.PLEASE_ADD_MORE_ETH_FOR_GAS)
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
            maxNetworkFee: getMaxNetworkFee(values[TickerKey.ETH]),
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
      updateTokenBalances([tokens[allocateToken], tokens[buyToken]]);
    }
  };

  return (
    <>
      {contextHolder}
      <Settings onClose={handleMode} visible={settingsMode} />
      <Form
        form={form}
        initialValues={{
          allocateToken: TickerKey.USDC,
          buyToken: TickerKey.UNI,
        }}
        onFinish={handleSwap}
        onValuesChange={handleChangeValues}
        className="swap-vult"
        style={{ display: settingsMode ? "none" : undefined }}
      >
        <RefreshCW
          className={`refresh ${loading ? "spinning" : ""}`}
          onClick={handleRefresh}
        />
        <div className="heading">
          <span className="text">{t(constantKeys.SWAP)}</span>
          <SettingsTwo onClick={() => handleMode(true)} className="toggle" />
        </div>
        <div className="swap">
          <div className="item">
            <span className="title">{t(constantKeys.I_WANT_TO_ALLOCATE)}</span>
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
                          formatter={(value) => `${value}`.toNumberFormat()}
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
                      <span>{(amount * value).toPriceFormat(currency)}</span>
                      {isConnected && (
                        <Tooltip
                          title={t(constantKeys.CLICK_TO_USE_FULL_AMOUNT)}
                        >
                          <span
                            className="available-balance clickable"
                            onClick={() => handleUseFullAmount(ticker)}
                          >
                            {t(constantKeys.AVAILABLE)}:{" "}
                            <span className="balance-amount">
                              {tokens[ticker].balance.toBalanceFormat()}
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
            {loading ? <Spin /> : <ArrowDownUp />}
          </div>
          <div className="item">
            <span className="title">{t(constantKeys.TO_BUY)}</span>
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
                          formatter={(value) => `${value}`.toNumberFormat()}
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
                      <span>{(amount * value).toPriceFormat(currency)}</span>
                      {isConnected && (
                        <span>
                          {t(constantKeys.AMOUNT)}:{" "}
                          {tokens[ticker].balance.toBalanceFormat()}
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
              <span className="button button-secondary disabled">
                {t(constantKeys.LOADING)}
              </span>
            ) : (
              <>
                {allocateAmount && buyAmount ? (
                  <div className="info">
                    <div className="item">
                      <span className="label">
                        {t(constantKeys.MAX_SLIPPAGE)}
                      </span>
                      <span className="value success">{`${gasSettings.slippage}%`}</span>
                    </div>
                    <div className="item">
                      <span className="label">
                        {t(constantKeys.MIN_RECEIVED)}
                      </span>
                      <span className="value">
                        {buyAmount * (1 - gasSettings.slippage / 100)}
                      </span>
                    </div>
                    <div className="item">
                      <span className="label">
                        {t(constantKeys.NETWORK_FEE_EST)}
                      </span>
                      <span className="value success">{gasSettings.speed}</span>
                    </div>
                    <div className="item">
                      <span className="label">
                        {t(constantKeys.MAX_NETWORK_FEE)}
                      </span>
                      <span className="value">
                        {maxNetworkFee.toPriceFormat(currency, 6)}
                      </span>
                    </div>
                    <div className="item">
                      <span className="label">
                        {t(constantKeys.PRICE_IMPACT)}
                      </span>
                      <span className="value error">{`${priceImpact}%`}</span>
                    </div>
                    <div className="item">
                      <span className="label">{t(constantKeys.ROUTE)}</span>
                      <span className="value success">{`${allocateToken} → ${buyToken}`}</span>
                    </div>
                  </div>
                ) : null}
                {isConnected ? (
                  <>
                    {isWhitelist ? (
                      <div className="whitelist islisted">
                        <Check />
                        {t(constantKeys.WHITELISTED)}
                      </div>
                    ) : (
                      <div className="whitelist notlisted">
                        <Info />
                        {t(constantKeys.NOT_WHITELISTED)}
                      </div>
                    )}
                    {allocateAmount && buyAmount ? (
                      allocateAmount > tokens[allocateToken].balance ? (
                        <span className="button button-secondary disabled">
                          {t(constantKeys.INSUFFICIENT_BALANCE)}
                        </span>
                      ) : approving ? (
                        <span className="button button-secondary disabled">
                          <Spin size="small" style={{ marginRight: 8 }} />
                          {t(constantKeys.APPROVING)}
                        </span>
                      ) : (
                        <span
                          className="button button-secondary"
                          onClick={handleSwap}
                        >
                          {needsApproval
                            ? t(constantKeys.APPROVE)
                            : t(constantKeys.SWAP)}
                        </span>
                      )
                    ) : (
                      <span className="button button-secondary disabled">
                        {t(constantKeys.ENTER_AMOUNT)}
                      </span>
                    )}
                  </>
                ) : (
                  <Link
                    to={HashKey.CONNECT}
                    className={`button button-secondary${
                      loading ? " disabled" : ""
                    }`}
                  >
                    {t(constantKeys.CONNECT_WALLET)}
                  </Link>
                )}
              </>
            );
          }}
        </Form.Item>
      </Form>
    </>
  );
};

export default Component;
