import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Form, InputNumber } from "antd";
import { StakeFormProps } from "utils/interfaces";
import { useAccount, useBalance } from "wagmi";
import { HashKey, ContractAddress } from "utils/constants";
import constantKeys from "i18n/constant-keys";

// Tab type for better type safety
type TabType = "Stake" | "Withdraw";

interface InitialState {
  activeTab: TabType;
  Percentage?: number;
  loading?: boolean;
  rewards: number;
  stakeWithdrawAmount: number | null;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  
  const initialState: InitialState = {
    activeTab: "Stake",
    rewards: 0,
    stakeWithdrawAmount: null,
  };
  
  const [state, setState] = useState<InitialState>(initialState);
  const [form] = Form.useForm<StakeFormProps>();
  
  // Fetch VULT token balance
  const { data: vultBalance } = useBalance({
    address,
    token: ContractAddress.VULT as `0x${string}`,
  });

  // Format the balance for display
  const formattedBalance = vultBalance ? 
    parseFloat(vultBalance.formatted).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 
    '0';
  
  // Get the raw balance value for calculations
  const rawBalance = vultBalance ? 
    parseFloat(vultBalance.formatted) : 
    0;

  // Format number with commas
  const formatNumber = (value: number | string | undefined) => {
    if (value === undefined) return '';
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleStake = () => {
    // Implementation will be added later
  };
  
  const handleStake_Withdraw = () => {
    // Implementation will be added later
  };

  const handlePercentage = (percentage: number) => {
    // Only apply percentage functionality for the Stake tab
    if (state.activeTab !== "Stake") return;
    
    // Calculate the amount based on the percentage of the wallet balance
    const amount = parseFloat((rawBalance * percentage / 100).toFixed(4));
    
    // Update the form field
    form.setFieldsValue({
      Stake_Withdraw: amount
    });
    
    // Update state
    setState(prevState => ({ 
      ...prevState, 
      Percentage: percentage,
      stakeWithdrawAmount: amount
    }));
  };

  const handleActiveTab = (activeTab: TabType) => {
    // Only process if it's a different tab
    if (activeTab === state.activeTab) return;
    
    // Update state with type-safe values
    setState(prevState => ({
      ...prevState,
      activeTab,
      stakeWithdrawAmount: null,
      Percentage: undefined
    }));
    
    // Reset form values
    form.setFieldsValue({
      Stake_Withdraw: undefined
    });
  };

  // Update form when values change
  const handleChangeValues = (values: { Stake_Withdraw?: number }) => {
    if (values.Stake_Withdraw !== undefined) {
      setState(prevState => ({
        ...prevState,
        stakeWithdrawAmount: values.Stake_Withdraw as number,
        Percentage: undefined
      }));
    }
  };

  // Render the available balance based on active tab
  const renderAvailableBalance = () => {
    if (state.activeTab === "Stake") {
      return (
        <>
          Available: {formattedBalance}
          <span className="balance-with-icon">
            <img src="logo.svg" alt="vult" className="vult-icon" />
          </span>
        </>
      );
    }
    
    return (
      <>
        Available: Coming soon
      </>
    );
  };

  return (
    <>
      <Form
        form={form}
        onFinish={handleStake}
        onValuesChange={handleChangeValues}
        className="staking-page"
      >
        <div className="staking-header">
          <div className="logo-wrapper">
            <img src="logo.svg" alt="staking-header" />
          </div>
          <span className="title">Stake $VULT</span>
        </div>

        <div className="staking">
          <div className="label">Amount Staked</div>
          <div className="input">
            <Form.Item name="Amount" noStyle>
              <InputNumber
                controls={false}
                formatter={formatNumber}
                min={0}
                placeholder="0"
              />
              <div className="ticker">
                <div className="logo-wrapper">
                  <img src="logo.svg" alt="vult" />
                </div>
                <span>VULT</span>
              </div>
            </Form.Item>
          </div>

          <div className="label">Rewards</div>
          <div className="input">
            <div className="rewards-display">
              <span className="rewards-value">{formatNumber(state.rewards)}</span>
              <div className="ticker rewards-ticker">
                <img src="tokens/usdc.svg" alt="usdc" />
                <span>USDC</span>
              </div>
            </div>
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
        onFinish={handleStake_Withdraw}
        onValuesChange={handleChangeValues}
        className="staking-page"
      >
        <div className="stake-withdraw">
          <ul className="switch">
            <li
              className={state.activeTab === "Stake" ? "active" : ""}
              onClick={() => handleActiveTab("Stake")}
            >
              Stake
            </li>
            <li
              className={state.activeTab === "Withdraw" ? "active" : ""}
              onClick={() => handleActiveTab("Withdraw")}
            >
              Withdraw
            </li>
            <div 
              className="tab-indicator"
              style={{ transform: `translateX(${state.activeTab === "Stake" ? 0 : '100%'})` }}
            />
          </ul>
          <div className="amount">
            <Form.Item name="Stake_Withdraw" noStyle>
              <InputNumber
                controls={false}
                formatter={formatNumber}
                min={0}
                placeholder="0"
              />
            </Form.Item>
            <p className="available">
              {renderAvailableBalance()}
            </p>
            <div className="percentage">
              <ul>
                <li
                  className={state.activeTab === "Stake" && state.Percentage === 25 ? "active" : ""}
                  onClick={() => handlePercentage(25)}
                >
                  25%
                </li>
                <li
                  className={state.activeTab === "Stake" && state.Percentage === 50 ? "active" : ""}
                  onClick={() => handlePercentage(50)}
                >
                  50%
                </li>
                <li
                  className={state.activeTab === "Stake" && state.Percentage === 100 ? "active" : ""}
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
