import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Form, Input, InputNumber, Spin } from "antd";
import { debounce } from "lodash";
import { useAccount } from "wagmi";

import { useBaseContext } from "context";
import { HashKey, TickerKey, uniswapTokens } from "utils/constants";
import { SwapFormProps } from "utils/interfaces";
import { getPoolPrice, getTokensValue, getUniswapQuote } from "utils/swap";
import useTokenApproval from "hooks/useTokenApproval";
import useTokenSwap from "hooks/useTokenSwap";
import constantKeys from "i18n/constant-keys";

import { ArrowDownUp, SettingsTwo } from "icons";
import Settings from "components/swap-settings";
import TokenDropdown from "components/token-dropdown";

interface InitialState {
  loading?: boolean;
  settingsMode?: boolean;
  values: Record<TickerKey, number>;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    values: {
      [TickerKey.ETH]: 0,
      [TickerKey.UNI]: 0,
      [TickerKey.USDC]: 0,
      [TickerKey.WETH]: 0,
    },
  };
  const [state, setState] = useState(initialState);
  const { loading, settingsMode, values } = state;
  const { currency } = useBaseContext();
  const { isConnected } = useAccount();
  const [form] = Form.useForm<SwapFormProps>();

  const { isApproving, needsApproval, requestApproval } = useTokenApproval(
    uniswapTokens[form.getFieldValue("allocateCoin") as TickerKey],
    Number(form.getFieldValue("allocateAmount"))
  );

  const {
    executeSwap,
    isSwapping,
    swapError: _swapError,
    txHash,
  } = useTokenSwap({
    tokenIn: uniswapTokens[form.getFieldValue("allocateCoin") as TickerKey],
    tokenOut: uniswapTokens[form.getFieldValue("buyCoin") as TickerKey],
    amountIn: Number(form.getFieldValue("allocateAmount") ?? 0),
    amountOut: Number(form.getFieldValue("buyAmount") ?? 0),
  });

  const handleChangeAmount = debounce(
    (amount: number | null, reverse?: boolean) => {
      if (!loading) {
        if (amount) {
          const tickerA: TickerKey = form.getFieldValue("allocateCoin");
          const tickerB: TickerKey = form.getFieldValue("buyCoin");
          const tokenA = reverse
            ? uniswapTokens[tickerB]
            : uniswapTokens[tickerA];
          const tokenB = reverse
            ? uniswapTokens[tickerA]
            : uniswapTokens[tickerB];

          setState((prevState) => ({ ...prevState, loading: true }));

          Promise.all([
            getUniswapQuote(tokenA, tokenB, amount).catch(() => (0).toFixed(2)),
            getTokensValue(),
            getPoolPrice(tokenA, tokenB),
          ]).then(([resAmount, values, _poolPrice]) => {
            //console.log("poolPrice", poolPrice);

            form.setFieldValue(
              reverse ? "allocateAmount" : "buyAmount",
              resAmount
            );

            setState((prevState) => ({
              ...prevState,
              loading: false,
              values,
            }));
          });
        } else {
          form.setFieldValue(reverse ? "allocateAmount" : "buyAmount", 0);
        }
      }
    },
    400
  );

  const handleSwap = () => {
    if (!isSwapping && !isApproving) {
      form
        .validateFields()
        .then(() => {
          if (needsApproval) {
            requestApproval();
          } else {
            executeSwap().then(() => {
              console.log("swap done:", txHash);
            });
          }
        })
        .catch(() => {});
    }
  };

  const handleSwitch = () => {
    form.setFieldsValue({
      allocateAmount: form.getFieldValue("buyAmount"),
      allocateCoin: form.getFieldValue("buyCoin"),
      buyAmount: form.getFieldValue("allocateAmount"),
      buyCoin: form.getFieldValue("allocateCoin"),
    });
  };

  const handleMode = (settingsMode: boolean) => {
    setState((prevState) => ({ ...prevState, settingsMode }));
  };

  return settingsMode ? (
    <Settings onClose={() => handleMode(false)} />
  ) : (
    <Form
      form={form}
      initialValues={{
        allocateCoin: TickerKey.USDC,
        buyCoin: TickerKey.UNI,
      }}
      onFinish={handleSwap}
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
              prevValues.allocateCoin !== curValues.allocateCoin
            }
            noStyle
          >
            {({ getFieldValue }) => {
              const amount: number = getFieldValue("allocateAmount") || 0;
              const ticker: TickerKey = getFieldValue("allocateCoin");

              return (
                <>
                  <div className="balance">
                    <Form.Item<SwapFormProps> name="allocateAmount" noStyle>
                      <InputNumber
                        controls={false}
                        formatter={(value) => `${value}`.toNumberFormat()}
                        min={0}
                        onChange={(value) => handleChangeAmount(value)}
                        placeholder="0"
                        readOnly={loading}
                      />
                    </Form.Item>
                    <TokenDropdown
                      ticker={ticker}
                      onChange={(value) =>
                        form.setFieldValue("allocateCoin", value)
                      }
                    />
                  </div>
                  <span className="price">
                    {(amount * values[ticker]).toPriceFormat(currency)}
                  </span>
                </>
              );
            }}
          </Form.Item>
          <Form.Item<SwapFormProps> name="allocateCoin" noStyle>
            <Input type="hidden" />
          </Form.Item>
        </div>
        <div className="switch" onClick={handleSwitch}>
          {loading ? <Spin /> : <ArrowDownUp />}
        </div>
        <div className="item">
          <span className="title">{t(constantKeys.TO_BUY)}</span>
          <Form.Item<SwapFormProps>
            shouldUpdate={(prevValues, curValues) =>
              prevValues.buyCoin !== curValues.buyCoin
            }
            noStyle
          >
            {({ getFieldValue }) => {
              const amount: number = getFieldValue("buyAmount") || 0;
              const ticker: TickerKey = getFieldValue("buyCoin");

              return (
                <>
                  <div className="balance">
                    <Form.Item<SwapFormProps> name="buyAmount" noStyle>
                      <InputNumber
                        controls={false}
                        formatter={(value) => `${value}`.toNumberFormat()}
                        min={0}
                        onChange={(value) => handleChangeAmount(value, true)}
                        placeholder="0"
                        readOnly={loading}
                      />
                    </Form.Item>
                    <TokenDropdown
                      ticker={ticker}
                      onChange={(value) => form.setFieldValue("buyCoin", value)}
                    />
                  </div>
                  <span className="price">
                    {(amount * values[ticker]).toPriceFormat(currency)}
                  </span>
                </>
              );
            }}
          </Form.Item>
          <Form.Item<SwapFormProps> name="buyCoin" noStyle>
            <Input type="hidden" />
          </Form.Item>
        </div>
      </div>
      <Form.Item<SwapFormProps>
        shouldUpdate={(prevValues, curValues) =>
          prevValues.buyCoin !== curValues.buyCoin
        }
        noStyle
      >
        {({ getFieldValue }) => {
          const allocateAmount: number = getFieldValue("allocateAmount");
          const buyAmount: number = getFieldValue("buyAmount");

          return isConnected ? (
            allocateAmount && buyAmount ? (
              <span
                className={`secondary-button ${isApproving ? "disabled" : ""}`}
                onClick={handleSwap}
              >
                {needsApproval && !isApproving
                  ? t(constantKeys.APPROVE)
                  : t(constantKeys.SWAP)}
              </span>
            ) : (
              <span className="secondary-button disabled">
                {t(constantKeys.ENTER_AMOUNT)}
              </span>
            )
          ) : (
            <Link to={HashKey.CONNECT} className="secondary-button">
              {t(constantKeys.CONNECT_WALLET)}
            </Link>
          );
        }}
      </Form.Item>
    </Form>
  );
};

export default Component;
