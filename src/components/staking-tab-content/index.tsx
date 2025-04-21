import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Form, InputNumber } from "antd";
import { useAccount, useWriteContract } from "wagmi";

import { useBaseContext } from "context";
import { STAKE_ABI } from "utils/abis/stake";
import { ContractAddress, HashKey, TickerKey } from "utils/constants";
import { config } from "utils/wagmi-config";
import constantKeys from "i18n/constant-keys";

interface ComponentFormProps {
  amount: number;
}

interface ComponentProps {
  buttonName: string;
  functionName: string;
  onUpdate: () => void;
}

interface InitialState {
  loading: boolean;
}

const Component: FC<ComponentProps> = ({
  buttonName,
  functionName,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const initialState: InitialState = { loading: false };
  const [state, setState] = useState(initialState);
  const { loading } = state;
  const { tokens } = useBaseContext();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract({ config });
  const [form] = Form.useForm<ComponentFormProps>();
  const totalAmount = tokens[TickerKey.VULT].balance;

  const handlePrice = (percentage: number) => {
    if (totalAmount) {
      const amount = Math.round((totalAmount / 100) * percentage);

      form.setFieldValue("amount", amount);
    }
  };

  const handleSubmit = () => {
    const { amount } = form.getFieldsValue();

    if (address && amount <= totalAmount) {
      setState((prevState) => ({ ...prevState, loading: true }));

      writeContractAsync({
        abi: STAKE_ABI,
        address: ContractAddress.VULT_STAKE,
        functionName,
        args: [amount],
        account: address,
      })
        .then(() => {
          form.resetFields();

          onUpdate();
        })
        .finally(() => {
          setState((prevState) => ({ ...prevState, loading: false }));
        });
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item<ComponentFormProps> name="amount" noStyle>
        <InputNumber
          controls={false}
          formatter={(value) => `${value}`.toNumberFormat()}
          min={0}
          placeholder="0"
          readOnly={loading}
        />
      </Form.Item>
      <span className="price">{`${t(
        constantKeys.AVAILABLE
      )}: ${totalAmount.toNumberFormat()}`}</span>
      <ul className="percentage">
        <li onClick={() => handlePrice(25)}>25%</li>
        <li onClick={() => handlePrice(50)}>50%</li>
        <li onClick={() => handlePrice(100)}>{t(constantKeys.MAX)}</li>
      </ul>
      <Form.Item<ComponentFormProps>
        shouldUpdate={(prevValues, curValues) =>
          prevValues.amount !== curValues.amount
        }
        noStyle
      >
        {({ getFieldsValue }) => {
          const { amount } = getFieldsValue();

          return isConnected ? (
            loading ? (
              <span className="button button-secondary disabled">
                {t(constantKeys.LOADING)}
              </span>
            ) : amount > totalAmount ? (
              <span className="button button-secondary disabled">
                {t(constantKeys.INSUFFICIENT_BALANCE)}
              </span>
            ) : totalAmount ? (
              <span onClick={handleSubmit} className="button button-secondary">
                {buttonName}
              </span>
            ) : (
              <span className="button button-secondary disabled">
                {buttonName}
              </span>
            )
          ) : (
            <Link to={HashKey.CONNECT} className="button button-secondary">
              {t(constantKeys.CONNECT_WALLET)}
            </Link>
          );
        }}
      </Form.Item>
    </Form>
  );
};

export default Component;
