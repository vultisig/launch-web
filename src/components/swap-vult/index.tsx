import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dropdown, Form, Input, InputNumber, Popconfirm, Spin } from "antd";
import { debounce } from "lodash";
import { useAccount } from "wagmi";

import { useBaseContext } from "context";
import { HashKey, TickerKey } from "utils/constants";
import { tokens } from "utils/tokens";
import constantKeys from "i18n/constant-keys";

import {
  ArrowDownUp,
  CarFront,
  ChevronDown,
  ChevronLeft,
  Hourglass,
  SettingsTwo,
  Timer,
} from "icons";
import { useUniswapQuote } from "hooks/useSwapQuote";
import useTokenApproval from "hooks/useTokenApproval";
import useTokenSwap from "hooks/useTokenSwap";

interface SettingsFormProps {
  slippage: number;
}

interface SwapFormProps {
  allocateAmount: number;
  allocateCoin: string;
  buyAmount: number;
  buyCoin: string;
}

interface ChildProps {
  changeMode: () => void;
}

interface InitialState {
  advancedMode?: boolean;
  loading?: boolean;
  settingsMode?: boolean;
}

const Settings: FC<ChildProps> = ({ changeMode }) => {
  const { t } = useTranslation();
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { advancedMode } = state;
  const [form] = Form.useForm<SettingsFormProps>();

  const handleMode = (advancedMode: boolean) => {
    setState((prevState) => ({ ...prevState, advancedMode }));
  };

  const handleSlippage = (value: number) => {
    form.setFieldValue("slippage", value);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        console.log(values);
      })
      .catch(() => {});
  };

  return (
    <Form form={form} onFinish={handleSubmit} className="swap-vult">
      <div className="heading">
        <span className="text">{t(constantKeys.SETTINGS)}</span>
        <Popconfirm title={t(constantKeys.CONFIRM)}>
          <span className="reset">{t(constantKeys.RESET)}</span>
        </Popconfirm>
        <ChevronLeft onClick={changeMode} className="toggle" />
      </div>
      <div className="slippage">
        <span className="label">{t(constantKeys.SLIPPAGE)}</span>
        <Form.Item<SettingsFormProps>
          shouldUpdate={(prevValues, curValues) =>
            prevValues.slippage !== curValues.slippage
          }
          noStyle
        >
          {({ getFieldValue }) => {
            const slippage: number = getFieldValue("slippage");

            return (
              <ul className="list">
                <li
                  onClick={() => handleSlippage(0.1)}
                  className={slippage === 0.1 ? "active" : ""}
                >
                  0.1%
                </li>
                <li
                  onClick={() => handleSlippage(0.5)}
                  className={slippage === 0.5 ? "active" : ""}
                >
                  0.5%
                </li>
                <li
                  onClick={() => handleSlippage(1)}
                  className={slippage === 1 ? "active" : ""}
                >
                  1%
                </li>
              </ul>
            );
          }}
        </Form.Item>
        <Form.Item<SettingsFormProps>
          name="slippage"
          rules={[{ required: true }]}
          noStyle
        >
          <InputNumber
            min={0.1}
            max={1.5}
            step={0.1}
            controls={false}
            suffix={t(constantKeys.CUSTOM)}
          />
        </Form.Item>
      </div>
      <div className="tab-menu">
        <span className="title">{t(constantKeys.TRANSACTION_SETTINGS)}</span>
        <div className="items">
          <span
            onClick={() => handleMode(false)}
            className={`item${advancedMode ? "" : " active"}`}
          >
            {t(constantKeys.BASIC)}
          </span>
          <span
            onClick={() => handleMode(false)}
            className={`item${advancedMode ? " active" : ""}`}
          >
            {t(constantKeys.ADVANCED)}
          </span>
        </div>
      </div>
      <div className={`basic-tab${advancedMode ? "" : " active"}`}>
        <div className="item active">
          <Timer className="icon" />
          <span className="title">
            <span className="text">{t(constantKeys.FAST)}</span>
            <span className="speed">~10s</span>
          </span>
          <span className="gwei">0 - 0.004293 Gwei</span>
        </div>
        <div className="item">
          <CarFront className="icon" />
          <span className="title">
            <span className="text">{t(constantKeys.STANDARD)}</span>
            <span className="speed">~30s</span>
          </span>
          <span className="gwei">0 - 0.003786 Gwei</span>
        </div>
        <div className="item">
          <Hourglass className="icon" />
          <span className="title">
            <span className="text">{t(constantKeys.SLOW)}</span>
            <span className="speed">~120s</span>
          </span>
          <span className="gwei">0 - 0.002864 Gwei</span>
        </div>
      </div>
      <div className={`advanced-tab${advancedMode ? " active" : ""}`}></div>
    </Form>
  );
};

