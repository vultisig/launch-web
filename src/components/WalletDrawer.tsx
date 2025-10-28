import { Drawer, Popconfirm, Spin, Tooltip } from "antd";
import { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { useAccount, useDisconnect } from "wagmi";

import { MiddleTruncate } from "@/components/MiddleTruncate";
import { useCore } from "@/hooks/useCore";
import { CopyIcon } from "@/icons/CopyIcon";
import { PowerIcon } from "@/icons/PowerIcon";
import { RefreshIcon } from "@/icons/RefreshIcon";
import { Button } from "@/toolkits/Button";
import { Divider } from "@/toolkits/Divider";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { modalHash } from "@/utils/constants";
import { toAmountFormat, toValueFormat } from "@/utils/functions";

export const WalletDrawer = () => {
  const { t } = useTranslation();
  const { address = "", isConnected } = useAccount();
  const { updateWallet, currency, message, tokens, updating } = useCore();
  const { disconnect } = useDisconnect();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const colors = useTheme();

  const open = useMemo(() => {
    return isConnected && hash === modalHash.wallet;
  }, [hash, isConnected]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        message.success("Address copied to clipboard");
      })
      .catch(() => {
        message.error("Failed to copy address");
      });
  };

  return (
    <Drawer
      closable={false}
      footer={false}
      onClose={() => navigate(-1)}
      open={open}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "24px 16px",
        },
        header: { padding: "24px 16px" },
      }}
      title={
        <HStack
          $style={{
            alignItems: "center",
            gap: "12px",
            justifyContent: "space-between",
          }}
        >
          <Stack as="span" $style={{ flexGrow: "1" }}>
            {t("connectedWallet")}
          </Stack>
          <Button onClick={updateWallet} ghost>
            <RefreshIcon fontSize={20} />
          </Button>
          <Popconfirm title={t("disconnect")} onConfirm={() => disconnect()}>
            <Button kind="danger" ghost>
              <PowerIcon fontSize={20} />
            </Button>
          </Popconfirm>
        </HStack>
      }
      width={400}
    >
      <HStack
        $style={{
          alignItems: "center",
          gap: "12px",
          justifyContent: "space-between",
        }}
      >
        <Stack
          as="img"
          alt="Avatar"
          src="/avatars/1.png"
          $style={{
            borderRadius: "50%",
            flex: "none",
            height: "32px",
            width: "32px",
          }}
        />
        <MiddleTruncate
          $style={{ flexGrow: "1", fontWeight: "500", overflow: "hidden" }}
        >
          {address}
        </MiddleTruncate>
        <Tooltip title={t("copy")}>
          <Stack
            as={Button}
            onClick={handleCopy}
            $style={{ flex: "none" }}
            ghost
          >
            <CopyIcon fontSize={20} />
          </Stack>
        </Tooltip>
      </HStack>
      <Divider />
      <HStack
        $style={{
          alignItems: "center",
          gap: "8px",
          justifyContent: "space-between",
        }}
      >
        <Stack as="span" $style={{ lineHeight: "32px", fontWeight: "500" }}>
          {t("vaultBalance")}
        </Stack>
        {updating ? (
          <Spin size="small" />
        ) : (
          <Stack
            as="span"
            $style={{
              fontSize: "16px",
              fontWeight: "600",
              lineHeight: "32px",
            }}
          >
            {toValueFormat(
              Object.values(tokens).reduce(
                (accumulator, { balance, value }) =>
                  accumulator + balance * value,
                0
              ),
              currency
            )}
          </Stack>
        )}
      </HStack>
      {Object.values(tokens).map(({ balance, name, ticker, value }) => (
        <Fragment key={ticker}>
          <Divider />
          <HStack $style={{ gap: "8px" }}>
            <Stack
              as="img"
              alt={ticker}
              src={`/tokens/${ticker.toLowerCase()}.svg`}
              $style={{ height: "32px", width: "32px" }}
            />
            <VStack $style={{ gap: "2px", flexGrow: "1" }}>
              <Stack as="span" $style={{ fontSize: "16px", fontWeight: "600" }}>
                {ticker}
              </Stack>
              <Stack as="span" $style={{ color: colors.textTertiary.toHex() }}>
                {name}
              </Stack>
            </VStack>
            {updating ? (
              <Spin size="small" />
            ) : (
              <VStack $style={{ alignItems: "flex-end", gap: "2px" }}>
                <Stack
                  as="span"
                  $style={{ fontSize: "16px", fontWeight: "600" }}
                >
                  {toValueFormat(balance * value, currency)}
                </Stack>
                <Stack
                  as="span"
                  $style={{ color: colors.textSecondary.toHex() }}
                >{`${toAmountFormat(balance)} ${ticker}`}</Stack>
              </VStack>
            )}
          </HStack>
        </Fragment>
      ))}
    </Drawer>
  );
};
