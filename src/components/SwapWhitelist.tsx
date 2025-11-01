import { Form, Input } from "antd";
import { isAddress } from "ethers";
import { debounce } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
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
  const handleCheck = useMemo(
    () =>
      debounce(async ({ address }: FormProps) => {
        const addr = (address ?? "").trim();
        if (!addr) {
          setState({
            isValidAddress: false,
            isWhitelist: undefined,
            loading: false,
          });
          return;
        }
        if (!isAddress(addr)) {
          setState({
            isValidAddress: false,
            isWhitelist: undefined,
            loading: false,
          });
          return;
        }
        setState((s) => ({ ...s, isValidAddress: true, loading: true }));
        try {
          const result = await isAddressWhitelisted(addr);
          const current = (form.getFieldValue("address") ?? "").trim();
          if (current === addr) {
            setState((s) => ({ ...s, isWhitelist: result, loading: false }));
          }
        } catch {
          setState((prevState) => ({
            ...prevState,
            loading: false,
            isWhitelist: false,
          }));
        }
      }, 800),
    [form, isAddressWhitelisted]
  );

  useEffect(() => () => handleCheck.cancel(), [handleCheck]);

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
