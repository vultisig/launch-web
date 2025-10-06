import { Layout, Spin, Tabs, TabsProps } from "antd";
import { formatUnits } from "ethers";
import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAccount, useWriteContract } from "wagmi";

import { StakingTabContent } from "@/components/staking-tab-content";
import { useStakeContractData } from "@/hooks/stake";
import { useCore } from "@/hooks/useCore";
import { ChartPie, Layers } from "@/icons";
import { STAKE_ABI } from "@/utils/abis/stake";
import { contractAddress, defaultTokens, modalHash } from "@/utils/constants";
import { routeTree } from "@/utils/routes";
import { wagmiConfig } from "@/utils/wagmi";

const { Content } = Layout;

export const StakingPage: FC = () => {
  const { t } = useTranslation();
  const { currency, setCurrentPage, updateWallet } = useCore();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract({ config: wagmiConfig });
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
        address: contractAddress.vultStake,
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
      key: routeTree.stakingStake.path,
      label: t("stake"),
      children: (
        <StakingTabContent
          buttonName={t("stake")}
          functionName="deposit"
          onUpdate={() => {
            refetch();
            updateWallet();
          }}
        />
      ),
    },
    {
      key: routeTree.stakingWithdraw.path,
      label: t("withdraw"),
      children: (
        <StakingTabContent
          buttonName={t("withdraw")}
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
    setCurrentPage("staking");
  }, []);

  return (
    <Content className="stacking-page">
      <div className="heading">{t("${1/_(w)/Stake_vult/g}")}</div>
      <div className="stats">
        <div className="item">
          <Layers className="icon" />
          <span className="label">{t("revenueToDistribute")}</span>
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
          <span className="label">{t("totalVultStaked")}</span>
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
          <span className="label">{t("stakedSupply")}</span>
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
        <div className="label">{t("amountStaked")}</div>
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
            <img src="/tokens/vult.svg" alt="VULT" className="logo" />
            <span className="ticker">VULT</span>
          </span>
        </div>
      </div>
      <div className="stake-reward">
        <div className="label">{t("rewards")}</div>
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
            <img src="/tokens/usdc.svg" alt="USDC" className="logo" />
            <span className="ticker">USDC</span>
          </span>
        </div>
        <div className="balance">1 VULT = X USDC</div>
        <div className="button-group">
          {isConnected ? (
            <>
              <span
                className={`button button-secondary${
                  loading || !pendingRewards ? " disabled" : ""
                }`}
                onClick={() => handleClaimOrReinvest("reinvest")}
              >
                {t("reinvest")}
              </span>
              <span
                className={`button button-secondary${
                  loading || !pendingRewards ? " disabled" : ""
                }`}
                onClick={() => handleClaimOrReinvest("claim")}
              >
                {t("claim")}
              </span>
            </>
          ) : (
            <Link
              to={modalHash.connect}
              className={`button button-secondary${loading ? " disabled" : ""}`}
            >
              {t("connectWallet")}
            </Link>
          )}
        </div>
      </div>
    </Content>
  );
};
