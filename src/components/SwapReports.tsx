import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { LinearChart } from "@/components/LinearChart";
import { useChartData } from "@/hooks/useChartData";
import { Spin } from "@/toolkits/Spin";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { defaultPeriod, Period, periodNames, periods } from "@/utils/period";

export const SwapReports = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const { data, loading } = useChartData(period);
  const colors = useTheme();

  return (
    <VStack $style={{ gap: "8px" }}>
      <HStack
        $style={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Stack as="span" $style={{ fontSize: "16px", fontWeight: "600" }}>
          {t("price")}
        </Stack>
        <HStack
          $style={{
            backgroundColor: colors.bgSecondary.toHex(),
            borderRadius: "12px",
            gap: "4px",
            overflow: "hidden",
            padding: "4px",
          }}
        >
          {periods.map((value) => (
            <VStack
              key={value}
              onClick={() => setPeriod(value)}
              $style={{
                alignItems: "center",
                backgroundColor:
                  value === period ? colors.bgTertiary.toHex() : "transparent",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                height: "24px",
                justifyContent: "center",
                width: "76px",
              }}
              $hover={{
                backgroundColor: colors.bgTertiary.toHex(),
              }}
            >
              {value === loading ? <Spin size="small" /> : periodNames[value]}
            </VStack>
          ))}
        </HStack>
      </HStack>
      <LinearChart data={loading ? [] : data} />
    </VStack>
  );
};
