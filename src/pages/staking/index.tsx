import { FC, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout, Spin, Tabs, TabsProps } from "antd";
import { useAccount, useWriteContract } from "wagmi";

import { useBaseContext } from "context";
import { STAKE_ABI } from "utils/abis/stake";
import { ContractAddress, HashKey, PageKey, TickerKey } from "utils/constants";
import { config } from "utils/wagmi-config";
import constantKeys from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";
import api from "utils/api";

import { ChartPie, Layers } from "icons";
import TabContent from "components/staking-tab-content";

const { Content } = Layout;

interface InitialState {
  lastRewardBalance: number;
  loaded: boolean;
  loading: boolean;
  pendingRewards: number;
  totalStaked: number;
  userAmount: number;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    lastRewardBalance: 0,
    loaded: false,
    loading: false,
    pendingRewards: 0,
    totalStaked: 0,
    userAmount: 0,
  };
  const [state, setState] = useState(initialState);
  const {
    lastRewardBalance,
    loaded,
    loading,
    pendingRewards,
    totalStaked,
    userAmount,
  } = state;
  const { changePage, updateWallet, currency } = useBaseContext();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract({ config });
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleClaim = () => {
    if (address && !loading && pendingRewards) {
      setState((prevState) => ({ ...prevState, loading: true }));

      writeContractAsync({
        abi: STAKE_ABI,
        address: ContractAddress.VULT_STAKE,
        functionName: "claim",
        account: address,
      }).finally(() => {
        setState((prevState) => ({ ...prevState, loading: false }));
      });
    }
  };

  const handleReinvest = () => {
    if (address && !loading && pendingRewards) {
      setState((prevState) => ({ ...prevState, loading: true }));

      writeContractAsync({
        abi: STAKE_ABI,
        address: ContractAddress.VULT_STAKE,
        functionName: "reinvest",
        account: address,
      }).finally(() => {
        setState((prevState) => ({ ...prevState, loading: false }));
      });
    }
  };

  const handleUpdate = () => {
    componentDidMount();
    componentDidUpdate();
    updateWallet();
  };

  const handleTab: TabsProps["onTabClick"] = (tab) => {
    navigate(tab);
  };

  const items: TabsProps["items"] = [
    {
      key: constantPaths.stakingStake,
      label: t(constantKeys.STAKE),
      children: (
        <TabContent
          buttonName={t(constantKeys.STAKE)}
          functionName="deposit"
          onUpdate={handleUpdate}
        />
      ),
    },
    {
      key: constantPaths.stakingWithdraw,
      label: t(constantKeys.WITHDRAW),
      children: (
        <TabContent
          buttonName={t(constantKeys.WITHDRAW)}
          functionName="withdraw"
          onUpdate={handleUpdate}
        />
      ),
    },
  ];

  const componentDidUpdate = () => {
    if (address) {
      setState((prevState) => ({ ...prevState, loading: true }));

      Promise.all([api.pendingRewards(address), api.userAmount(address)]).then(
        ([pendingRewards, userAmount]) => {
          setState((prevState) => ({
            ...prevState,
            userAmount,
            loading: false,
            pendingRewards,
          }));
        }
      );
    } else {
      setState((prevState) => ({
        ...prevState,
        userAmount: 0,
        pendingRewards: 0,
      }));
    }
  };

  const componentDidMount = () => {
    changePage(PageKey.STAKING);

    Promise.all([api.lastRewardBalance(), api.totalStaked()]).then(
      ([lastRewardBalance, totalStaked]) => {
        setState((prevState) => ({
          ...prevState,
          lastRewardBalance,
          loaded: true,
          totalStaked,
        }));
      }
    );
  };

  useEffect(componentDidUpdate, [address]);
  useEffect(componentDidMount, []);

  return (
    <Content className="stacking-page">
      <div className="heading">
        <img src="/tokens/vult.svg" alt="staking-header" />
        {t(constantKeys.STAKE_VULT)}
      </div>
      <div className="stats">
        <div className="item">
          <Layers className="icon" />
          <span className="label">{t(constantKeys.REVENUE_TO_DISTRIBUTE)}</span>
          <span className="value">
            {loaded ? (
              `${lastRewardBalance.toPriceFormat(currency)} USDC`
            ) : (
              <Spin size="small" />
            )}
          </span>
        </div>
        <div className="divider" />
        <div className="item">
          <Layers className="icon" />
          <span className="label">{t(constantKeys.TOTAL_VULT_STAKED)}</span>
          <span className="value">
            {loaded ? (
              `${totalStaked.toNumberFormat()} VULT`
            ) : (
              <Spin size="small" />
            )}
          </span>
        </div>
        <div className="divider" />
        <div className="item">
          <ChartPie className="icon" />
          <span className="label">{t(constantKeys.STAKED_SUPPLY)}</span>
          <span className="value">25.4%</span>
        </div>
      </div>
      <Tabs
        activeKey={pathname}
        items={items}
        onTabClick={handleTab}
        className="stake-withdraw"
      />
      <div className="stake-reward">
        <div className="label">{t(constantKeys.AMOUNT_STAKED)}</div>
        <div className="item">
          {loading ? (
            <Spin size="small" />
          ) : (
            <span className="value">{userAmount.toNumberFormat()}</span>
          )}
          <span className="token-dropdown">
            <img
              src={`/tokens/${TickerKey.VULT.toLowerCase()}.svg`}
              alt={TickerKey.VULT}
              className="logo"
            />
            <span className="ticker">{TickerKey.VULT}</span>
          </span>
        </div>
      </div>
      <div className="stake-reward">
        <div className="label">{t(constantKeys.REWARDS)}</div>
        <div className="item">
          {loading ? (
            <Spin size="small" />
          ) : (
            <span className="value">{pendingRewards.toNumberFormat()}</span>
          )}
          <span className="token-dropdown">
            <img
              src={`/tokens/${TickerKey.USDC.toLowerCase()}.svg`}
              alt={TickerKey.USDC}
              className="logo"
            />
            <span className="ticker">{TickerKey.USDC}</span>
          </span>
        </div>
        <div className="balance">{`1 ${TickerKey.VULT} = X ${TickerKey.USDC}`}</div>
        <div className="button-group">
          {isConnected ? (
            <>
              <span
                className={`button button-secondary${
                  loading || !pendingRewards ? " disabled" : ""
                }`}
                onClick={handleReinvest}
              >
                {t(constantKeys.REINVEST)}
              </span>
              <span
                className={`button button-secondary${
                  loading || !pendingRewards ? " disabled" : ""
                }`}
                onClick={handleClaim}
              >
                {t(constantKeys.CLAIM)}
              </span>
            </>
          ) : (
            <Link
              to={HashKey.CONNECT}
              className={`button button-secondary${loading ? " disabled" : ""}`}
            >
              {t(constantKeys.CONNECT_WALLET)}
            </Link>
          )}
        </div>
      </div>
    </Content>
  );
};

export default Component;
