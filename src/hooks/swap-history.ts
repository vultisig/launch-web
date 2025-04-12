import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { TransactionProps } from "utils/interfaces";
import { getStoredTransactions, setStoredTransactions } from "utils/storage";

let interval: NodeJS.Timeout;

interface InitialState {
  transactions: TransactionProps[];
}

const useSwapHistory = () => {
  const initialState: InitialState = { transactions: [] };
  const [state, setState] = useState(initialState);
  const { transactions } = state;
  const { address } = useAccount();

  const componentDidUpdate = () => {
    clearInterval(interval);

    if (address) {
      interval = setInterval(() => {
        const transactions = getStoredTransactions(address);

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
  };

  const clearHistory = (): void => {
    if (address) {
      setStoredTransactions(address, []);
      setState((prevState) => ({ ...prevState, transactions: [] }));
    }
  };

  useEffect(componentDidUpdate, [address]);

  return { transactions, clearHistory };
};

export default useSwapHistory;
