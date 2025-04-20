import { FC, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout, Spin, Tabs, TabsProps } from "antd";
import { useAccount, useWriteContract } from "wagmi";

import { useBaseContext } from "context";
import { STAKE_ABI } from "utils/abis/stake";
import {
  ContractAddress,
  defaultTokens,
  HashKey,
  PageKey,
  TickerKey,
} from "utils/constants";
import { config } from "utils/wagmi-config";
import constantKeys from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";

import { ChartPie, Layers } from "icons";
import TabContent from "components/staking-tab-content";
import { useStakeContractData } from "hooks/stake";
import { formatUnits } from "ethers";

const { Content } = Layout;

const Component: FC = () => {
  const { t } = useTranslation();
  const { changePage, updateWallet, currency } = useBaseContext();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract({ config });
  const {
    lastRewardBalance,
    totalStaked,
    pendingRewards,
    userAmount,
    loading,
    refetch,
  } = useStakeContractData(address);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleClaimOrReinvest = async (method: "claim" | "reinvest") => {
    if (!address || loading || !pendingRewards) return;

    try {
      await writeContractAsync({
        abi: STAKE_ABI,
        address: ContractAddress.VULT_STAKE,
        functionName: method,
        account: address,
      });
    } finally {
      refetch();
      updateWallet();
    }
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
          onUpdate={() => {
            refetch();
            updateWallet();
          }}
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
          onUpdate={() => {
            refetch();
            updateWallet();
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    changePage(PageKey.STAKING);
  }, []);

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
            {!loading ? (
              `${Number(
                formatUnits(lastRewardBalance, defaultTokens.USDC.decimals)
              ).toPriceFormat(currency)} USDC`
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
            {!loading ? (
              `${formatUnits(
                totalStaked,
                defaultTokens.VULT.decimals
              ).toNumberFormat()} VULT`
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
            <span className="value">
              {formatUnits(
                userAmount,
                defaultTokens.VULT.decimals
              ).toNumberFormat()}
            </span>
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
            <span className="value">
              {formatUnits(
                pendingRewards,
                defaultTokens.USDC.decimals
              ).toNumberFormat()}
            </span>
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
                onClick={() => handleClaimOrReinvest("reinvest")}
              >
                {t(constantKeys.REINVEST)}
              </span>
              <span
                className={`button button-secondary${
                  loading || !pendingRewards ? " disabled" : ""
                }`}
                onClick={() => handleClaimOrReinvest("claim")}
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
