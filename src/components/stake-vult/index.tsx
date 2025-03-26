import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Form, InputNumber } from "antd";
import { StakeFormProps } from "utils/interfaces";
import { useAccount } from "wagmi";
import { HashKey } from "utils/constants";
import constantKeys from "i18n/constant-keys";

const Component: FC = () => {
  const { t } = useTranslation();
  interface InitialState {
    activeTab: string;
    Percentage?: number;
    loading?: boolean;
  }
  const initialState: InitialState = {
    activeTab: "Stake",
  };
  const [state, setState] = useState(initialState);
  const [form] = Form.useForm<StakeFormProps>();
  const { isConnected } = useAccount();

  const handleStake = () => {};
  const handleStake_Withdraw = () => {};
  const handleChangeValues = () => {};

  const handlePercentage = (Percentage: number) => {
    setState((prevState) => ({ ...prevState, Percentage }));
  };

  const handleActiveTab = (activeTab: string) => {
    setState((prevState) => ({ ...prevState, activeTab }));
  };

  return (
    <>
      <Form
        form={form}
        // initialValues={{
        //   allocateToken: TickerKey.USDC,
        //   buyToken: TickerKey.UNI,
        // }}
        onFinish={handleStake}
        onValuesChange={handleChangeValues}
        className="staking-page"
      >
        <div className="staking-header">
          <div className="logo-wrapper">
            <img src="logo.svg" alt="staking-header" />
          </div>
          <span className="title">Stake $Vult Now</span>
        </div>

        <div className="staking">
          <div className="label">Amount Staked</div>
          <div className="input">
            <Form.Item<StakeFormProps> name="Amount" noStyle>
              <InputNumber
                controls={false}
                formatter={(value) => `${value}`.toNumberFormat()}
                min={0}
                placeholder="0"
              />
              <div className="ticker">
                <div className="logo-wrapper">
                  <img src="logo.svg" />
                </div>
                <span>VULT</span>
              </div>
            </Form.Item>
          </div>

          <div className="label">Rewards</div>
          <div className="input">
            <Form.Item<StakeFormProps> name="Rewards" noStyle>
              <InputNumber
                controls={false}
                formatter={(value) => `${value}`.toNumberFormat()}
                min={0}
                placeholder="0"
              />
              <div className="ticker rewards-ticker">
                <img src="tokens/usdc.svg" />
                <span>USDC</span>
              </div>
            </Form.Item>
          </div>

          <div className="result">1 USDC = X Vult</div>

          {isConnected ? (
            <button disabled>Reinvest</button>
          ) : (
            <Link
              to={HashKey.CONNECT}
              className={`secondary-button${state.loading ? " disabled" : ""}`}
            >
              {t(constantKeys.CONNECT_WALLET)}
            </Link>
          )}
        </div>
      </Form>
      <Form
        form={form}
        // initialValues={{
        //   allocateToken: TickerKey.USDC,
        //   buyToken: TickerKey.UNI,
        // }}
        onFinish={handleStake}
        onValuesChange={handleStake_Withdraw}
        className="staking-page"
      >
        <div className="stake-withdraw">
          <ul className="switch">
            <li
              className={state.activeTab == "Stake" ? "active" : ""}
              onClick={() => handleActiveTab("Stake")}
            >
              Stake
            </li>
            <li
              className={state.activeTab == "Withdraw" ? "active" : ""}
              onClick={() => handleActiveTab("Withdraw")}
            >
              Withdraw
            </li>
          </ul>
          <div className="amount">
            <Form.Item<StakeFormProps> name="Stake_Withdraw" noStyle>
              <InputNumber
                controls={false}
                formatter={(value) => `${value}`.toNumberFormat()}
                min={0}
                placeholder="0"
              />
            </Form.Item>
            <p className="available">Available: $1,000</p>
            <div className="percentage">
              <ul>
                <li
                  className={state.Percentage == 25 ? "active" : ""}
                  onClick={() => handlePercentage(25)}
                >
                  25%
                </li>
                <li
                  className={state.Percentage == 50 ? "active" : ""}
                  onClick={() => handlePercentage(50)}
                >
                  50%
                </li>
                <li
                  className={state.Percentage == 100 ? "active" : ""}
                  onClick={() => handlePercentage(100)}
                >
                  Max
                </li>
              </ul>
            </div>
            {isConnected ? (
              <button disabled>{state.activeTab}</button>
            ) : (
              <Link
                to={HashKey.CONNECT}
                className={`secondary-button${
                  state.loading ? " disabled" : ""
                }`}
              >
                {t(constantKeys.CONNECT_WALLET)}
              </Link>
            )}
          </div>
        </div>
      </Form>
    </>
  );
};

export default Component;
