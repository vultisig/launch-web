import { FC } from "react";
import { useTranslation } from "react-i18next";

import { useBaseContext } from "context";
import constantKeys from "i18n/constant-keys";

import { ChartArea, CheckCheck, Clock } from "icons";

const Component: FC = () => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();

  return (
    <div className="swap-fees">
      <div className="item">
        <CheckCheck className="icon" />
        <span className="label">{t(constantKeys.TOTAL_ALLOCATION)}</span>
        <span className="value">{(1000).toPriceFormat(currency)}</span>
      </div>
      <div className="item">
        <ChartArea className="icon" />
        <span className="label">{t(constantKeys.USED_ALLOCATION)}</span>
        <span className="value">{(1000).toPriceFormat(currency)}</span>
      </div>
      <div className="item">
        <Clock className="icon" />
        <span className="label">{t(constantKeys.HOURLY_INCREASE)}</span>
        <span className="value">{`${(0).toPriceFormat(currency)} ${t(
          constantKeys.PER_HOUR
        )}`}</span>
      </div>
    </div>
  );
};

export default Component;
