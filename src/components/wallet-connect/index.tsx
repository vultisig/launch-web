import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from "wagmi";

import { ModalKey } from "utils/constants";
import constantKeys from "i18n/constant-keys";

const Component: FC = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
  const { hash } = useLocation();
  const navigate = useNavigate();

  return (
    <Modal
      className="wallet-connect"
      closable={false}
      footer={false}
      onCancel={() => navigate(-1)}
      open={hash === ModalKey.CONNECT && !isConnected}
      title={t(constantKeys.CONNECT_WALLET)}
      width={360}
    >
      {isConnected ? (
        <>
          {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
          {address && (
            <span>{ensName ? `${ensName} (${address})` : address}</span>
          )}
          <span onClick={() => disconnect()} className="btn">
            {t(constantKeys.DISCONNECT)}
          </span>
        </>
      ) : (
        <>
          {connectors.map((connector) => (
            <span
              key={connector.uid}
              onClick={() => connect({ connector })}
              className="btn"
            >
              {connector.icon ? <img src={connector.icon} /> : null}
              {connector.name}
            </span>
          ))}
        </>
      )}
    </Modal>
  );
};

export default Component;
