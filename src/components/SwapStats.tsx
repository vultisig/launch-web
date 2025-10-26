import { Spin } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { useCore } from "@/hooks/useCore";
import { Stack, VStack } from "@/toolkits/Stack";
import { toValueFormat } from "@/utils/functions";

type SwapStatsProps = { marketCap: number; price: number; volume: number };

export const SwapStats: FC<SwapStatsProps> = ({ marketCap, price, volume }) => {
  const { t } = useTranslation();
  const { currency } = useCore();
  const colors = useTheme();

  const stats = [
    {
      label: t("marketCap"),
      value: Number.isFinite(marketCap) ? (
        toValueFormat(marketCap, currency)
      ) : (
        <Spin size="small" />
      ),
    },
    {
      label: "24h Vol",
      value: Number.isFinite(volume) ? (
        toValueFormat(volume, currency)
      ) : (
        <Spin size="small" />
      ),
    },
    {
      label: t("price"),
      value: Number.isFinite(price) ? (
        toValueFormat(price, currency)
      ) : (
        <Spin size="small" />
      ),
    },
  ];

  return (
    <Stack
      $style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      $media={{ md: { $style: { flexDirection: "row" } } }}
    >
      {stats.map((fee, ind) => (
        <VStack
          key={ind}
          $style={{
            backgroundColor: colors.bgSecondary.toHex(),
            borderRadius: "12px",
            gap: "8px",
            padding: "16px",
            width: "100%",
          }}
        >
          <Stack
            as="span"
            $style={{
              color: colors.textTertiary.toHex(),
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            {fee.label}
          </Stack>
          <Stack
            as="span"
            $style={{
              fontSize: "18px",
              fontWeight: "700",
            }}
          >
            {fee.value}
          </Stack>
        </VStack>
      ))}
    </Stack>
  );
};
