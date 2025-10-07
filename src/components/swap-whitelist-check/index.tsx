import { Form, Input } from "antd";
import { isAddress } from "ethers";
import { debounce } from "lodash";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import { useSwapVult } from "@/hooks/useSwapVult";
import { Check, Info, Search } from "@/icons";

type FormProps = { address: string };

type StateProps = {
  isValidAddress?: boolean;
  isWhitelist?: boolean;
  loading?: boolean;
};

export const SwapWhitelistCheck: FC = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({});
  const { isValidAddress, isWhitelist, loading } = state;
  const { isAddressWhitelisted } = useSwapVult();
  const { isConnected } = useAccount();
  const [form] = Form.useForm<FormProps>();

  const handleCheck = debounce(({ address }: FormProps) => {
    if (isAddress(address)) {
      setState((prevState) => ({
        ...prevState,
        isValidAddress: true,
        loading: true,
      }));

      isAddressWhitelisted(address).then((isWhitelist) => {
        setState((prevState) => ({
          ...prevState,
          isWhitelist,
          loading: false,
        }));
      });
    } else {
      setState((prevState) => ({ ...prevState, isValidAddress: false }));
    }
  }, 800);

  return isConnected ? null : (
    <Form form={form} onValuesChange={handleCheck} className="swap-whitelisted">
      <span>{t("searchTitle")}</span>
      <Form.Item<FormProps>
        name="address"
        validateStatus="validating"
        hasFeedback={loading}
        noStyle
      >
        <Input
          prefix={<Search />}
          placeholder={t("searchAddress")}
          readOnly={loading}
        />
      </Form.Item>
      {isValidAddress && !loading ? (
        isWhitelist ? (
          <div className="whitelist islisted">
            <Check />
            {t("whitelisted")}
          </div>
        ) : (
          <div className="whitelist notlisted">
            <Info />
            {t("notWhitelisted")}
          </div>
        )
      ) : null}
    </Form>
  );
};
