import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Form, Input, InputNumber } from "antd";
import { useAccount } from "wagmi";

import { HashKey, TickerKey } from "utils/constants";
import { InvestClaimFormProps } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";

import TokenDropdown from "components/token-dropdown";

interface InitialState {
  loading: boolean;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { loading: false };
  const [state, _setState] = useState(initialState);
  const { loading } = state;
  const { isConnected } = useAccount();
  const [form] = Form.useForm<InvestClaimFormProps>();

  const handleChangeToken = (ticker: TickerKey, reverse: boolean) => {
    form.setFieldValue(reverse ? "rewardToken" : "stakeToken", ticker);
  };

  const handleSubmit = () => {};

  return (
    <Form
      form={form}
      initialValues={{
        rewardToken: TickerKey.USDC,
        stakeToken: TickerKey.VULT,
      }}
      onFinish={handleSubmit}
      className="stake-invest-claim"
    >
      <div className="label">Amount Staked</div>
      <div className="item">
        <Form.Item<InvestClaimFormProps> name="stakeAmount" noStyle>
          <InputNumber
            controls={false}
            formatter={(value) => `${value}`.toNumberFormat()}
            min={0}
            placeholder="0"
            readOnly={loading}
          />
        </Form.Item>
        <Form.Item<InvestClaimFormProps> name="stakeToken" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item<InvestClaimFormProps>
          shouldUpdate={(prevValues, curValues) =>
            prevValues.stakeToken !== curValues.stakeToken
          }
          noStyle
        >
          {({ getFieldValue }) => {
            const ticker: TickerKey = getFieldValue("stakeToken");

            return (
              <TokenDropdown
                ticker={ticker}
                onChange={(value) => handleChangeToken(value, false)}
              />
            );
          }}
        </Form.Item>
      </div>
      <div className="label">{t(constantKeys.REWARDS)}</div>
      <div className="item">
        <Form.Item<InvestClaimFormProps> name="rewardAmount" noStyle>
          <InputNumber
            controls={false}
            formatter={(value) => `${value}`.toNumberFormat()}
            min={0}
            placeholder="0"
            readOnly
          />
        </Form.Item>
        <Form.Item<InvestClaimFormProps> name="rewardToken" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item<InvestClaimFormProps>
          shouldUpdate={(prevValues, curValues) =>
            prevValues.rewardToken !== curValues.rewardToken
          }
          noStyle
        >
          {({ getFieldValue }) => {
            const ticker: TickerKey = getFieldValue("rewardToken");

            return (
              <TokenDropdown
                ticker={ticker}
                onChange={(value) => handleChangeToken(value, true)}
              />
            );
          }}
        </Form.Item>
      </div>
      <Form.Item<InvestClaimFormProps>
        shouldUpdate={(prevValues, curValues) =>
          prevValues.rewardToken !== curValues.rewardToken ||
          prevValues.stakeToken !== curValues.stakeToken
        }
        noStyle
      >
        {({ getFieldsValue }) => {
          const { rewardToken, stakeToken } = getFieldsValue();

          return (
            <div className="balance">{`1 ${stakeToken} = X ${rewardToken}`}</div>
          );
        }}
      </Form.Item>
      <div className="actions">
        {isConnected ? (
          <>
            <span className={`secondary-button${loading ? " disabled" : ""}`}>
              {t(constantKeys.REINVEST)}
            </span>
            <span className={`secondary-button${loading ? " disabled" : ""}`}>
              {t(constantKeys.CLAIM)}
            </span>
          </>
        ) : (
          <Link
            to={HashKey.CONNECT}
            className={`secondary-button${loading ? " disabled" : ""}`}
          >
            {t(constantKeys.CONNECT_WALLET)}
          </Link>
        )}
      </div>
    </Form>
  );
};

export default Component;
