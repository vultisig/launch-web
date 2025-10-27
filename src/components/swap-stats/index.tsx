import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";

import { useBaseContext } from "context";
import constantKeys from "i18n/constant-keys";

interface ComponentProps {
  marketCap?: number;
  price?: number;
  volume?: number;
}

const Component: FC<ComponentProps> = ({ marketCap, price, volume }) => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();

  return (
    <div className="swap-stats">
      <div className="item">
        <span className="title">{t(constantKeys.MARKET_CAP)}</span>
        <span className="value">
          {Number.isFinite(marketCap) ? (
            marketCap?.toPriceFormat(currency)
          ) : (
            <Spin size="small" />
          )}
        </span>
      </div>
      <div className="item">
        <span className="title">24h Vol</span>
        <span className="value">
          {Number.isFinite(volume) ? (
            volume?.toPriceFormat(currency)
          ) : (
            <Spin size="small" />
          )}
        </span>
      </div>
      <div className="item ascending">
        <span className="title">{t(constantKeys.PRICE)}</span>
        <span className="value">
          {Number.isFinite(price) ? (
            price?.toPriceFormat(currency, 4)
          ) : (
            <Spin size="small" />
          )}
        </span>
      </div>
    </div>
  );
};

export default Component;
