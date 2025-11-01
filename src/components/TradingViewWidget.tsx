import { useEffect, useRef } from "react";

import { Stack } from "@/toolkits/Stack";

export const TradingViewWidget = () => {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      allow_symbol_change: false,
      calendar: false,
      details: false,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      hide_legend: true,
      hide_volume: false,
      hotlist: false,
      interval: "1",
      locale: "en",
      save_image: true,
      style: "1",
      symbol: "UNISWAP3ETH:VULTUSDC_6DF52C.USD",
      theme: "dark",
      timezone: "Etc/UTC",
      backgroundColor: "rgba(6, 27, 58, 1)",
      gridColor: "rgba(242, 242, 242, 0.06)",
      watchlist: [],
      withdateranges: false,
      compareSymbols: [],
      studies: [],
      autosize: true,
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) container.current.innerHTML = "";
    };
  }, []);

  return <Stack ref={container} $style={{ height: "600px" }} />;
};
