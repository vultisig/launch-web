import { Spin } from "antd";
import Highcharts from "highcharts";
import HighchartsReact, {
  HighchartsReactProps,
} from "highcharts-react-official";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { api } from "@/utils/api";

type DataProps = [number, number][];
type Period = 1 | 7 | 30;

type InitialState = {
  data: DataProps;
  loading?: Period;
  period: Period;
};

export const SwapReports: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { data: [], period: 1 };
  const [state, setState] = useState(initialState);
  const { data, loading, period } = state;

  const handlePeriod = (period: Period) => {
    if (!loading) {
      setState((prevState) => ({ ...prevState, loading: period }));

      api.historicalPrice(period).then((rawData) => {
        const data: DataProps = rawData.map(({ date, price }) => [
          date,
          parseFloat(price.toFixed(2)),
        ]);

        setState((prevState) => ({
          ...prevState,
          data,
          loading: undefined,
          period,
        }));
      });
    }
  };

  const componentDidMount = () => {
    handlePeriod(period);
  };

  useEffect(componentDidMount, []);

  const options: HighchartsReactProps["options"] = {
    chart: { backgroundColor: "transparent", zooming: { type: "x" } },
    legend: { enabled: false },
    plotOptions: {
      area: {
        marker: { radius: 2 },
        lineColor: "#33e6bf",
        lineWidth: 1,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, "rgba(51, 230, 191, 1)"],
            [1, "rgba(2, 18, 43, 0)"],
          ],
        },
        states: { hover: { lineWidth: 1 } },
        threshold: null,
      },
    },
    series: [{ type: "area", name: t("price"), data: loading ? [] : data }],
    title: { text: undefined },
    tooltip: { backgroundColor: "#061b3a", style: { color: "#f0f4fc" } },
    xAxis: {
      labels: { style: { color: "#f0f4fc" } },
      title: { text: undefined },
      type: "datetime",
      lineColor: "#11284a",
      tickColor: "#11284a",
    },
    yAxis: {
      labels: { style: { color: "#f0f4fc" } },
      title: { text: undefined },
      gridLineColor: "#11284a",
    },
  };

  return (
    <div className="swap-reports">
      <div className="heading">
        <span className="title">{t("price")}</span>
        <ul className="period">
          <li
            className={!loading && period === 1 ? "active" : ""}
            onClick={() => handlePeriod(1)}
          >
            {loading === 1 ? <Spin size="small" /> : "24h"}
          </li>
          <li
            className={!loading && period === 7 ? "active" : ""}
            onClick={() => handlePeriod(7)}
          >
            {loading === 7 ? <Spin size="small" /> : `${7}d`}
          </li>
          <li
            className={!loading && period === 30 ? "active" : ""}
            onClick={() => handlePeriod(30)}
          >
            {loading === 30 ? <Spin size="small" /> : `${30}d`}
          </li>
        </ul>
      </div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};
