import { FC } from "react";
import { useTranslation } from "react-i18next";

import { useBaseContext } from "context";
import constantKeys from "i18n/constant-keys";

import { ChevronDown, ChevronUp } from "icons";

interface ComponentProps {
  marketCap: number;
  price: number;
  volume: number;
}

const Component: FC<ComponentProps> = ({ marketCap, price, volume }) => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();

  return (
    <div className="swap-stats">
      <div className="item">
        <span className="title">{t(constantKeys.MARKET_CAP)}</span>
        <span className="value">{marketCap.toPriceFormat(currency)}</span>
      </div>
      <div className="item">
        <span className="title">24h Vol</span>
        <span className="value">{volume.toPriceFormat(currency)}</span>
      </div>
      <div className="item ascending">
        <span className="title">
          {t(constantKeys.PRICE)}
          <ChevronUp />
          <span>6.81%</span>
        </span>
        <span className="value">{price.toPriceFormat(currency)}</span>
      </div>
      <div className="item ascending">
        <span className="title">
          {t(constantKeys.ALL_TIME_LOW)}
          <ChevronUp />
          <span>6.81%</span>
        </span>
        <span className="value">{(0.00394).toPriceFormat(currency)}</span>
      </div>
      <div className="item descending">
        <span className="title">
          {t(constantKeys.ALL_TIME_HIGH)}
          <ChevronDown />
          <span>12.31%</span>
        </span>
        <span className="value">{(1000000).toPriceFormat(currency)}</span>
      </div>
    </div>
  );
};

export default Component;
