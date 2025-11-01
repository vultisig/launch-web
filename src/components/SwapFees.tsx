import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { useAccount } from "wagmi";

import { useCore } from "@/hooks/useCore";
import { useSwapVult } from "@/hooks/useSwapVult";
import { ChartAreaIcon } from "@/icons/ChartAreaIcon";
import { ChartPieIcon } from "@/icons/ChartPieIcon";
import { CheckCheckIcon } from "@/icons/CheckCheckIcon";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { toValueFormat } from "@/utils/functions";

export const SwapFees = () => {
  const { t } = useTranslation();
  const [usedAllocation, setUsedAllocation] = useState<number>(0);
  const { currency } = useCore();
  const { address, isConnected } = useAccount();
  const { getAddressSpentUSDC } = useSwapVult();
  const colors = useTheme();

  useEffect(() => {
    if (address && isConnected) {
      getAddressSpentUSDC(address).then((usedAllocation) => {
        setUsedAllocation(usedAllocation);
      });
    }
  }, [address, isConnected, getAddressSpentUSDC]);

  const fees = [
    {
      icon: CheckCheckIcon,
      label: t("allocationFirstHour"),
      value: toValueFormat(1000, currency),
    },
    {
      icon: ChartAreaIcon,
      label: t("totalWlAllocation"),
      value: toValueFormat(1000, currency),
    },
    ...(isConnected
      ? [
          {
            icon: ChartPieIcon,
            label: t("usedAllocation"),
            value: `${toValueFormat(
              usedAllocation,
              currency
            )} / ${toValueFormat(10000, currency)}`,
          },
        ]
      : []),
  ];

  return (
    <Stack
      $style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      $media={{
        md: { $style: { flexDirection: "row" } },
        xl: { $style: { flexDirection: "column" } },
      }}
    >
      {fees.map((fee, ind) => (
        <HStack
          key={ind}
          $style={{
            alignItems: "center",
            backgroundColor: colors.bgSecondary.toHex(),
            borderRadius: "12px",
            gap: "16px",
            padding: "16px",
            width: "100%",
          }}
        >
          <Stack
            as={fee.icon}
            $style={{
              backgroundColor: colors.bgTertiary.toHex(),
              borderRadius: "8px",
              color: colors.accentFour.toHex(),
              fontSize: "28px",
              padding: "4px",
            }}
          />
          <VStack $style={{ gap: "4px" }}>
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
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {fee.value}
            </Stack>
          </VStack>
        </HStack>
      ))}
    </Stack>
  );
};
