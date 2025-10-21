import { useCore } from "@/hooks/useCore";
import { Stack, VStack } from "@/toolkits/Stack";
import { Layout } from "antd";
import { FC, useEffect } from "react";
import { useTheme } from "styled-components";

const { Content } = Layout;

export const PoolPage: FC = () => {
  const { setCurrentPage } = useCore();
  const colors = useTheme();

  useEffect(() => {
    setCurrentPage("pool");
  }, []);
  return (
    <Stack
      as={Content}
      $style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "1400px",
      }}
    >
      <VStack $style={{ gap: "16px" }}>
        <Stack
          $style={{ fontSize: "16px", fontWeight: "500" }}
        >{`Your Positions > New Position`}</Stack>
        <Stack $style={{ fontSize: "40px", fontWeight: "600" }}>
          New Position
        </Stack>
      </VStack>
      <Stack
        $style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        $media={{ xl: { $style: { flexDirection: "row" } } }}
      >
        <VStack
          $style={{ gap: "16px" }}
          $media={{ xl: { $style: { flexGrow: 1 } } }}
        >
          <VStack
            $style={{
              backgroundColor: colors.bgSecondary.toHex(),
              borderRadius: "20px",
              gap: "8px",
              padding: "24px 16px",
            }}
          >
            <Stack
              $style={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "24px",
              }}
            >
              Tokens
            </Stack>
          </VStack>
          <VStack
            $style={{
              backgroundColor: colors.bgSecondary.toHex(),
              borderRadius: "20px",
              gap: "8px",
              padding: "24px 16px",
            }}
          >
            <Stack
              $style={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "24px",
              }}
            >
              Current price: 1,997.9 VULT ($1,998.03)
            </Stack>
          </VStack>
        </VStack>
        <VStack
          $style={{ gap: "16px" }}
          $media={{ xl: { $style: { flexGrow: 1 } } }}
        >
          <VStack
            $style={{
              backgroundColor: colors.bgSecondary.toHex(),
              borderRadius: "20px",
              gap: "8px",
              padding: "24px 16px",
            }}
          >
            <Stack
              $style={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "24px",
              }}
            >
              Set price range
            </Stack>
          </VStack>
        </VStack>
      </Stack>
    </Stack>
  );
};