const Swap: FC<ChildProps> = ({ changeMode }) => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();
  const { isConnected } = useAccount();
  const [form] = Form.useForm<SwapFormProps>();
  const {
    quote,
    loading: quoteLoading,
    error: _quoteError,
  } = useUniswapQuote();

  const { isApproving, needsApproval, requestApproval } = useTokenApproval(
    tokens[form.getFieldValue("allocateCoin") as TickerKey],
    Number(form.getFieldValue("allocateAmount"))
  );

  const {
    executeSwap,
    isSwapping,
    swapError: _swapError,
    txHash,
  } = useTokenSwap({
    tokenIn: tokens[form.getFieldValue("allocateCoin") as TickerKey],
    tokenOut: tokens[form.getFieldValue("buyCoin") as TickerKey],
    amountIn: Number(form.getFieldValue("allocateAmount") ?? 0),
  });

  const handleChangeAmount = debounce(
    (amount: number | null, reverse?: boolean) => {
      if (!quoteLoading) {
        if (amount) {
          const tickerA: TickerKey = form.getFieldValue("allocateCoin");
          const tickerB: TickerKey = form.getFieldValue("buyCoin");
          const tokenA = reverse ? tokens[tickerB] : tokens[tickerA];
          const tokenB = reverse ? tokens[tickerA] : tokens[tickerB];

          quote(tokenA, tokenB, amount).then((resAmount) => {
            form.setFieldValue(
              reverse ? "allocateAmount" : "buyAmount",
              resAmount
            );
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
    //ignore switch denom for now
    return
    form.setFieldsValue({
      allocateAmount: form.getFieldValue("buyAmount"),
      allocateCoin: form.getFieldValue("buyCoin"),
      buyAmount: form.getFieldValue("allocateAmount"),
      buyCoin: form.getFieldValue("allocateCoin"),
    });
  };

  return (
    <Form
      form={form}
      initialValues={{
        allocateCoin: TickerKey.USDC,
        buyCoin: TickerKey.WETH,
      }}
      onFinish={handleSwap}
      className="swap-vult"
    >
      <div className="heading">
        <span className="text">{t(constantKeys.SWAP)}</span>
        <SettingsTwo onClick={changeMode} className="toggle" />
      </div>
      <div className="swap">
        <div className="item">
          <span className="title">{t(constantKeys.I_WANT_TO_ALLOCATE)}</span>
          <div className="balance">
            <Form.Item<SwapFormProps> name="allocateAmount" noStyle>
              <InputNumber
                controls={false}
                formatter={(value) => `${value}`.toNumberFormat()}
                min={0}
                onChange={(value) => handleChangeAmount(value)}
                placeholder="0"
              />
            </Form.Item>
            <Form.Item<SwapFormProps> name="allocateCoin" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item<SwapFormProps>
              shouldUpdate={(prevValues, curValues) =>
                prevValues.allocateCoin !== curValues.allocateCoin
              }
              noStyle
            >
              {({ getFieldValue }) => {
                const ticker: string = getFieldValue("allocateCoin");

                return (
                  <Dropdown
                    menu={{ items: [] }}
                    className="token-dropdown"
                    rootClassName="token-dropdown-menu"
                  >
                    <span>
                      <img
                        src={`/tokens/${ticker.toLowerCase()}.svg`}
                        alt={ticker}
                        className="logo"
                      />
                      <span className="ticker">{ticker}</span>
                      <ChevronDown className="arrow" />
                    </span>
                  </Dropdown>
                );
              }}
            </Form.Item>
          </div>
          <span className="price">{(0).toPriceFormat(currency)}</span>
        </div>
        <div className="switch" onClick={handleSwitch}>
          {quoteLoading ? <Spin /> : <ArrowDownUp />}
        </div>
        <div className="item">
          <span className="title">{t(constantKeys.TO_BUY)}</span>
          <div className="balance">
            <Form.Item<SwapFormProps> name="buyAmount" noStyle>
              <InputNumber
                controls={false}
                formatter={(value) => `${value}`.toNumberFormat()}
                min={0}
                onChange={(value) => handleChangeAmount(value, true)}
                placeholder="0"
              />
            </Form.Item>
            <Form.Item<SwapFormProps> name="buyCoin" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item<SwapFormProps>
              shouldUpdate={(prevValues, curValues) =>
                prevValues.buyCoin !== curValues.buyCoin
              }
              noStyle
            >
              {({ getFieldValue }) => {
                const ticker: string = getFieldValue("buyCoin");

                return (
                  <Dropdown
                    menu={{ items: [] }}
                    className="token-dropdown"
                    rootClassName="token-dropdown-menu"
                  >
                    <span className="token-dropdown">
                      <img
                        src={`/tokens/${ticker.toLowerCase()}.svg`}
                        alt={ticker}
                        className="logo"
                      />
                      <span className="ticker">{ticker}</span>
                      <ChevronDown className="arrow" />
                    </span>
                  </Dropdown>
                );
              }}
            </Form.Item>
          </div>
          <span className="price">{(0).toPriceFormat(currency)}</span>
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
                {needsApproval ? t(constantKeys.APPROVE) : t(constantKeys.SWAP)}
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

const Component: FC = () => {
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { settingsMode } = state;

  const handleMode = (settingsMode: boolean) => {
    setState((prevState) => ({ ...prevState, settingsMode }));
  };

  return settingsMode ? (
    <Settings changeMode={() => handleMode(false)} />
  ) : (
    <Swap changeMode={() => handleMode(true)} />
  );
};

export default Component;
