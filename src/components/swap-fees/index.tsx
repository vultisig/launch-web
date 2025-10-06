import { FC } from "react";
import { useTranslation } from "react-i18next";

import { useCore } from "@/hooks/useCore";
import { ChartArea, CheckCheck } from "@/icons";

export const SwapFees: FC = () => {
  const { t } = useTranslation();
  const { currency } = useCore();

  return (
    <div className="swap-fees">
      <div className="item">
        <CheckCheck className="icon" />
        <span className="label">{t("allocationFirstHour")}</span>
        <span className="value">{(1000).toPriceFormat(currency)}</span>
      </div>
      <div className="item">
        <ChartArea className="icon" />
        <span className="label">{t("totalWlAllocation")}</span>
        <span className="value">{(10000).toPriceFormat(currency)}</span>
      </div>
    </div>
  );
};
