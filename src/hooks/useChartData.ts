import { SeriesAreaOptions } from "highcharts";
import { useEffect, useState } from "react";

import { api } from "@/utils/api";
import { Period } from "@/utils/period";

export const useChartData = (period: Period) => {
  const [data, setData] = useState<SeriesAreaOptions["data"]>([]);
  const [loading, setLoading] = useState<Period | undefined>(undefined);

  useEffect(() => {
    let isCancelled = false;

    setLoading(period);

    api.historicalPrice(period).then((rawData) => {
      if (isCancelled) return;

      const parsed: SeriesAreaOptions["data"] = rawData.map(
        ({ date, price }) => [date, Number(price.toFixed(2))]
      );

      setData(parsed);
      setLoading(undefined);
    });

    return () => {
      isCancelled = true;
    };
  }, [period]);

  return { data, loading };
};
