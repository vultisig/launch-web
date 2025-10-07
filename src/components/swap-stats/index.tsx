import { Spin } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";

import { useCore } from "@/hooks/useCore";
import { toPriceFormat } from "@/utils/functions";

type SwapStatsProps = { marketCap: number; price: number; volume: number };

export const SwapStats: FC<SwapStatsProps> = ({ marketCap, price, volume }) => {
  const { t } = useTranslation();
  const { currency } = useCore();

  return (
    <div className="swap-stats">
      <div className="item">
        <span className="title">{t("marketCap")}</span>
        <span className="value">
          {marketCap ? (
            toPriceFormat(marketCap, currency)
          ) : (
            <Spin size="small" />
          )}
        </span>
      </div>
      <div className="item">
        <span className="title">24h Vol</span>
        <span className="value">
          {volume ? toPriceFormat(volume, currency) : <Spin size="small" />}
        </span>
      </div>
      <div className="item ascending">
        <span className="title">{t("price")}</span>
        <span className="value">
          {price ? toPriceFormat(price, currency) : <Spin size="small" />}
        </span>
      </div>
    </div>
  );
};
