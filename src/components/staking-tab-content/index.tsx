import { Form, InputNumber } from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAccount, useWriteContract } from "wagmi";

import { useCore } from "@/hooks/useCore";
import { STAKE_ABI } from "@/utils/abis/stake";
import { contractAddress, modalHash } from "@/utils/constants";
import { toNumberFormat } from "@/utils/functions";
import { wagmiConfig } from "@/utils/wagmi";

type FormProps = { amount: number };

type StakingTabContentProps = {
  buttonName: string;
  functionName: string;
  onUpdate: () => void;
};

export const StakingTabContent: FC<StakingTabContentProps> = ({
  buttonName,
  functionName,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState({ loading: false });
  const { loading } = state;
  const { tokens } = useCore();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract({ config: wagmiConfig });
  const [form] = Form.useForm<FormProps>();
  const totalAmount = tokens.VULT.balance;

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
        address: contractAddress.vultStake,
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
      <Form.Item<FormProps> name="amount" noStyle>
        <InputNumber
          controls={false}
          formatter={(value = 0) => toNumberFormat(value)}
          min={0}
          placeholder="0"
          readOnly={loading}
        />
      </Form.Item>
      <span className="price">{`${t("available")}: ${toNumberFormat(
        totalAmount
      )}`}</span>
      <ul className="percentage">
        <li onClick={() => handlePrice(25)}>25%</li>
        <li onClick={() => handlePrice(50)}>50%</li>
        <li onClick={() => handlePrice(100)}>{t("max")}</li>
      </ul>
      <Form.Item<FormProps>
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
                {t("loading")}
              </span>
            ) : amount > totalAmount ? (
              <span className="button button-secondary disabled">
                {t("insufficientBalance")}
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
            <Link to={modalHash.connect} className="button button-secondary">
              {t("connectWallet")}
            </Link>
          );
        }}
      </Form.Item>
    </Form>
  );
};
