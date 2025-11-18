import Highcharts, {
  SeriesAreaOptions,
  XAxisOptions,
  YAxisOptions,
} from "highcharts";
import HighchartsReact, {
  HighchartsReactProps,
} from "highcharts-react-official";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

type LinearChartProps = {
  data: SeriesAreaOptions["data"];
  xAxisPlotBands?: XAxisOptions["plotBands"];
  yAxisPlotBands?: YAxisOptions["plotBands"];
};

export const LinearChart: FC<LinearChartProps> = ({
  data,
  xAxisPlotBands,
  yAxisPlotBands,
}) => {
  const { t } = useTranslation();
  const colors = useTheme();

  const options: HighchartsReactProps["options"] = {
    chart: { backgroundColor: "transparent", zooming: { type: "x" } },
    legend: { enabled: false },
    plotOptions: {
      area: {
        marker: { radius: 2 },
        lineColor: colors.success.toHex(),
        lineWidth: 1,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, colors.success.toRgba(1)],
            [1, colors.bgPrimary.toRgba(0)],
          ],
        },
        states: { hover: { lineWidth: 1 } },
        threshold: null,
      },
    },
    series: [{ type: "area", name: t("price"), data }],
    title: { text: undefined },
    tooltip: {
      backgroundColor: colors.bgSecondary.toHex(),
      style: { color: colors.textPrimary.toHex() },
    },
    xAxis: {
      labels: { style: { color: colors.textPrimary.toHex() } },
      title: { text: undefined },
      type: "datetime",
      lineColor: colors.bgTertiary.toHex(),
      tickColor: colors.bgTertiary.toHex(),
      plotBands:
        xAxisPlotBands && xAxisPlotBands.length > 0
          ? xAxisPlotBands.map((plotBand) => ({
              ...plotBand,
              color: colors.success.toRgba(0.1),
            }))
          : undefined,
    },
    yAxis: {
      labels: { style: { color: colors.textPrimary.toHex() } },
      title: { text: undefined },
      gridLineColor: colors.bgTertiary.toHex(),
      plotBands:
        yAxisPlotBands && yAxisPlotBands.length > 0
          ? yAxisPlotBands.map((plotBand) => ({
              ...plotBand,
              from: Number(plotBand.from),
              to: Number(plotBand.to),
              color: colors.accentFour.toRgba(0.1),
            }))
          : undefined,
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};
