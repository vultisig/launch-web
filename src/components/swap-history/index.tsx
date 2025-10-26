import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";
import dayjs from "dayjs";
import type { JSX } from "react";

import { TxStatus } from "utils/constants";
import { TransactionProps } from "utils/interfaces";
import { setStoredTransaction } from "utils/storage";
import useSwapHistory from "hooks/swap-history";
import useSwapVult from "hooks/swap";
import constantKeys from "i18n/constant-keys";

import { ChevronRight, CircleCheckBig, OctagonAlert, Trash } from "icons";
import MiddleTruncate from "components/middle-truncate";
import { Empty, Spin, Tooltip } from "antd";
import { useBaseContext } from "context";

const Transaction: FC<{ address: string; transaction: TransactionProps }> = ({
  address,
  transaction,
}) => {
  const { t } = useTranslation();
  const { tokens, updateTokenBalances } = useBaseContext();
  const { getTxStatus } = useSwapVult();
  const {
    allocateAmount,
    allocateToken,
    buyAmount,
    buyToken,
    date,
    hash,
    status,
  } = transaction;

  const componentDidUpdate = () => {
    if (status === TxStatus.PENDING) {
      getTxStatus(hash)
        .then((status) => {
          if (status === TxStatus.PENDING) {
            setTimeout(() => {
              componentDidUpdate();
            }, 1000 * 10);
          } else {
            setStoredTransaction(address, { ...transaction, status });
            updateTokenBalances(Object.values(tokens));
          }
        })
        .catch(() => {});
    }
  };

  useEffect(componentDidUpdate, [status]);

  let statusName: string;
  let statusIcon: JSX.Element;

  switch (status) {
    case TxStatus.FAILED:
      statusName = t(constantKeys.FAILED);
      statusIcon = <OctagonAlert />;
      break;
    case TxStatus.SUCCESS:
      statusName = t(constantKeys.SUCCESS);
      statusIcon = <CircleCheckBig />;
      break;
    default:
      statusName = t(constantKeys.PENDING);
      statusIcon = <Spin size="small" />;
      break;
  }

  return (
    <div className="item">
      <div className="action">
        <span className="label">{t(constantKeys.SWAP)}</span>
        <span className="time">
          {dayjs(date).format(import.meta.env.VITE_TIME_FORMAT)}
        </span>
      </div>
      <MiddleTruncate
        href={`https://etherscan.io/tx/${hash}`}
        text={hash}
        targetBlank
      />
      <div className="swap">
        <div className="token">
          <img
            src={`/tokens/${allocateToken.toLowerCase()}.svg`}
            alt={allocateToken}
            className="logo"
          />
          <span className="value">{`-${allocateAmount}`.toNumberFormat()}</span>
          <span className="ticker">{allocateToken}</span>
        </div>
        <ChevronRight />
        <div className="token">
          <img
            src={`/tokens/${buyToken.toLowerCase()}.svg`}
            alt={buyToken}
            className="logo"
          />
          <span className="value">{`+${buyAmount}`.toNumberFormat()}</span>
          <span className="ticker">{buyToken}</span>
        </div>
        <div className={`btn ${status}`}>
          {statusIcon}
          {statusName}
        </div>
      </div>
    </div>
  );
};

const Component: FC = () => {
  const { t } = useTranslation();
  const { address = "", isConnected } = useAccount();
  const { transactions, clearHistory } = useSwapHistory();

  return isConnected ? (
    <div className="swap-history">
      <div className="header">
        <span className="heading">{t(constantKeys.TRANSACTIONS)}</span>
        {transactions.length > 0 && (
          <Tooltip title={t(constantKeys.CLEAR_HISTORY)}>
            <span className="button" onClick={clearHistory}>
              <Trash />
            </span>
          </Tooltip>
        )}
      </div>
      {transactions.length > 0 ? (
        transactions.map((transaction) => (
          <Transaction
            key={transaction.hash}
            address={address}
            transaction={transaction}
          />
        ))
      ) : (
        <Empty description={t(constantKeys.NO_TRANSACTIONS_FOUND)} />
      )}
    </div>
  ) : null;
};

export default Component;
