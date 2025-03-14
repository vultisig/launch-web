import { FC } from "react";
import { useTranslation } from "react-i18next";
import HighchartsReact, {
  HighchartsReactProps,
} from "highcharts-react-official";
import Highcharts from "highcharts";

import { Period } from "utils/constants";
import constantKeys from "i18n/constant-keys";

interface ComponentProps {
  data: [number, number][];
  onChangePeriod: (period: Period) => void;
  period: Period;
}

const Component: FC<ComponentProps> = ({ data, onChangePeriod, period }) => {
  const { t } = useTranslation();

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
    series: [{ type: "area", name: t(constantKeys.PRICE), data: data }],
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
            className={period === Period.day ? "active" : ""}
            onClick={() => onChangePeriod(Period.day)}
          >
            24h
          </li>
          <li
            className={period === Period.week ? "active" : ""}
            onClick={() => onChangePeriod(Period.week)}
          >
            {`${Period.week}d`}
          </li>
          <li
            className={period === Period.month ? "active" : ""}
            onClick={() => onChangePeriod(Period.month)}
          >
            {`${Period.month}d`}
          </li>
        </ul>
      </div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default Component;
