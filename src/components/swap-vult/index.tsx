import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Form, Input, InputNumber, Spin } from "antd";
import { debounce } from "lodash";
import { useAccount } from "wagmi";

import { useBaseContext } from "context";
import { HashKey, TickerKey, uniswapTokens } from "utils/constants";
import { SwapFormProps } from "utils/interfaces";
import { getStoredGasSettings } from "utils/storage";
import useSwapVult from "hooks/swap";
import constantKeys from "i18n/constant-keys";

import { ArrowDownUp, Check, Info, SettingsTwo } from "icons";
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
  const { currency } = useBaseContext();
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

  const handleMode = (settingsMode: boolean) => {
    setState((prevState) => ({ ...prevState, settingsMode }));
  };

  const handleSwap = () => {
    if (address && !approving && !swapping) {
      const { allocateAmount, allocateToken, buyAmount, buyToken } =
        form.getFieldsValue();
      const tokenIn = uniswapTokens[allocateToken];
      const tokenOut = uniswapTokens[buyToken];

      if (needsApproval) {
        setState((prevState) => ({ ...prevState, approving: true }));

        requestApproval(allocateAmount, tokenIn.address, tokenIn.decimals)
          .then((tx) => {
            // returned tx hash
            console.log("approve txHash:", tx);
            setState((prevState) => ({ ...prevState, needsApproval: false }));
          })
          .finally(() => {
            setState((prevState) => ({ ...prevState, approving: false }));
          });
      } else {
        setState((prevState) => ({ ...prevState, swapping: true }));

        executeSwap(allocateAmount, buyAmount, tokenIn, tokenOut)
          .then((txHash) => {
            console.log("swap done:", txHash);
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
            reverse ? tokenB.address : tokenA.address,
            reverse ? tokenB.decimals : tokenA.decimals
          ).then(({ needsApproval }) => needsApproval),
        ]).then(([values, poolPrice, priceImpact, needsApproval]) => {
          console.log("priceImpact: ", priceImpact);

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

  return settingsMode ? (
    <Settings onClose={() => handleMode(false)} />
  ) : (
    <Form
      form={form}
      initialValues={{
        allocateToken: TickerKey.USDC,
        buyToken: TickerKey.UNI,
      }}
      onFinish={handleSwap}
      onValuesChange={handleChangeValues}
      className="swap-vult"
    >
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
                  <span className="price">
                    {(amount * value).toPriceFormat(currency)}
                  </span>
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
                  <span className="price">
                    {(amount * value).toPriceFormat(currency)}
                  </span>
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
            <span className="secondary-button disabled">
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
                    approving ? (
                      <span className="secondary-button disabled">
                        {t(constantKeys.APPROVE)}
                      </span>
                    ) : (
                      <span className="secondary-button" onClick={handleSwap}>
                        {needsApproval
                          ? t(constantKeys.APPROVE)
                          : t(constantKeys.SWAP)}
                      </span>
                    )
                  ) : (
                    <span className="secondary-button disabled">
                      {t(constantKeys.ENTER_AMOUNT)}
                    </span>
                  )}
                </>
              ) : (
                <Link
                  to={HashKey.CONNECT}
                  className={`secondary-button${loading ? " disabled" : ""}`}
                >
                  {t(constantKeys.CONNECT_WALLET)}
                </Link>
              )}
            </>
          );
        }}
      </Form.Item>
    </Form>
  );
};

export default Component;
