import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout, Spin } from "antd";

import { useBaseContext } from "context";
import { PageKey } from "utils/constants";
import constantKeys from "i18n/constant-keys";
import api from "utils/api";

import { ChartPie, Layers } from "icons";
import StakeWithdraw from "components/stake-and-withdraw";
import InvestClaim from "components/stake-invest-claim";

const { Content } = Layout;

interface InitialState {
  lastRewardBalance: number;
  loaded: boolean;
  totalStaked: number;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    lastRewardBalance: 0,
    loaded: false,
    totalStaked: 0,
  };
  const [state, setState] = useState(initialState);
  const { lastRewardBalance, loaded, totalStaked } = state;
  const { changePage, currency } = useBaseContext();

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
          <span className="label">Revenue to distribute</span>
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
          <span className="label">Total VULT Staked</span>
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
          <span className="label">Staked Supply</span>
          <span className="value">25.4%</span>
        </div>
      </div>
      <InvestClaim />
      <StakeWithdraw />
    </Content>
  );
};

export default Component;
