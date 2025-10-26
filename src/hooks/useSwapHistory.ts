import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";

import { getTransactions, setTransactions } from "@/storage/transaction";
import { TransactionProps } from "@/utils/types";

type StateProps = {
  transactions: TransactionProps[];
};

export const useSwapHistory = () => {
  const [state, setState] = useState<StateProps>({ transactions: [] });
  const { transactions } = state;
  const { address } = useAccount();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearHistory = (): void => {
    if (address) {
      setTransactions(address, []);
      setState((prevState) => ({ ...prevState, transactions: [] }));
    }
  };

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (address) {
      intervalRef.current = setInterval(() => {
        const transactions = getTransactions(address);

        setState((prevState) => {
          const updated =
            JSON.stringify(prevState.transactions) !==
            JSON.stringify(transactions);

          return updated
            ? { ...prevState, transactions: [...transactions, ...transactions] }
            : prevState;
        });
      }, 1000);
    } else {
      setState((prevState) => ({ ...prevState, transactions: [] }));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [address]);

  return { transactions, clearHistory };
};
