import { SeriesAreaOptions } from "highcharts";
import { useEffect, useState } from "react";

import { api } from "@/utils/api";
import { Period } from "@/utils/period";
import { TickerKey } from "@/utils/types";
import { defaultTokens } from "@/utils/constants";

export const useChartData = (token: TickerKey, period: Period) => {
  const [data, setData] = useState<SeriesAreaOptions["data"]>([]);
  const [loading, setLoading] = useState<Period | undefined>(undefined);

  useEffect(() => {
    let isCancelled = false;

    setLoading(period);

    api
      .historicalPrice(defaultTokens[token].contractAddress!, period)
      .then((rawData) => {
        if (isCancelled) return;

        const parsed: SeriesAreaOptions["data"] = rawData.map(
          ({ date, price }) => [date, Number(price.toFixed(5))]
        );

        setData(parsed);
        setLoading(undefined);
      });

    return () => {
      isCancelled = true;
    };
  }, [token, period]);

  return { data, loading };
};
