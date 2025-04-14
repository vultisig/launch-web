import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "antd";

import { useBaseContext } from "context";
import { PageKey } from "utils/constants";
import constantKeys from "i18n/constant-keys";

import { ChartPie, Layers } from "icons";
import StakeWithdraw from "components/stake-and-withdraw";
import InvestClaim from "components/stake-invest-claim";

const { Content } = Layout;

interface InitialState {
  loading: boolean;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { loading: false };
  const [_state, _setState] = useState(initialState);
  const { changePage } = useBaseContext();

  const componentDidMount = () => {
    changePage(PageKey.STAKING);
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
          <span className="value">$250,000 USDC</span>
        </div>
        <div className="divider" />
        <div className="item">
          <Layers className="icon" />
          <span className="label">Total VULT Staked</span>
          <span className="value">1,250,000 VULT</span>
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
