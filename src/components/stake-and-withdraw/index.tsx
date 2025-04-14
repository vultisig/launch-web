import { FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InputNumber, Tabs, TabsProps } from "antd";
import { useAccount } from "wagmi";

import { useBaseContext } from "context";
import { HashKey } from "utils/constants";
import constantKeys from "i18n/constant-keys";

const StakeTab: FC = () => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();
  const { isConnected } = useAccount();

  const handlePrice = (percentage: number) => {
    console.log(percentage);
  };

  return (
    <>
      <InputNumber
        controls={false}
        formatter={(value) => `${value}`.toNumberFormat()}
        min={0}
        placeholder="0"
      />
      <span className="price">{`${t(
        constantKeys.AVAILABLE
      )}: ${(0).toPriceFormat(currency)}`}</span>
      <ul className="percentage">
        <li onClick={() => handlePrice(25)}>25%</li>
        <li onClick={() => handlePrice(50)}>50%</li>
        <li onClick={() => handlePrice(100)}>{t(constantKeys.MAX)}</li>
      </ul>
      {isConnected ? (
        <span className="secondary-button">{t(constantKeys.STAKE)}</span>
      ) : (
        <Link to={HashKey.CONNECT} className="secondary-button">
          {t(constantKeys.CONNECT_WALLET)}
        </Link>
      )}
    </>
  );
};

const WithdrawTab: FC = () => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();
  const { isConnected } = useAccount();

  const handlePrice = (percentage: number) => {
    console.log(percentage);
  };

  return (
    <>
      <InputNumber
        controls={false}
        formatter={(value) => `${value}`.toNumberFormat()}
        min={0}
        placeholder="0"
      />
      <span className="price">{`${t(
        constantKeys.AVAILABLE
      )}: ${(0).toPriceFormat(currency)}`}</span>
      <ul className="percentage">
        <li onClick={() => handlePrice(25)}>25%</li>
        <li onClick={() => handlePrice(50)}>50%</li>
        <li onClick={() => handlePrice(100)}>{t(constantKeys.MAX)}</li>
      </ul>
      {isConnected ? (
        <span className="secondary-button">{t(constantKeys.WITHDRAW)}</span>
      ) : (
        <Link to={HashKey.CONNECT} className="secondary-button">
          {t(constantKeys.CONNECT_WALLET)}
        </Link>
      )}
    </>
  );
};

const Component: FC = () => {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const navigate = useNavigate();

  const handleTab: TabsProps["onTabClick"] = (tab) => {
    navigate(tab);
  };

  const items: TabsProps["items"] = [
    {
      key: HashKey.STAKE,
      label: t(constantKeys.STAKE),
      children: <StakeTab />,
    },
    {
      key: HashKey.WITHDRAW,
      label: t(constantKeys.WITHDRAW),
      children: <WithdrawTab />,
    },
  ];

  return (
    <Tabs
      activeKey={hash === HashKey.WITHDRAW ? HashKey.WITHDRAW : HashKey.STAKE}
      items={items}
      onTabClick={handleTab}
      className="stake-and-withdraw"
    />
  );
};

export default Component;
