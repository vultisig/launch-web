import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form, InputNumber, Radio } from "antd";
import { GasSettingsMode, GasSettingsSpeed } from "utils/constants";
import { GasSettingsProps } from "utils/interfaces";
import { getStoredGasSettings, setStoredGasSettings } from "utils/storage";
import constantKeys from "i18n/constant-keys";

import { CarFront, ChevronLeft, Hourglass, Timer } from "icons";

interface ComponentProps {
  onClose: () => void;
}

const Component: FC<ComponentProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<GasSettingsProps>();

  const handleReset = () => {
    form.resetFields();
    form.setFieldsValue({
      mode: GasSettingsMode.BASIC,
      slippage: 0.5,
      speed: GasSettingsSpeed.STANDARD,
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
          values.maxFee = 0;
          values.maxPriorityFee = 0;
          values.gasLimit = 0;
        }

        setStoredGasSettings(values);

        onClose();
      })
      .catch(() => {});
  };

  const componentDidMount = () => {
    const settings = getStoredGasSettings();

    form.setFieldsValue(settings);
  };

  useEffect(componentDidMount, []);

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      className="swap-settings"
      requiredMark={false}
    >
      <div className="heading">
        <span className="text">{t(constantKeys.SETTINGS)}</span>
        <span onClick={handleReset} className="reset">
          {t(constantKeys.RESET)}
        </span>
        <ChevronLeft onClick={onClose} className="toggle" />
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
            max={1.5}
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
                        <span className="speed">~10s</span>
                      </span>
                      <span className="gwei">0 - 0.004293 Gwei</span>
                    </Radio>
                    <Radio value={GasSettingsSpeed.STANDARD}>
                      <CarFront className="icon" />
                      <span className="title">
                        <span className="text">{t(constantKeys.STANDARD)}</span>
                        <span className="speed">~30s</span>
                      </span>
                      <span className="gwei">0 - 0.003786 Gwei</span>
                    </Radio>
                    <Radio value={GasSettingsSpeed.SLOW}>
                      <Hourglass className="icon" />
                      <span className="title">
                        <span className="text">{t(constantKeys.SLOW)}</span>
                        <span className="speed">~120s</span>
                      </span>
                      <span className="gwei">0 - 0.002864 Gwei</span>
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
