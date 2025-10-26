import { Empty, Tooltip } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { useAccount } from "wagmi";

import { MiddleTruncate } from "@/components/MiddleTruncate";
import { useSwapHistory } from "@/hooks/useSwapHistory";
import { useSwapVult } from "@/hooks/useSwapVult";
import { ChevronRightIcon } from "@/icons/ChevronRightIcon";
import { CircleCheckBigIcon } from "@/icons/CircleCheckBigIcon";
import { OctagonAlertIcon } from "@/icons/OctagonAlertIcon";
import { TrashIcon } from "@/icons/TrashIcon";
import { setTransaction } from "@/storage/transaction";
import { Button } from "@/toolkits/Button";
import { Divider } from "@/toolkits/Divider";
import { Spin } from "@/toolkits/Spin";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { match, toNumberFormat } from "@/utils/functions";
import { TransactionProps } from "@/utils/types";

const Transaction: FC<TransactionProps> = (transaction) => {
  const { t } = useTranslation();
  const { address = "" } = useAccount();
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colors = useTheme();

  const checkTxStatus = () => {
    if (status !== "pending") return;

    getTxStatus(hash)
      .then((nextStatus) => {
        if (nextStatus === "pending") {
          timerRef.current = setTimeout(checkTxStatus, 10_000);
        } else {
          setTransaction(address, { ...transaction, status: nextStatus });
        }
      })
      .catch(() => {
        timerRef.current = setTimeout(checkTxStatus, 10_000);
      });
  };

  useEffect(() => {
    checkTxStatus();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hash, status]);

  return (
    <Stack
      $style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative",
      }}
      $media={{
        lg: {
          $style: {
            alignItems: "center",
            flexDirection: "row",
            gap: "32px",
            justifyContent: "space-between",
          },
        },
      }}
    >
      <VStack $style={{ gap: "8px" }}>
        <Stack
          as="span"
          $style={{ fontSize: "16px", fontWeight: "500", lineHeight: "22px" }}
        >
          {t("swap")}
        </Stack>
        <Stack as="span" $style={{ fontSize: "16px", lineHeight: "22px" }}>
          {dayjs(date).format("HH:mm")}
        </Stack>
      </VStack>
      <MiddleTruncate
        href={`https://etherscan.io/tx/${hash}`}
        $style={{ flexGrow: "1", overflow: "hidden" }}
        targetBlank
      >
        {hash}
      </MiddleTruncate>
      <HStack
        $style={{ alignItems: "center", gap: "24px", justifyContent: "center" }}
      >
        <HStack $style={{ alignItems: "center", gap: "8px" }}>
          <Stack
            as="img"
            alt={allocateToken}
            src={`/tokens/${allocateToken.toLowerCase()}.svg`}
            $style={{ height: "36px", width: "36px" }}
          />
          <VStack $style={{ gap: "4px" }}>
            <Stack as="span" $style={{ fontWeight: "600" }}>{`+${toNumberFormat(
              allocateAmount
            )}`}</Stack>
            <Stack as="span" $style={{ fontWeight: "500" }}>
              {allocateToken}
            </Stack>
          </VStack>
        </HStack>
        <ChevronRightIcon fontSize={24} />
        <HStack $style={{ alignItems: "center", gap: "8px" }}>
          <Stack
            as="img"
            alt={buyToken}
            src={`/tokens/${buyToken.toLowerCase()}.svg`}
            $style={{ height: "36px", width: "36px" }}
          />
          <VStack $style={{ gap: "4px" }}>
            <Stack as="span" $style={{ fontWeight: "600" }}>{`+${toNumberFormat(
              buyAmount
            )}`}</Stack>
            <Stack as="span" $style={{ fontWeight: "500" }}>
              {buyToken}
            </Stack>
          </VStack>
        </HStack>
        <HStack
          $style={{
            alignItems: "center",
            borderRadius: "16px",
            height: "34px",
            gap: "8px",
            justifyContent: "center",
            padding: "0 16px",
            position: "absolute",
            right: "0",
            top: "9px",
            ...match(status, {
              failed: () => ({
                backgroundColor: colors.error.toRgba(0.2),
                color: colors.error.toHex(),
              }),
              pending: () => ({
                backgroundColor: colors.warning.toRgba(0.2),
                color: colors.warning.toHex(),
              }),
              success: () => ({
                backgroundColor: colors.success.toRgba(0.2),
                color: colors.success.toHex(),
              }),
            }),
          }}
          $media={{ lg: { $style: { position: "static" } } }}
        >
          {match(status, {
            failed: () => (
              <>
                <OctagonAlertIcon fontSize={16} />
                <Stack as="span">{t("failed")}</Stack>
              </>
            ),
            pending: () => (
              <>
                <Spin size="small" />
                <Stack as="span">{t("pending")}</Stack>
              </>
            ),
            success: () => (
              <>
                <CircleCheckBigIcon fontSize={16} />
                <Stack as="span">{t("success")}</Stack>
              </>
            ),
          })}
        </HStack>
      </HStack>
    </Stack>
  );
};

export const SwapHistory = () => {
  const { t } = useTranslation();
  const { transactions, clearHistory } = useSwapHistory();

  return (
    <VStack as="span" $style={{ gap: "16px" }}>
      <HStack
        $style={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Stack
          as="span"
          $style={{ fontSize: "16px", fontWeight: "600", lineHeight: "24px" }}
          $media={{ xl: { $style: { fontSize: "20px" } } }}
        >
          {t("transactions")}
        </Stack>
        {transactions.length > 0 && (
          <Tooltip title={t("clearHistory")}>
            <Button
              icon={<TrashIcon fontSize={16} />}
              kind="danger"
              onClick={clearHistory}
              ghost
            />
          </Tooltip>
        )}
      </HStack>
      {transactions.length > 0 ? (
        transactions.map((transaction, index) => (
          <>
            {index > 0 && <Divider />}
            <Transaction key={transaction.hash} {...transaction} />
          </>
        ))
      ) : (
        <Empty description={t("noTransactionsFound")} />
      )}
    </VStack>
  );
};
