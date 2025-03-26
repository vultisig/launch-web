import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "antd";
import { isAddress } from "ethers";
import { debounce } from "lodash";
import { useAccount } from "wagmi";

import constantKeys from "i18n/constant-keys";
import useSwapVult from "hooks/swap";

import { Check, Info, Search } from "icons";

interface ComponentFormProps {
  address: string;
}

interface InitialState {
  isValidAddress?: boolean;
  isWhitelist?: boolean;
  loading?: boolean;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { isValidAddress, isWhitelist, loading } = state;
  const { isAddressWhitelisted } = useSwapVult();
  const { isConnected } = useAccount();
  const [form] = Form.useForm<ComponentFormProps>();

  const handleCheck = debounce(({ address }: ComponentFormProps) => {
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
      <Form.Item<ComponentFormProps>
        name="address"
        validateStatus="validating"
        hasFeedback={loading}
        noStyle
      >
        <span>{t(constantKeys.SEARCH_TITLE)}</span>
        <Input
          prefix={<Search />}
          placeholder={t(constantKeys.SEARCH_ADDRESS)}
          readOnly={loading}
        />
      </Form.Item>
      {isValidAddress && !loading ? (
        isWhitelist ? (
          <div className="whitelist islisted">
            <Check />
            {t(constantKeys.WHITELISTED)}
          </div>
        ) : (
          <div className="whitelist notlisted">
            <Info />
            {t(constantKeys.NOT_WHITELISTED)}
          </div>
        )
      ) : null}
    </Form>
  );
};

export default Component;

//validateStatus="validating"
