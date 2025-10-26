import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import { useBaseContext } from "context";
import useSwapVult from "hooks/swap";
import constantKeys from "i18n/constant-keys";

import { ChartArea, ChartPie, CheckCheck } from "icons";

type StateProps = { usedAllocation: number };

const Component: FC = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({ usedAllocation: 0 });
  const { usedAllocation } = state;
  const { currency } = useBaseContext();
  const { address, isConnected } = useAccount();
  const { getAddressSpentUSDC } = useSwapVult();

  useEffect(() => {
    if (address && isConnected) {
      getAddressSpentUSDC(address).then((usedAllocation) => {
        setState((prevState) => ({ ...prevState, usedAllocation }));
      });
    }
  }, [address, isConnected]);

  return (
    <div className="swap-fees">
      <div className="item">
        <CheckCheck className="icon" />
        <span className="label">{t(constantKeys.ALLOCATION_FIRST_HOUR)}</span>
        <span className="value">{(1000).toPriceFormat(currency, 0)}</span>
      </div>
      <div className="item">
        <ChartArea className="icon" />
        <span className="label">{t(constantKeys.TOTAL_WL_ALLOCATION)}</span>
        <span className="value">{(10000).toPriceFormat(currency, 0)}</span>
      </div>
      {isConnected && (
        <div className="item">
          <ChartPie className="icon" />
          <span className="label">{t(constantKeys.USED_ALLOCATION)}</span>
          <span className="value">{`${usedAllocation.toPriceFormat(
            currency,
            0
          )} / ${(10000).toPriceFormat(currency, 0)}`}</span>
        </div>
      )}
    </div>
  );
};

export default Component;
