import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, InputNumber, Radio } from "antd";
import {
  DEFAULT_GAS_SETTING,
  GasSettingsMode,
  GasSettingsSpeed,
} from "utils/constants";
import { GasSettingsProps } from "utils/interfaces";
import { getStoredGasSettings, setStoredGasSettings } from "utils/storage";
import constantKeys from "i18n/constant-keys";

import { CarFront, ChevronLeft, Hourglass, Timer } from "icons";
import api, { SuggestedGasFeeData } from "utils/api";

interface ComponentProps {
  onClose: (settingsMode: boolean, updated?: boolean) => void;
  visible?: boolean;
}

interface InitialState {
  fees: SuggestedGasFeeData | null;
}

const Component: FC<ComponentProps> = ({ onClose, visible }) => {
  const initialState: InitialState = { fees: null };
  const { t } = useTranslation();
  const [form] = Form.useForm<GasSettingsProps>();
  const [state, setState] = useState(initialState);
  const { fees } = state;

  const handleReset = () => {
    form.setFieldsValue({
      slippage: DEFAULT_GAS_SETTING.slippage,
      speed: DEFAULT_GAS_SETTING.speed,
      gasLimit: DEFAULT_GAS_SETTING.gasLimit,
      maxFee: DEFAULT_GAS_SETTING.maxFee,
      maxPriorityFee: DEFAULT_GAS_SETTING.maxPriorityFee,
    });
  };

  const handleSlippage = (value: number) => {
    form.setFieldValue("slippage", value);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        if (values.mode === GasSettingsMode.BASIC) {
          switch (values.speed) {
            case GasSettingsSpeed.FAST: {
              values.maxFee = Number(fees?.high.suggestedMaxFeePerGas);
              values.maxPriorityFee = Number(
                fees?.high.suggestedMaxPriorityFeePerGas
              );
              break;
            }
            case GasSettingsSpeed.STANDARD: {
              values.maxFee = Number(fees?.medium.suggestedMaxFeePerGas);
              values.maxPriorityFee = Number(
                fees?.medium.suggestedMaxPriorityFeePerGas
              );
              break;
            }
            case GasSettingsSpeed.SLOW: {
              values.maxFee = Number(fees?.low.suggestedMaxFeePerGas);
              values.maxPriorityFee = Number(
                fees?.low.suggestedMaxPriorityFeePerGas
              );
              break;
            }
          }
        } else {
          values.speed = GasSettingsSpeed.CUSTOM;
        }

        setStoredGasSettings(values);

        onClose(false, true);
      })
      .catch(() => {});
  };

  const componentDidMount = () => {
    let settings = getStoredGasSettings();

    api
      .suggestedFees()
      .then((fees) => {
        setState((preState) => ({ ...preState, fees }));
        if (JSON.stringify(settings) === JSON.stringify(DEFAULT_GAS_SETTING)) {
          settings = {
            ...settings,
            maxFee: Number(fees.medium.suggestedMaxFeePerGas),
            maxPriorityFee: Number(fees.medium.suggestedMaxPriorityFeePerGas),
          };
          setStoredGasSettings(settings);
        }
      })
      .finally(() => {
        form.setFieldsValue(settings);
      });
  };

  useEffect(componentDidMount, []);

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
        <span className="text">{t(constantKeys.SETTINGS)}</span>
        <span onClick={handleReset} className="reset">
          {t(constantKeys.RESET)}
        </span>
        <ChevronLeft onClick={() => onClose(false)} className="toggle" />
      </div>
      <div className="slippage">
        <span className="label">{t(constantKeys.SLIPPAGE)}</span>
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
            suffix={t(constantKeys.CUSTOM)}
          />
        </Form.Item>
      </div>
      <div className="modes">
        <span className="label">{t(constantKeys.TRANSACTION_SETTINGS)}</span>
        <Form.Item<GasSettingsProps>
          name="mode"
          rules={[{ required: true }]}
          noStyle
        >
          <Radio.Group>
            <Radio value={GasSettingsMode.BASIC}>{t(constantKeys.BASIC)}</Radio>
            <Radio value={GasSettingsMode.ADVANCED}>
              {t(constantKeys.ADVANCED)}
            </Radio>
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
              <div
                className={`basic-mode${
                  mode === GasSettingsMode.BASIC ? " active" : ""
                }`}
              >
                <Form.Item<GasSettingsProps>
                  name="speed"
                  rules={[{ required: true }]}
                  noStyle
                >
                  <Radio.Group>
                    <Radio value={GasSettingsSpeed.FAST}>
                      <Timer className="icon" />
                      <span className="title">
                        <span className="text">{t(constantKeys.FAST)}</span>
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
                    <Radio value={GasSettingsSpeed.STANDARD}>
                      <CarFront className="icon" />
                      <span className="title">
                        <span className="text">{t(constantKeys.STANDARD)}</span>
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
                    <Radio value={GasSettingsSpeed.SLOW}>
                      <Hourglass className="icon" />
                      <span className="title">
                        <span className="text">{t(constantKeys.SLOW)}</span>
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
                  mode === GasSettingsMode.ADVANCED ? " active" : ""
                }`}
              >
                <Form.Item<GasSettingsProps>
                  name="maxPriorityFee"
                  label={t(constantKeys.MAX_PRIORITY_FEE)}
                  rules={[{ required: mode === GasSettingsMode.ADVANCED }]}
                >
                  <InputNumber
                    min={0}
                    suffix={t(constantKeys.GWEI)}
                    controls={false}
                  />
                </Form.Item>
                <Form.Item<GasSettingsProps>
                  name="maxFee"
                  label={t(constantKeys.MAX_FEE)}
                  rules={[{ required: mode === GasSettingsMode.ADVANCED }]}
                >
                  <InputNumber
                    min={0}
                    suffix={t(constantKeys.GWEI)}
                    controls={false}
                  />
                </Form.Item>
                <Form.Item<GasSettingsProps>
                  name="gasLimit"
                  label={t(constantKeys.GAS_LIMIT)}
                  rules={[{ required: mode === GasSettingsMode.ADVANCED }]}
                >
                  <InputNumber min={0} controls={false} />
                </Form.Item>
              </div>
            </>
          );
        }}
      </Form.Item>
      <span onClick={handleSubmit} className="secondary-button">
        {t(constantKeys.SAVE)}
      </span>
    </Form>
  );
};

export default Component;
