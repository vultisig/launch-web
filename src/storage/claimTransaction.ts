import { storageKeys } from "@/storage/constants";
import { getState } from "@/storage/state/get";
import { setState } from "@/storage/state/set";
import { ClaimTransactionProps } from "@/utils/types";

const getAllClaimTransactions = () => {
  const vaults: Record<string, ClaimTransactionProps[]> = {};

  return getState(storageKeys.claimTransactions, vaults);
};

export const getClaimTransactions = (address: string) => {
  return getAllClaimTransactions()[address] || [];
};

export const setClaimTransactions = (
  address: string,
  transactions: ClaimTransactionProps[]
) => {
  const allTransactions = getAllClaimTransactions();

  allTransactions[address] = transactions;

  setState(storageKeys.claimTransactions, allTransactions);
};

export const setClaimTransaction = (
  address: string,
  transaction: ClaimTransactionProps
) => {
  const transactions = getClaimTransactions(address);
  const isUpdate = transactions.some(({ hash }) => hash === transaction.hash);

  setClaimTransactions(
    address,
    isUpdate
      ? transactions.map((tx) =>
          tx.hash === transaction.hash ? transaction : tx
        )
      : [transaction, ...transactions]
  );
};
