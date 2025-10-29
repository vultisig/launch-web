import { Form, FormProps, InputNumber, Modal, Radio } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";

import { useCore } from "@/hooks/useCore";
import { CarFrontIcon } from "@/icons/CarFrontIcon";
import { CrossIcon } from "@/icons/CrossIcon";
import { HourglassIcon } from "@/icons/HourglassIcon";
import { TimerIcon } from "@/icons/TimerIcon";
import { Button } from "@/toolkits/Button";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { api } from "@/utils/api";
import { defaultGasSettings, modalHash } from "@/utils/constants";
import { GasSettingsProps, SuggestedGasFeeProps } from "@/utils/types";

type ModeOption = {
  key: GasSettingsProps["mode"];
  lable: string;
};

type SpeedOption = {
  gwei: string;
  key: GasSettingsProps["speed"];
  icon: FC;
  lable: string;
  speed: string;
};

export const SettingsModal = () => {
  const { t } = useTranslation();
  const [fees, setFees] = useState<SuggestedGasFeeProps | null>(null);
  const { gasSettings, setGasSettings } = useCore();
  const { hash } = useLocation();
  const [form] = Form.useForm<GasSettingsProps>();
  const navigate = useNavigate();
  const colors = useTheme();

  const modeOptions: ModeOption[] = [
    { key: "BASIC", lable: t("basic") },
    { key: "ADVANCED", lable: t("advanced") },
  ];

  const speedOptions: SpeedOption[] = [
    {
      gwei: `0 - ${(
        Number(fees?.high.suggestedMaxFeePerGas) +
        Number(fees?.high.suggestedMaxPriorityFeePerGas)
      ).toFixed(6)} Gwei`,
      icon: TimerIcon,
      key: "Fast",
      lable: t("fast"),
      speed: `~${Number(fees?.high.minWaitTimeEstimate) / 1000}s`,
    },
    {
      gwei: `0 - ${(
        Number(fees?.medium.suggestedMaxFeePerGas) +
        Number(fees?.medium.suggestedMaxPriorityFeePerGas)
      ).toFixed(6)} Gwei`,
      icon: CarFrontIcon,
      key: "Standard",
      lable: t("standard"),
      speed: `~${Number(fees?.medium.maxWaitTimeEstimate) / 1000}s`,
    },
    {
      gwei: `0 - ${(
        Number(fees?.low.suggestedMaxFeePerGas) +
        Number(fees?.low.suggestedMaxPriorityFeePerGas)
      ).toFixed(6)} Gwei`,
      icon: HourglassIcon,
      key: "Slow",
      lable: t("slow"),
      speed: `~${Number(fees?.low.maxWaitTimeEstimate) / 1000}s`,
    },
  ];

  const open = useMemo(() => {
    return hash === modalHash.settings;
  }, [hash]);

  const handleReset = () => {
    form.setFieldsValue({
      slippage: defaultGasSettings.slippage,
      speed: defaultGasSettings.speed,
      gasLimit: defaultGasSettings.gasLimit,
      maxFee: defaultGasSettings.maxFee,
      maxPriorityFee: defaultGasSettings.maxPriorityFee,
    });
  };

  const handleSubmit: FormProps<GasSettingsProps>["onFinish"] = (values) => {
    if (values.mode === "BASIC") {
      switch (values.speed) {
        case "Fast": {
          values.maxFee = Number(fees?.high.suggestedMaxFeePerGas);
          values.maxPriorityFee = Number(
            fees?.high.suggestedMaxPriorityFeePerGas
          );
          break;
        }
        case "Standard": {
          values.maxFee = Number(fees?.medium.suggestedMaxFeePerGas);
          values.maxPriorityFee = Number(
            fees?.medium.suggestedMaxPriorityFeePerGas
          );
          break;
        }
        case "Slow": {
          values.maxFee = Number(fees?.low.suggestedMaxFeePerGas);
          values.maxPriorityFee = Number(
            fees?.low.suggestedMaxPriorityFeePerGas
          );
          break;
        }
      }
    } else {
      values.speed = "Custom";
    }

    setGasSettings(values);
    navigate(-1);
  };

  useEffect(() => {
    if (open) {
      api
        .suggestedFees()
        .then((fees) => {
          setFees(fees);

          if (
            JSON.stringify(gasSettings) === JSON.stringify(defaultGasSettings)
          ) {
            setGasSettings({
              ...gasSettings,
              maxFee: Number(fees.medium.suggestedMaxFeePerGas),
              maxPriorityFee: Number(fees.medium.suggestedMaxPriorityFeePerGas),
            });
          }
        })
        .finally(() => {
          form.setFieldsValue(gasSettings);
        });
    }
  }, [open]);

  return (
    <Modal
      maskClosable={false}
      closable={false}
      footer={false}
      onCancel={() => navigate(-1)}
      open={open}
      styles={{
        footer: { alignItems: "center", justifyContent: "space-between" },
      }}
      title={
        <HStack
          $style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Stack
            as={Button}
            href={modalHash.settings}
            kind="success"
            onClick={handleReset}
            $style={{
              fontSize: "12px",
              lineHeight: "24px",
              marginRight: "-10px",
            }}
            ghost
          >
            {t("reset")}
          </Stack>
          <Stack
            as="span"
            $style={{ fontSize: "22px", fontWeight: "500", lineHeight: "24px" }}
          >
            {t("settings")}
          </Stack>
          <Button
            icon={<CrossIcon fontSize={24} />}
            onClick={() => navigate(-1)}
            ghost
          />
        </HStack>
      }
      width={400}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        requiredMark={false}
      >
        <VStack $style={{ gap: "16px" }}>
          <Stack as="span" $style={{ fontWeight: "600" }}>
            {t("slippage")}
          </Stack>
          <HStack $style={{ gap: "12px" }}>
            <Form.Item<GasSettingsProps>
              shouldUpdate={(prevValues, curValues) =>
                prevValues.slippage !== curValues.slippage
              }
              noStyle
            >
              {({ getFieldsValue, setFieldValue }) => {
                const { slippage } = getFieldsValue();

                return [0.1, 0.5, 1].map((value) => (
                  <HStack
                    as="span"
                    key={value}
                    onClick={() => setFieldValue("slippage", value)}
                    $style={{
                      alignItems: "center",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "500",
                      height: "36px",
                      justifyContent: "center",
                      width: "50px",
                      ...(value === slippage
                        ? { backgroundColor: colors.buttonPrimary.toHex() }
                        : { backgroundColor: colors.bgTertiary.toHex() }),
                    }}
                  >
                    {`${value}%`}
                  </HStack>
                ));
              }}
            </Form.Item>
            <Form.Item<GasSettingsProps>
              name="slippage"
              rules={[{ required: true }]}
              noStyle
            >
              <Stack
                as={InputNumber}
                min={0.1}
                max={90}
                step={0.1}
                controls={false}
                suffix={t("custom")}
                $style={{ flexGrow: 1 }}
              />
            </Form.Item>
          </HStack>
          <HStack
            $style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Stack as="span" $style={{ fontWeight: "600" }}>
              {t("transactionSettings")}
            </Stack>
            <Form.Item<GasSettingsProps>
              name="mode"
              rules={[{ required: true }]}
              noStyle
            >
              <HStack
                as={Radio.Group}
                $style={{
                  backgroundColor: colors.bgTertiary.toHex(),
                  borderRadius: "20px",
                  padding: "4px",
                }}
              >
                {modeOptions.map(({ key, lable }) => (
                  <ModeRadio key={key} value={key}>
                    {lable}
                  </ModeRadio>
                ))}
              </HStack>
            </Form.Item>
          </HStack>
          <Form.Item<GasSettingsProps>
            shouldUpdate={(prevValues, curValues) =>
              prevValues.mode !== curValues.mode
            }
            noStyle
          >
            {({ getFieldsValue }) => {
              const { mode } = getFieldsValue();

              return (
                <>
                  <Stack
                    $style={{
                      display: mode === "BASIC" ? "flex" : "none",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <Form.Item<GasSettingsProps>
                      name="speed"
                      rules={[{ required: true }]}
                      noStyle
                    >
                      <VStack as={Radio.Group} $style={{ gap: "16px" }}>
                        {speedOptions.map(
                          ({ gwei, icon, key, lable, speed }) => (
                            <SpeedRadio key={key} value={key}>
                              <Stack
                                as={icon}
                                $style={{
                                  color: colors.accentFour.toHex(),
                                  fontSize: "24px",
                                }}
                              />
                              <VStack $style={{ flexGrow: 1 }}>
                                <Stack
                                  as="span"
                                  $style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {lable}
                                </Stack>
                                <Stack as="span" $style={{ fontWeight: "500" }}>
                                  {speed}
                                </Stack>
                              </VStack>
                              <Stack as="span" $style={{ fontSize: "16px" }}>
                                {gwei}
                              </Stack>
                            </SpeedRadio>
                          )
                        )}
                      </VStack>
                    </Form.Item>
                  </Stack>
                  <Stack
                    $style={{
                      display: mode === "ADVANCED" ? "flex" : "none",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <Stack
                      as={Form.Item<GasSettingsProps>}
                      name="maxPriorityFee"
                      label={t("maxPriorityFee")}
                      rules={[{ required: mode === "ADVANCED" }]}
                      $style={{ margin: "0" }}
                    >
                      <AdvancedInput
                        min={0}
                        suffix={t("gwei")}
                        controls={false}
                      />
                    </Stack>
                    <Stack
                      as={Form.Item<GasSettingsProps>}
                      name="maxFee"
                      label={t("maxFee")}
                      rules={[{ required: mode === "ADVANCED" }]}
                      $style={{ margin: "0" }}
                    >
                      <AdvancedInput
                        min={0}
                        suffix={t("gwei")}
                        controls={false}
                      />
                    </Stack>
                    <Stack
                      as={Form.Item<GasSettingsProps>}
                      name="gasLimit"
                      label={t("gasLimit")}
                      rules={[{ required: mode === "ADVANCED" }]}
                      $style={{ margin: "0" }}
                    >
                      <AdvancedInput min={0} controls={false} />
                    </Stack>
                  </Stack>
                </>
              );
            }}
          </Form.Item>
          <Button type="submit">{t("save")}</Button>
        </VStack>
      </Form>
    </Modal>
  );
};

const AdvancedInput = styled(InputNumber)`
  border-radius: 12px;
  width: 100%;

  .ant-input-number-input {
    height: 56px;
  }
`;

const ModeRadio = styled(Radio)`
  align-items: center;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  height: 32px;
  justify-content: center;
  width: 88px;

  .ant-radio {
    display: none;
  }

  &.ant-radio-wrapper-checked {
    background-color: ${({ theme }) => theme.buttonPrimary.toHex()};
  }
`;

const SpeedRadio = styled(Radio)`
  border: solid 1px ${({ theme }) => theme.borderNormal.toHex()};
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s;

  .ant-radio {
    display: none;
  }

  .ant-radio-label {
    align-items: center;
    display: flex;
    flex: 1;
    gap: 12px;
    padding: 12px;
  }

  &::before {
    bottom: 0;
    content: "";
    left: 0;
    opacity: 0.2;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 0;
  }

  &:hover {
    border-color: ${({ theme }) => theme.accentFour.toHex()};
  }

  &.ant-radio-wrapper-checked {
    background-color: ${({ theme }) => theme.accentFour.toRgba(0.1)};
    border-color: ${({ theme }) => theme.accentFour.toHex()};
  }
`;
