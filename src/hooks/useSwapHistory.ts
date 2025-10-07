import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { getTransactions, setTransactions } from "@/storage/transaction";
import { TransactionProps } from "@/utils/types";

let interval: NodeJS.Timeout;

interface InitialState {
  transactions: TransactionProps[];
}

export const useSwapHistory = () => {
  const initialState: InitialState = { transactions: [] };
  const [state, setState] = useState(initialState);
  const { transactions } = state;
  const { address } = useAccount();

  const clearHistory = (): void => {
    if (address) {
      setTransactions(address, []);
      setState((prevState) => ({ ...prevState, transactions: [] }));
    }
  };

  useEffect(() => {
    clearInterval(interval);

    if (address) {
      interval = setInterval(() => {
        const transactions = getTransactions(address);

        setState((prevState) => {
          const updated =
            JSON.stringify(prevState.transactions) !==
            JSON.stringify(transactions);

          return updated ? { ...prevState, transactions } : prevState;
        });
      }, 1000);
    } else {
      setState((prevState) => ({ ...prevState, transactions: [] }));
    }
  }, [address]);

  return { transactions, clearHistory };
};
