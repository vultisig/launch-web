import { Form, InputNumber, Radio } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { CarFront, ChevronLeft, Hourglass, Timer } from "@/icons";
import { getGasSettings, setGasSettings } from "@/storage/gasSettings";
import { api, SuggestedGasFeeData } from "@/utils/api";
import { defaultGasSettings } from "@/utils/constants";
import { GasSettingsMode, GasSettingsProps } from "@/utils/types";

type SwapSettingsProps = {
  onClose: (settingsMode: boolean, updated?: boolean) => void;
  visible?: boolean;
};

type StateProps = { fees: SuggestedGasFeeData | null };

export const SwapSettings: FC<SwapSettingsProps> = ({ onClose, visible }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({ fees: null });
  const [form] = Form.useForm<GasSettingsProps>();
  const { fees } = state;

  const handleReset = () => {
    form.setFieldsValue({
      slippage: defaultGasSettings.slippage,
      speed: defaultGasSettings.speed,
      gasLimit: defaultGasSettings.gasLimit,
      maxFee: defaultGasSettings.maxFee,
      maxPriorityFee: defaultGasSettings.maxPriorityFee,
    });
  };

  const handleSlippage = (value: number) => {
    form.setFieldValue("slippage", value);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
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

        onClose(false, true);
      })
      .catch(() => {});
  };

  useEffect(() => {
    let settings = getGasSettings();

    api
      .suggestedFees()
      .then((fees) => {
        setState((preState) => ({ ...preState, fees }));
        if (JSON.stringify(settings) === JSON.stringify(defaultGasSettings)) {
          settings = {
            ...settings,
            maxFee: Number(fees.medium.suggestedMaxFeePerGas),
            maxPriorityFee: Number(fees.medium.suggestedMaxPriorityFeePerGas),
          };
          setGasSettings(settings);
        }
      })
      .finally(() => {
        form.setFieldsValue(settings);
      });
  }, []);

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      className="swap-settings"
      requiredMark={false}
      style={{ display: visible ? undefined : "none" }}
    >
      <div className="heading">
        <span className="text">{t("settings")}</span>
        <span onClick={handleReset} className="reset">
          {t("reset")}
        </span>
        <ChevronLeft onClick={() => onClose(false)} className="toggle" />
      </div>
      <div className="slippage">
        <span className="label">{t("slippage")}</span>
        <Form.Item<GasSettingsProps>
          shouldUpdate={(prevValues, curValues) =>
            prevValues.slippage !== curValues.slippage
          }
          noStyle
        >
          {({ getFieldValue }) => {
            const slippage: number = getFieldValue("slippage");

            return (
              <span className="list">
                <span
                  onClick={() => handleSlippage(0.1)}
                  className={`item${slippage === 0.1 ? " active" : ""}`}
                >
                  0.1%
                </span>
                <span
                  onClick={() => handleSlippage(0.5)}
                  className={`item${slippage === 0.5 ? " active" : ""}`}
                >
                  0.5%
                </span>
                <span
                  onClick={() => handleSlippage(1)}
                  className={`item${slippage === 1 ? " active" : ""}`}
                >
                  1%
                </span>
              </span>
            );
          }}
        </Form.Item>
        <Form.Item<GasSettingsProps>
          name="slippage"
          rules={[{ required: true }]}
          noStyle
        >
          <InputNumber
            min={0.1}
            max={90}
            step={0.1}
            controls={false}
            suffix={t("custom")}
          />
        </Form.Item>
      </div>
      <div className="modes">
        <span className="label">{t("transactionSettings")}</span>
        <Form.Item<GasSettingsProps>
          name="mode"
          rules={[{ required: true }]}
          noStyle
        >
          <Radio.Group>
            <Radio value={"BASIC"}>{t("basic")}</Radio>
            <Radio value={"ADVANCED"}>{t("advanced")}</Radio>
          </Radio.Group>
        </Form.Item>
      </div>
      <Form.Item<GasSettingsProps>
        shouldUpdate={(prevValues, curValues) =>
          prevValues.mode !== curValues.mode
        }
        noStyle
      >
        {({ getFieldValue }) => {
          const mode: GasSettingsMode = getFieldValue("mode");

          return (
            <>
              <div className={`basic-mode${mode === "BASIC" ? " active" : ""}`}>
                <Form.Item<GasSettingsProps>
                  name="speed"
                  rules={[{ required: true }]}
                  noStyle
                >
                  <Radio.Group>
                    <Radio value="Fast">
                      <Timer className="icon" />
                      <span className="title">
                        <span className="text">{t("fast")}</span>
                        <span className="speed">
                          ~{Number(fees?.high.minWaitTimeEstimate) / 1000}s
                        </span>
                      </span>
                      <span className="gwei">
                        0 -{" "}
                        {(
                          Number(fees?.high.suggestedMaxFeePerGas) +
                          Number(fees?.high.suggestedMaxPriorityFeePerGas)
                        ).toFixed(6)}{" "}
                        Gwei
                      </span>
                    </Radio>
                    <Radio value="Standard">
                      <CarFront className="icon" />
                      <span className="title">
                        <span className="text">{t("standard")}</span>
                        <span className="speed">
                          ~{Number(fees?.medium.maxWaitTimeEstimate) / 1000}s
                        </span>
                      </span>
                      <span className="gwei">
                        0 -{" "}
                        {(
                          Number(fees?.medium.suggestedMaxFeePerGas) +
                          Number(fees?.medium.suggestedMaxPriorityFeePerGas)
                        ).toFixed(6)}{" "}
                        Gwei
                      </span>
                    </Radio>
                    <Radio value="Slow">
                      <Hourglass className="icon" />
                      <span className="title">
                        <span className="text">{t("slow")}</span>
                        <span className="speed">
                          ~{Number(fees?.low.maxWaitTimeEstimate) / 1000}s
                        </span>
                      </span>
                      <span className="gwei">
                        0 -{" "}
                        {(
                          Number(fees?.low.suggestedMaxFeePerGas) +
                          Number(fees?.low.suggestedMaxPriorityFeePerGas)
                        ).toFixed(6)}{" "}
                        Gwei
                      </span>
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
              <div
                className={`advanced-mode${
                  mode === "ADVANCED" ? " active" : ""
                }`}
              >
                <Form.Item<GasSettingsProps>
                  name="maxPriorityFee"
                  label={t("maxPriorityFee")}
                  rules={[{ required: mode === "ADVANCED" }]}
                >
                  <InputNumber min={0} suffix={t("gwei")} controls={false} />
                </Form.Item>
                <Form.Item<GasSettingsProps>
                  name="maxFee"
                  label={t("maxFee")}
                  rules={[{ required: mode === "ADVANCED" }]}
                >
                  <InputNumber min={0} suffix={t("gwei")} controls={false} />
                </Form.Item>
                <Form.Item<GasSettingsProps>
                  name="gasLimit"
                  label={t("gasLimit")}
                  rules={[{ required: mode === "ADVANCED" }]}
                >
                  <InputNumber min={0} controls={false} />
                </Form.Item>
              </div>
            </>
          );
        }}
      </Form.Item>
      <span onClick={handleSubmit} className="button button-secondary">
        {t("save")}
      </span>
    </Form>
  );
};
