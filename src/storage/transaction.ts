import { storageKeys } from "@/storage/constants";
import { getState } from "@/storage/state/get";
import { setState } from "@/storage/state/set";
import { TransactionProps } from "@/utils/types";

const getAllTransactions = () => {
  const vaults: Record<string, TransactionProps[]> = {};

  return getState(storageKeys.transactions, vaults);
};

export const getTransactions = (address: string) => {
  return getAllTransactions()[address] || [];
};

export const setTransactions = (
  address: string,
  transactions: TransactionProps[]
) => {
  const allTransactions = getAllTransactions();

  allTransactions[address] = transactions;

  setState(storageKeys.transactions, allTransactions);
};

// export const getTransaction = (address: string, hash: string) => {
//   return getTransactions(address).find((tx) => tx.hash === hash);
// };

export const setTransaction = (
  address: string,
  transaction: TransactionProps
) => {
  const transactions = getTransactions(address);
  const isUpdate = transactions.some(({ hash }) => hash === transaction.hash);

  setTransactions(
    address,
    isUpdate
      ? transactions.map((tx) =>
          tx.hash === transaction.hash ? transaction : tx
        )
      : [transaction, ...transactions]
  );
};
