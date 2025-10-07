import { Empty, Spin, Tooltip } from "antd";
import dayjs from "dayjs";
import type { JSX } from "react";
import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

import { MiddleTruncate } from "@/components/middle-truncate";
import { useSwapHistory } from "@/hooks/useSwapHistory";
import { useSwapVult } from "@/hooks/useSwapVult";
import { ChevronRight, CircleCheckBig, OctagonAlert, Trash } from "@/icons";
import { setTransaction } from "@/storage/transaction";
import { toNumberFormat } from "@/utils/functions";
import { TransactionProps } from "@/utils/types";

const Transaction: FC<{ address: string; transaction: TransactionProps }> = ({
  address,
  transaction,
}) => {
  const { t } = useTranslation();
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

  const checkTxStatus = () => {
    if (status === "pending") {
      getTxStatus(hash)
        .then((status) => {
          if (status === "pending") {
            setTimeout(() => {
              checkTxStatus();
            }, 1000 * 10);
          } else {
            setTransaction(address, { ...transaction, status });
          }
        })
        .catch(() => {});
    }
  };

  useEffect(checkTxStatus, [status]);

  let statusName: string;
  let statusIcon: JSX.Element;

  switch (status) {
    case "failed":
      statusName = t("failed");
      statusIcon = <OctagonAlert />;
      break;
    case "success":
      statusName = t("success");
      statusIcon = <CircleCheckBig />;
      break;
    default:
      statusName = t("pending");
      statusIcon = <Spin size="small" />;
      break;
  }

  return (
    <div className="item">
      <div className="action">
        <span className="label">{t("swap")}</span>
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
          <span className="value">{`-${toNumberFormat(allocateAmount)}`}</span>
          <span className="ticker">{allocateToken}</span>
        </div>
        <ChevronRight />
        <div className="token">
          <img
            src={`/tokens/${buyToken.toLowerCase()}.svg`}
            alt={buyToken}
            className="logo"
          />
          <span className="value">{`+${toNumberFormat(buyAmount)}`}</span>
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

export const SwapHistory: FC = () => {
  const { t } = useTranslation();
  const { address = "", isConnected } = useAccount();
  const { transactions, clearHistory } = useSwapHistory();

  return isConnected ? (
    <div className="swap-history">
      <div className="header">
        <span className="heading">{t("transactions")}</span>
        {transactions.length > 0 && (
          <Tooltip title={t("clearHistory")}>
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
        <Empty description={t("noTransactionsFound")} />
      )}
    </div>
  ) : null;
};
