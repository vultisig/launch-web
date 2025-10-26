import { Form, Input } from "antd";
import { isAddress } from "ethers";
import { debounce } from "lodash";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { useSwapVult } from "@/hooks/useSwapVult";
import { CheckIcon } from "@/icons/CheckIcon";
import { InfoIcon } from "@/icons/InfoIcon";
import { SearchIcon } from "@/icons/SearchIcon";
import { HStack, Stack, VStack } from "@/toolkits/Stack";

type FormProps = { address: string };

type StateProps = {
  isValidAddress?: boolean;
  isWhitelist?: boolean;
  loading?: boolean;
};

export const SwapWhitelist: FC = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({});
  const { isValidAddress, isWhitelist, loading } = state;
  const { isAddressWhitelisted } = useSwapVult();
  const [form] = Form.useForm<FormProps>();
  const colors = useTheme();

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

  return (
    <Form form={form} onValuesChange={handleCheck}>
      <VStack $style={{ gap: "16px" }}>
        <Stack as="span">{t("searchTitle")}</Stack>
        <Form.Item<FormProps>
          name="address"
          validateStatus="validating"
          hasFeedback={loading}
          noStyle
        >
          <Stack
            as={Input}
            prefix={<SearchIcon fontSize={16} />}
            placeholder={t("searchAddress")}
            readOnly={loading}
            styles={{ prefix: { marginRight: 12 } }}
            $style={{
              border: "none",
              borderRadius: "12px",
              height: "50px",
              padding: "0 16px",
            }}
          />
        </Form.Item>
        {isValidAddress && !loading && (
          <HStack
            $style={{
              alignItems: "center",
              borderRadius: "12px",
              gap: "8px",
              height: "50px",
              padding: "0 16px",
              ...(isWhitelist
                ? {
                    backgroundColor: colors.success.toRgba(0.1),
                    color: colors.success.toHex(),
                  }
                : {
                    backgroundColor: colors.bgSecondary.toHex(),
                  }),
            }}
          >
            {isWhitelist ? (
              <CheckIcon fontSize={16} />
            ) : (
              <InfoIcon fontSize={16} />
            )}
            <Stack as="span" $style={{ fontWeight: "500" }}>
              {t(isWhitelist ? "whitelisted" : "notWhitelisted")}
            </Stack>
          </HStack>
        )}
      </VStack>
    </Form>
  );
};
