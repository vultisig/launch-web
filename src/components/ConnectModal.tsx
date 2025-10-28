import { Modal } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { Connector, useAccount, useConnect } from "wagmi";

import { HStack, Stack } from "@/toolkits/Stack";
import { modalHash } from "@/utils/constants";

export const ConnectModal = () => {
  const { t } = useTranslation();
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const colors = useTheme();

  const connectorsConfig = [
    {
      name: "WalletConnect",
      icon: "connectors/walletConnect.jpg",
      isShow: true,
    },
    { name: "MetaMask", icon: "connectors/metamask.png", isShow: true },
    { name: "Safe", icon: "", isShow: false },
  ];

  const open = useMemo(() => {
    return !isConnected && hash === modalHash.connect;
  }, [hash, isConnected]);

  const getConnectorIcon = (name: string) => {
    const config = connectorsConfig.find((c) => c.name === name);
    return config?.icon || "";
  };

  const handleConnect = (connector: Connector) => {
    connect({ connector });
    navigate(-1);
  };

  return (
    <Modal
      closable={false}
      footer={false}
      onCancel={() => navigate(-1)}
      open={open}
      styles={{
        body: { display: "flex", flexDirection: "column", gap: "16px" },
      }}
      title={t("connectWallet")}
      width={400}
    >
      {connectors
        .filter((connector) => {
          const config = connectorsConfig.find(
            (c) => c.name === connector.name
          );
          return config ? config.isShow : true;
        })
        .map((connector) => {
          const icon = connector.icon || getConnectorIcon(connector.name);

          return (
            <HStack
              key={connector.uid}
              onClick={() => handleConnect(connector)}
              $style={{
                alignItems: "center",
                backgroundColor: colors.bgTertiary.toHex(),
                borderColor: colors.borderNormal.toHex(),
                borderRadius: "8px",
                borderStyle: "solid",
                borderWidth: "1px",
                cursor: "pointer",
                fontWeight: "500",
                gap: "8px",
                lineHeight: "32px",
                padding: "12px",
              }}
              $hover={{ borderColor: colors.accentFour.toHex() }}
            >
              {icon ? (
                <Stack
                  as="img"
                  src={icon}
                  alt={connector.name}
                  $style={{
                    borderRadius: "4px",
                    height: "32px",
                    width: "32px",
                  }}
                />
              ) : null}
              {connector.name}
            </HStack>
          );
        })}
    </Modal>
  );
};
