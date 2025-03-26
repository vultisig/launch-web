import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import HighchartsReact, {
  HighchartsReactProps,
} from "highcharts-react-official";
import Highcharts from "highcharts";

import { Period } from "utils/constants";
import constantKeys from "i18n/constant-keys";
import api from "utils/api";

type DataProps = [number, number][];

interface InitialState {
  data: DataProps;
  loading?: Period;
  period: Period;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    data: [],
    period: Period.DAY,
  };
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
    series: [
      { type: "area", name: t(constantKeys.PRICE), data: loading ? [] : data },
    ],
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
        <span className="title">{t(constantKeys.PRICE)}</span>
        <ul className="period">
          <li
            className={!loading && period === Period.DAY ? "active" : ""}
            onClick={() => handlePeriod(Period.DAY)}
          >
            {loading === Period.DAY ? <Spin size="small" /> : "24h"}
          </li>
          <li
            className={!loading && period === Period.WEEK ? "active" : ""}
            onClick={() => handlePeriod(Period.WEEK)}
          >
            {loading === Period.WEEK ? (
              <Spin size="small" />
            ) : (
              `${Period.WEEK}d`
            )}
          </li>
          <li
            className={!loading && period === Period.MONTH ? "active" : ""}
            onClick={() => handlePeriod(Period.MONTH)}
          >
            {loading === Period.MONTH ? (
              <Spin size="small" />
            ) : (
              `${Period.MONTH}d`
            )}
          </li>
        </ul>
      </div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default Component;
