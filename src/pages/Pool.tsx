import { Dropdown, Form, FormProps, Input, Layout, MenuProps } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { useAccount } from "wagmi";

import { LinearChart } from "@/components/LinearChart";
import { useChartData } from "@/hooks/useChartData";
import { useCore } from "@/hooks/useCore";
import { ChevronDownIcon } from "@/icons/ChevronDownIcon";
import { Button } from "@/toolkits/Button";
import { Spin } from "@/toolkits/Spin";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { defaultTokens } from "@/utils/constants";
import { toAmountFormat, toValueFormat } from "@/utils/functions";
import { defaultPeriod, Period, periodNames, periods } from "@/utils/period";
import { SwapFormProps } from "@/utils/types";

const { Content } = Layout;

type Range = "full" | "custom";
type CustomSwapFormProps = {
  maxPrice: number;
  minPrice: number;
} & SwapFormProps;

export const PoolPage = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>("full");
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const { data, loading } = useChartData(period);
  const { currency, setCurrentPage, tokens } = useCore();
  const { isConnected } = useAccount();
  const [form] = Form.useForm<CustomSwapFormProps>();
  const colors = useTheme();

  const items: MenuProps["items"] = Object.values(defaultTokens).map(
    ({ ticker }) => ({
      key: ticker,
      icon: (
        <Stack
          as="img"
          alt={ticker}
          src={`/tokens/${ticker.toLowerCase()}.svg`}
          $style={{ height: "20px", width: "20px" }}
        />
      ),
      label: ticker,
    })
  );

  const onFinishSuccess: FormProps<CustomSwapFormProps>["onFinish"] = (
    values
  ) => {
    console.log("values", values);
  };

  useEffect(() => setCurrentPage("pool"), []);

  return (
    <VStack as={Content} $style={{ gap: "24px", maxWidth: "1600px" }}>
      <VStack $style={{ gap: "16px" }}>
        <Stack
          as="span"
          $style={{ fontSize: "16px", fontWeight: "500" }}
        >{`Your Positions > New Position`}</Stack>
        <Stack as="span" $style={{ fontSize: "40px", fontWeight: "600" }}>
          New Position
        </Stack>
      </VStack>
      <Form autoComplete="off" form={form} onFinish={onFinishSuccess}>
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
                      alt={defaultTokens.UNI.ticker}
                      src={`/tokens/${defaultTokens.UNI.ticker.toLowerCase()}.svg`}
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
                      {defaultTokens.UNI.ticker}
                    </Stack>
                    <Stack
                      as={ChevronDownIcon}
                      $style={{
                        color: colors.textTertiary.toHex(),
                        fontSize: "24px",
                      }}
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
                      alt={defaultTokens.USDC.ticker}
                      src={`/tokens/${defaultTokens.USDC.ticker.toLowerCase()}.svg`}
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
                      {defaultTokens.USDC.ticker}
                    </Stack>
                    <Stack
                      as={ChevronDownIcon}
                      $style={{
                        color: colors.textTertiary.toHex(),
                        fontSize: "24px",
                      }}
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
                Current price: 1,997.9 {defaultTokens.UNI.ticker} ($1,998.03)
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
                participation across all possible prices, offering simplicity
                but with potential for higher impermanent loss.
              </Stack>
              <HStack
                $style={{
                  alignItems: "center",
                  gap: "12px",
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  as="span"
                  $style={{ fontSize: "20px", fontWeight: "500" }}
                >
                  {`Current price: 1,997.9 ${defaultTokens.UNI.ticker} per ${defaultTokens.USDC.ticker}`}
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
                    {defaultTokens.UNI.ticker}
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
                    {defaultTokens.USDC.ticker}
                  </VStack>
                </HStack>
              </HStack>
              <Stack $style={{ width: "100%" }}>
                <Form.Item<CustomSwapFormProps>
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.maxPrice !== currentValues.maxPrice ||
                    prevValues.minPrice !== currentValues.minPrice
                  }
                  noStyle
                >
                  {({ getFieldsValue }) => {
                    const { maxPrice = 0, minPrice = 0 } = getFieldsValue();

                    return (
                      <LinearChart
                        data={loading ? [] : data}
                        yAxisPlotBands={[
                          { from: Number(minPrice), to: Number(maxPrice) },
                        ]}
                      />
                    );
                  }}
                </Form.Item>
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
                  <Form.Item<CustomSwapFormProps> name="minPrice" noStyle>
                    <Stack
                      as={Input}
                      placeholder="0"
                      $style={{
                        backgroundColor: "transparent !important",
                        border: "none",
                        borderRadius: "0",
                        fontSize: "22px",
                        fontWeight: "500",
                        height: "32px",
                        padding: "0",
                      }}
                    />
                  </Form.Item>
                  <Stack
                    as="span"
                    $style={{
                      color: colors.textSecondary.toHex(),
                      fontSize: "14px",
                      fontWeight: "500",
                      lineHeight: "16px",
                    }}
                  >
                    {`${defaultTokens.UNI.ticker} per ${defaultTokens.USDC.ticker}`}
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
                  <Form.Item<CustomSwapFormProps> name="maxPrice" noStyle>
                    <Stack
                      as={Input}
                      placeholder="0"
                      $style={{
                        backgroundColor: "transparent !important",
                        border: "none",
                        borderRadius: "0",
                        fontSize: "22px",
                        fontWeight: "500",
                        height: "32px",
                        padding: "0",
                      }}
                    />
                  </Form.Item>
                  <Stack
                    as="span"
                    $style={{
                      color: colors.textSecondary.toHex(),
                      fontSize: "14px",
                      fontWeight: "500",
                      lineHeight: "16px",
                    }}
                  >
                    {`${defaultTokens.UNI.ticker} per ${defaultTokens.USDC.ticker}`}
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
                  {/* <Stack
                  as="span"
                  $style={{
                    color: colors.textTertiary.toHex(),
                    lineHeight: "20px",
                  }}
                >
                  Deposit (50%)
                </Stack> */}
                  <HStack
                    $style={{
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "space-between",
                    }}
                  >
                    <Form.Item<CustomSwapFormProps>
                      name="allocateAmount"
                      noStyle
                    >
                      <Stack
                        as={Input}
                        placeholder="0"
                        $style={{
                          backgroundColor: "transparent !important",
                          border: "none",
                          borderRadius: "0",
                          fontSize: "22px",
                          fontWeight: "500",
                          height: "32px",
                          padding: "0",
                        }}
                      />
                    </Form.Item>
                    <HStack $style={{ alignItems: "center", gap: "8px" }}>
                      <Stack
                        as="img"
                        alt={defaultTokens.UNI.ticker}
                        src={`/tokens/${defaultTokens.UNI.ticker.toLowerCase()}.svg`}
                        $style={{ height: "24px", width: "24px" }}
                      />
                      <Stack
                        as="span"
                        $style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        {defaultTokens.UNI.ticker}
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
                      {toValueFormat(0, currency)}
                    </Stack>
                    {isConnected && (
                      <HStack $style={{ alignItems: "center", gap: "4px" }}>
                        <Stack
                          as="span"
                          $style={{
                            color: colors.textTertiary.toHex(),
                            lineHeight: "20px",
                          }}
                        >
                          {`${t("amount")}: ${toAmountFormat(
                            tokens[defaultTokens.UNI.ticker].balance
                          )}`}
                        </Stack>
                        <Stack
                          as="span"
                          $style={{
                            color: colors.accentFour.toHex(),
                            cursor: "pointer",
                            lineHeight: "20px",
                          }}
                        >
                          MAX
                        </Stack>
                      </HStack>
                    )}
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
                  {/* <Stack
                  as="span"
                  $style={{
                    color: colors.textTertiary.toHex(),
                    lineHeight: "20px",
                  }}
                >
                  Deposit (50%)
                </Stack> */}
                  <HStack
                    $style={{
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "space-between",
                    }}
                  >
                    <Form.Item<CustomSwapFormProps> name="buyAmount" noStyle>
                      <Stack
                        as={Input}
                        placeholder="0"
                        $style={{
                          backgroundColor: "transparent !important",
                          border: "none",
                          borderRadius: "0",
                          fontSize: "22px",
                          fontWeight: "500",
                          height: "32px",
                          padding: "0",
                        }}
                      />
                    </Form.Item>
                    <HStack $style={{ alignItems: "center", gap: "8px" }}>
                      <Stack
                        as="img"
                        alt={defaultTokens.USDC.ticker}
                        src={`/tokens/${defaultTokens.USDC.ticker.toLowerCase()}.svg`}
                        $style={{ height: "24px", width: "24px" }}
                      />
                      <Stack
                        as="span"
                        $style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        {defaultTokens.USDC.ticker}
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
                      {toValueFormat(0, currency)}
                    </Stack>
                    {isConnected && (
                      <HStack $style={{ alignItems: "center", gap: "4px" }}>
                        <Stack
                          as="span"
                          $style={{
                            color: colors.textTertiary.toHex(),
                            lineHeight: "20px",
                          }}
                        >
                          {`${t("amount")}: ${toAmountFormat(
                            tokens[defaultTokens.USDC.ticker].balance
                          )}`}
                        </Stack>
                        <Stack
                          as="span"
                          $style={{
                            color: colors.accentFour.toHex(),
                            cursor: "pointer",
                            lineHeight: "20px",
                          }}
                        >
                          MAX
                        </Stack>
                      </HStack>
                    )}
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
      </Form>
    </VStack>
  );
};
