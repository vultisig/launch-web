import { Dropdown, Input, Layout, MenuProps } from "antd";
import { useEffect, useState } from "react";
import { useTheme } from "styled-components";

import { LinearChart } from "@/components/LinearChart";
import { useChartData } from "@/hooks/useChartData";
import { useCore } from "@/hooks/useCore";
import { ChevronDown } from "@/icons";
import { Button } from "@/toolkits/Button";
import { Spin } from "@/toolkits/Spin";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { defaultTokens } from "@/utils/constants";
import { defaultPeriod, Period, periodNames, periods } from "@/utils/period";

const { Content } = Layout;

type Range = "full" | "custom";

export const PoolPage = () => {
  const [range, setRange] = useState<Range>("full");
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const { data, loading } = useChartData(period);
  const { setCurrentPage } = useCore();
  const colors = useTheme();

  const items: MenuProps["items"] = Object.values(defaultTokens).map(
    ({ ticker }) => ({
      key: ticker,
      icon: (
        <Stack
          as="img"
          alt={ticker}
          src={`/tokens/${ticker.toLowerCase()}.svg`}
          style={{ height: "20px", width: "20px" }}
        />
      ),
      label: ticker,
    })
  );

  useEffect(() => {
    setCurrentPage("pool");
  }, []);

  return (
    <VStack
      as={Content}
      $style={{
        gap: "24px",
        maxWidth: "1600px",
      }}
    >
      <VStack $style={{ gap: "16px" }}>
        <Stack
          as="span"
          $style={{ fontSize: "16px", fontWeight: "500" }}
        >{`Your Positions > New Position`}</Stack>
        <Stack as="span" $style={{ fontSize: "40px", fontWeight: "600" }}>
          New Position
        </Stack>
      </VStack>
      <Stack
        $style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        $media={{ xl: { $style: { flexDirection: "row" } } }}
      >
        <VStack $style={{ gap: "16px", overflow: "hidden", width: "100%" }}>
          <VStack
            $style={{
              backgroundColor: colors.bgSecondary.toHex(),
              borderRadius: "20px",
              gap: "16px",
              padding: "16px",
            }}
          >
            <Stack
              as="span"
              $style={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "20px",
              }}
            >
              Tokens
            </Stack>
            <HStack
              $style={{
                borderColor: colors.borderNormal.toHex(),
                borderStyle: "solid",
                borderWidth: "1px",
                borderRadius: "12px",
                gap: "16px",
                padding: "16px 12px",
              }}
            >
              <Dropdown menu={{ items }}>
                <HStack
                  $style={{
                    alignItems: "center",
                    backgroundColor: colors.bgTertiary.toHex(),
                    borderRadius: "20px",
                    cursor: "pointer",
                    gap: "8px",
                    height: "40px",
                    padding: "0 12px",
                    width: "100%",
                  }}
                >
                  <Stack
                    as="img"
                    alt={defaultTokens.VULT.ticker}
                    src={`/tokens/${defaultTokens.VULT.ticker.toLowerCase()}.svg`}
                    $style={{ height: "24px", width: "24px" }}
                  />
                  <Stack
                    as="span"
                    $style={{
                      flexGrow: "1",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    {defaultTokens.VULT.ticker}
                  </Stack>
                  <Stack
                    as={ChevronDown}
                    $style={{ stroke: colors.textTertiary.toHex() }}
                  />
                </HStack>
              </Dropdown>
              <Dropdown menu={{ items }}>
                <HStack
                  $style={{
                    alignItems: "center",
                    backgroundColor: colors.bgTertiary.toHex(),
                    borderRadius: "20px",
                    cursor: "pointer",
                    gap: "8px",
                    height: "40px",
                    padding: "0 12px",
                    width: "100%",
                  }}
                >
                  <Stack
                    as="img"
                    alt={defaultTokens.ETH.ticker}
                    src={`/tokens/${defaultTokens.ETH.ticker.toLowerCase()}.svg`}
                    $style={{ height: "24px", width: "24px" }}
                  />
                  <Stack
                    as="span"
                    $style={{
                      flexGrow: "1",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    {defaultTokens.ETH.ticker}
                  </Stack>
                  <Stack
                    as={ChevronDown}
                    $style={{ stroke: colors.textTertiary.toHex() }}
                  />
                </HStack>
              </Dropdown>
            </HStack>
            <VStack $style={{ gap: "12px" }}>
              <Stack
                as="span"
                $style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                Fee tier
              </Stack>
              <Stack
                as="span"
                $style={{
                  color: colors.textSecondary.toHex(),
                  fontSize: "13px",
                  fontWeight: "500",
                  lineHeight: "18px",
                }}
              >
                The amount earned providing liquidity. Choose an amount that
                suits your risk tolerance and strategy.
              </Stack>
            </VStack>
            <HStack $style={{ flexWrap: "nowrap", gap: "12px" }}>
              {[0.01, 0.03, 0.5, 1].map((value, index) => (
                <VStack
                  key={index}
                  $style={{
                    backgroundColor: !index
                      ? colors.bgTertiary.toHex()
                      : colors.bgSecondary.toHex(),
                    borderColor: !index
                      ? colors.accentFour.toHex()
                      : colors.borderNormal.toHex(),
                    borderStyle: "solid",
                    borderWidth: "1px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    gap: "8px",
                    padding: "12px",
                    width: "100%",
                  }}
                  $hover={{
                    backgroundColor: colors.bgTertiary.toHex(),
                  }}
                >
                  <Stack
                    as="span"
                    $style={{
                      fontSize: "17px",
                      fontWeight: "600",
                      lineHeight: "20px",
                    }}
                  >
                    {`${value}%`}
                  </Stack>
                  <Stack
                    as="span"
                    $style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      lineHeight: "18px",
                    }}
                  >
                    $3.26 TVL0% select
                  </Stack>
                </VStack>
              ))}
            </HStack>
          </VStack>
          <VStack
            $style={{
              alignItems: "flex-start",
              backgroundColor: colors.bgSecondary.toHex(),
              borderRadius: "20px",
              gap: "16px",
              padding: "16px",
            }}
          >
            <Stack
              as="span"
              $style={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "20px",
              }}
            >
              Current price: 1,997.9 VULT ($1,998.03)
            </Stack>
            <HStack
              $style={{
                borderColor: colors.borderLight.toHex(),
                borderStyle: "solid",
                borderWidth: "1px",
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
                      value === period
                        ? colors.bgTertiary.toHex()
                        : "transparent",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "12px",
                    height: "36px",
                    justifyContent: "center",
                    width: "76px",
                  }}
                  $hover={{
                    backgroundColor: colors.bgTertiary.toHex(),
                  }}
                >
                  {value === loading ? (
                    <Spin size="small" />
                  ) : (
                    periodNames[value]
                  )}
                </VStack>
              ))}
            </HStack>
            <Stack $style={{ width: "100%" }}>
              <LinearChart data={loading ? [] : data} />
            </Stack>
          </VStack>
        </VStack>
        <VStack $style={{ gap: "16px", overflow: "hidden", width: "100%" }}>
          <VStack
            $style={{
              backgroundColor: colors.bgSecondary.toHex(),
              borderRadius: "20px",
              gap: "16px",
              padding: "16px",
            }}
          >
            <Stack
              as="span"
              $style={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "20px",
              }}
            >
              Set price range
            </Stack>
            <HStack
              $style={{
                backgroundColor: colors.bgTertiary.toHex(),
                borderRadius: "26px",
                gap: "4px",
                padding: "4px",
              }}
            >
              <VStack
                as="span"
                onClick={() => setRange("full")}
                $style={{
                  alignItems: "center",
                  borderRadius: "22px",
                  cursor: "pointer",
                  fontSize: "16px",
                  height: "42px",
                  justifyContent: "center",
                  width: "100%",
                  ...(range === "full"
                    ? {
                        backgroundColor: colors.buttonPrimary.toHex(),
                        color: colors.neutral50.toHex(),
                        fontWeight: "600",
                      }
                    : {}),
                }}
              >
                Full range
              </VStack>
              <VStack
                onClick={() => setRange("custom")}
                $style={{
                  alignItems: "center",
                  borderRadius: "22px",
                  cursor: "pointer",
                  fontSize: "16px",
                  height: "42px",
                  justifyContent: "center",
                  width: "100%",
                  ...(range === "custom"
                    ? {
                        backgroundColor: colors.buttonPrimary.toHex(),
                        color: colors.neutral50.toHex(),
                      }
                    : {}),
                }}
                as="span"
              >
                Custom range
              </VStack>
            </HStack>
            <Stack
              as="span"
              $style={{
                color: colors.textSecondary.toHex(),
                fontSize: "13px",
                fontWeight: "500",
                lineHeight: "18px",
              }}
            >
              Providing full range liquidity ensures continuous market
              participation across all possible prices, offering simplicity but
              with potential for higher impermanent loss.
            </Stack>
            <HStack
              $style={{
                alignItems: "center",
                gap: "12px",
                justifyContent: "space-between",
              }}
            >
              <Stack as="span" $style={{ fontSize: "20px", fontWeight: "500" }}>
                {`Current price: 1,997.9 ${defaultTokens.VULT.ticker} per ${defaultTokens.ETH.ticker}`}
              </Stack>
              <HStack
                $style={{
                  backgroundColor: colors.bgTertiary.toHex(),
                  borderRadius: "26px",
                  gap: "4px",
                  padding: "4px",
                }}
              >
                <VStack
                  as="span"
                  $style={{
                    alignItems: "center",
                    borderRadius: "22px",
                    cursor: "pointer",
                    fontSize: "12px",
                    height: "32px",
                    justifyContent: "center",
                    width: "82px",
                    // active
                    backgroundColor: colors.buttonPrimary.toHex(),
                    color: colors.neutral50.toHex(),
                    fontWeight: "600",
                  }}
                >
                  {defaultTokens.VULT.ticker}
                </VStack>
                <VStack
                  $style={{
                    alignItems: "center",
                    borderRadius: "22px",
                    cursor: "pointer",
                    fontSize: "12px",
                    height: "32px",
                    justifyContent: "center",
                    width: "82px",
                  }}
                  as="span"
                >
                  {defaultTokens.ETH.ticker}
                </VStack>
              </HStack>
            </HStack>
            <Stack $style={{ width: "100%" }}>
              <LinearChart
                data={loading ? [] : data}
                yAxisPlotBands={[{ from: 6.18, to: 6.24 }]}
              />
            </Stack>
            <Stack
              as="span"
              $style={{
                fontSize: "16px",
                fontWeight: "500",
                lineHeight: "20px",
              }}
            >
              TVL in selected range: 100% (Full Range)
            </Stack>
            <HStack $style={{ gap: "16px" }}>
              <VStack
                $style={{
                  backgroundColor: colors.bgTertiary.toHex(),
                  borderRadius: "12px",
                  gap: "12px",
                  padding: "16px 20px",
                  width: "100%",
                }}
              >
                <Stack
                  as="span"
                  $style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    lineHeight: "16px",
                  }}
                >
                  Min price
                </Stack>
                <Stack
                  as={Input}
                  placeholder="0"
                  $style={{
                    backgroundColor: "transparent !important",
                    border: "none",
                    fontSize: "22px",
                    padding: "0",
                  }}
                />
                <Stack
                  as="span"
                  $style={{
                    color: colors.textSecondary.toHex(),
                    fontSize: "14px",
                    fontWeight: "500",
                    lineHeight: "16px",
                  }}
                >
                  {`${defaultTokens.VULT.ticker} per ${defaultTokens.ETH.ticker}`}
                </Stack>
              </VStack>
              <VStack
                $style={{
                  backgroundColor: colors.bgTertiary.toHex(),
                  borderRadius: "12px",
                  gap: "12px",
                  padding: "16px 20px",
                  width: "100%",
                }}
              >
                <Stack
                  as="span"
                  $style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    lineHeight: "16px",
                  }}
                >
                  Max price
                </Stack>
                <Stack
                  as={Input}
                  placeholder="∞"
                  $style={{
                    backgroundColor: "transparent !important",
                    border: "none",
                    fontSize: "22px",
                    padding: "0",
                  }}
                />
                <Stack
                  as="span"
                  $style={{
                    color: colors.textSecondary.toHex(),
                    fontSize: "14px",
                    fontWeight: "500",
                    lineHeight: "16px",
                  }}
                >
                  {`${defaultTokens.VULT.ticker} per ${defaultTokens.ETH.ticker}`}
                </Stack>
              </VStack>
            </HStack>
            <VStack $style={{ gap: "12px" }}>
              <Stack
                as="span"
                $style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                Deposit tokens
              </Stack>
              <Stack
                as="span"
                $style={{
                  color: colors.textSecondary.toHex(),
                  fontSize: "13px",
                  fontWeight: "500",
                  lineHeight: "18px",
                }}
              >
                Specify the token amounts for your liquidity contribution.
              </Stack>
            </VStack>
            <HStack $style={{ gap: "16px" }}>
              <VStack
                $style={{
                  backgroundColor: colors.bgTertiary.toHex(),
                  borderRadius: "12px",
                  gap: "12px",
                  padding: "16px 20px",
                  width: "100%",
                }}
              >
                <Stack
                  as="span"
                  $style={{
                    color: colors.textTertiary.toHex(),
                    lineHeight: "20px",
                  }}
                >
                  Deposit (50%)
                </Stack>
                <HStack
                  $style={{
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack
                    as="span"
                    $style={{
                      fontSize: "22px",
                      fontWeight: "500",
                      lineHeight: "24px",
                    }}
                  >
                    2,309.93
                  </Stack>
                  <HStack $style={{ alignItems: "center", gap: "8px" }}>
                    <Stack
                      as="img"
                      alt={defaultTokens.VULT.ticker}
                      src={`/tokens/${defaultTokens.VULT.ticker.toLowerCase()}.svg`}
                      $style={{ height: "24px", width: "24px" }}
                    />
                    <Stack
                      as="span"
                      $style={{ fontSize: "14px", fontWeight: "500" }}
                    >
                      {defaultTokens.VULT.ticker}
                    </Stack>
                  </HStack>
                </HStack>
                <HStack
                  $style={{
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack
                    as="span"
                    $style={{
                      color: colors.textTertiary.toHex(),
                      lineHeight: "20px",
                    }}
                  >
                    $1,200
                  </Stack>
                  <HStack $style={{ alignItems: "center", gap: "4px" }}>
                    <Stack
                      as="span"
                      $style={{
                        color: colors.textTertiary.toHex(),
                        lineHeight: "20px",
                      }}
                    >
                      {`Balance: 2,394 ${defaultTokens.VULT.ticker}`}
                    </Stack>
                    <Stack
                      as="span"
                      $style={{
                        color: colors.accentFour.toHex(),
                        lineHeight: "20px",
                      }}
                    >
                      MAX
                    </Stack>
                  </HStack>
                </HStack>
              </VStack>
              <VStack
                $style={{
                  backgroundColor: colors.bgTertiary.toHex(),
                  borderRadius: "12px",
                  gap: "12px",
                  padding: "16px 20px",
                  width: "100%",
                }}
              >
                <Stack
                  as="span"
                  $style={{
                    color: colors.textTertiary.toHex(),
                    lineHeight: "20px",
                  }}
                >
                  Deposit (50%)
                </Stack>
                <HStack
                  $style={{
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack
                    as="span"
                    $style={{
                      fontSize: "22px",
                      fontWeight: "500",
                      lineHeight: "24px",
                    }}
                  >
                    75.7521
                  </Stack>
                  <HStack $style={{ alignItems: "center", gap: "8px" }}>
                    <Stack
                      as="img"
                      alt={defaultTokens.ETH.ticker}
                      src={`/tokens/${defaultTokens.ETH.ticker.toLowerCase()}.svg`}
                      $style={{ height: "24px", width: "24px" }}
                    />
                    <Stack
                      as="span"
                      $style={{ fontSize: "14px", fontWeight: "500" }}
                    >
                      {defaultTokens.ETH.ticker}
                    </Stack>
                  </HStack>
                </HStack>
                <HStack
                  $style={{
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack
                    as="span"
                    $style={{
                      color: colors.textTertiary.toHex(),
                      lineHeight: "20px",
                    }}
                  >
                    $1,200
                  </Stack>
                  <HStack $style={{ alignItems: "center", gap: "4px" }}>
                    <Stack
                      as="span"
                      $style={{
                        color: colors.textTertiary.toHex(),
                        lineHeight: "20px",
                      }}
                    >
                      {`Balance: 2,394 ${defaultTokens.ETH.ticker}`}
                    </Stack>
                    <Stack
                      as="span"
                      $style={{
                        color: colors.accentFour.toHex(),
                        lineHeight: "20px",
                      }}
                    >
                      MAX
                    </Stack>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>
            <Stack
              as={Button}
              $style={{ fontSize: "16px", fontWeight: "600 !important" }}
            >
              Add Liquidity
            </Stack>
          </VStack>
        </VStack>
      </Stack>
    </VStack>
  );
};
