import { InputNumber, InputNumberProps, Layout, Select, Tooltip } from "antd";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import styled, { useTheme } from "styled-components";
import { useAccount, useSwitchChain } from "wagmi";
import {
  getBalance,
  writeContract,
  waitForTransactionReceipt,
  readContract,
  getTransactionReceipt,
} from "wagmi/actions";
import { useCore } from "@/hooks/useCore";
import { CheckIcon } from "@/icons/CheckIcon";
import { Button } from "@/toolkits/Button";
import { Divider } from "@/toolkits/Divider";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import {
  baseContractAddress,
  BaseMergeAbi,
  ETHClaimAbi,
  IOUVultAbi,
  modalHash,
} from "@/utils/constants";
import { vultisigConnect, vultisigPersonalSign } from "@/utils/extension";
import { toAmountFormat, toNumberFormat } from "@/utils/functions";
import { wagmiConfig } from "@/utils/wagmi";
import { base, mainnet } from "viem/chains";
import { formatEther, toHex } from "viem";
import { VultisigWalletProps } from "@/utils/types";
import { api } from "@/utils/api";
import { parseEther } from "ethers";
import {
  getClaimTransactions,
  setClaimTransaction,
} from "@/storage/claimTransaction";

const { Content } = Layout;

const getExplorerLink = (txHash: string, chainId: number) => {
  if (chainId === base.id) {
    return `https://basescan.org/tx/${txHash}`;
  } else if (chainId === mainnet.id) {
    return `https://etherscan.io/tx/${txHash}`;
  }
  return `https://etherscan.io/tx/${txHash}`; // Default to Etherscan
};

type StateProps = {
  burnAmount?: number;
  claimAmount?: number;
  connecting?: boolean;
  vultisigWallet?: VultisigWalletProps & { account: string };
  isWalletRegistered?: boolean;
  vultisigConnected?: boolean;
  iouVultBalance?: bigint;
  unclaimedBurns?: Array<{
    baseTxId: string;
    baseEventId: string;
    amount: string;
    recipient: string;
    blockNumber: number;
  }>;
  selectedBurn?: {
    baseTxId: string;
    baseEventId: string;
    amount: string;
  };
  tokenAllowance?: bigint;
  needsApproval?: boolean;
  approveLoading?: boolean;
  attestData?: {
    address: string;
    signature: string;
    domain: {
      name: string;
      version: string;
      chainId: number;
      verifyingContract: string;
    };
  };
  claimLoading?: boolean;
  burnLoading?: boolean;
  currentChainId?: typeof base.id | typeof mainnet.id;
  isPollingAttestBurn?: boolean;
  burnTxHash?: string;
  claimTxHash?: string;
  useMaxAmount?: boolean;
};

export const ClaimPage = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({});
  const {
    burnAmount,
    connecting,
    vultisigWallet = {
      account: "",
      hexChainCode: "",
      isFastVault: false,
      name: "",
      publicKeyEcdsa: "",
      publicKeyEddsa: "",
      uid: "",
    },
    vultisigConnected,
    isWalletRegistered = false,
    iouVultBalance,
    unclaimedBurns,
    selectedBurn,
    needsApproval,
    approveLoading = false,
    attestData = {
      address: "",
      signature: "",
      domain: {
        name: "",
        version: "",
        chainId: 0,
        verifyingContract: "",
      },
    },
    currentChainId = base.id,
    claimLoading = false,
    burnLoading = false,
    isPollingAttestBurn = false,
    burnTxHash,
    claimTxHash,
    useMaxAmount = false,
  } = state;
  const [step, setStep] = useState(0);
  const { message, setCurrentPage, tokens } = useCore();
  const { address = "", isConnected, chainId, connector } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const isDesktop = useMediaQuery({ query: "(min-width: 1200px)" });
  const colors = useTheme();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);
  const unclaimedBurnsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const disabled = useMemo(() => {
    switch (step) {
      case 0:
        return !isConnected;
      case 1:
        return !vultisigConnected || !isWalletRegistered;
      default:
        return false;
    }
  }, [isConnected, step, vultisigConnected, isWalletRegistered]);

  const handleBurnAmount: InputNumberProps["onChange"] = (value) => {
    setState((prevState) => ({
      ...prevState,
      burnAmount: typeof value === "number" ? value : undefined,
      useMaxAmount: false,
    }));
  };

  const checkTokenAllowance = useCallback(async () => {
    if (
      !address ||
      !burnAmount ||
      burnAmount <= 0 ||
      !attestData.domain.verifyingContract ||
      chainId !== base.id
    ) {
      return;
    }

    try {
      const allowance = await readContract(wagmiConfig, {
        address: baseContractAddress.iouVult as `0x${string}`,
        abi: IOUVultAbi,
        functionName: "allowance",
        args: [address, attestData.domain.verifyingContract as `0x${string}`],
      });

      const allowanceAmount = Number(formatEther(allowance as bigint));
      // Check if current allowance is sufficient for the burn amount
      // Use a small epsilon to handle floating point precision issues
      const needsApprovalCheck = allowanceAmount < burnAmount - 0.000001;

      setState((prevState) => ({
        ...prevState,
        tokenAllowance: allowance as bigint,
        needsApproval: needsApprovalCheck,
      }));
    } catch (error) {
      console.error("Error checking allowance:", error);
    }
  }, [address, burnAmount, attestData.domain.verifyingContract, chainId]);

  const handleApprove = async () => {
    if (!burnAmount || burnAmount <= 0 || !attestData.domain.verifyingContract)
      return;

    setState((prevState) => ({
      ...prevState,
      approveLoading: true,
      currentChainId: base.id,
    }));

    try {
      // Approve the required amount (approve replaces previous allowance, doesn't add)
      // Always approve the full required amount to ensure sufficient allowance

      const approveHash = await writeContract(wagmiConfig, {
        chainId: base.id,
        address: baseContractAddress.iouVult as `0x${string}`,
        abi: IOUVultAbi,
        functionName: "approve",
        args: [
          attestData.domain.verifyingContract as `0x${string}`,
          useMaxAmount ? iouVultBalance : parseEther(String(burnAmount)),
        ],
      });

      const approveReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: approveHash,
      });

      const approveSuccess = approveReceipt.status === "success";
      if (approveSuccess) {
        message.success("Tokens approved successfully");
        // Wait for blockchain state to update, then retry allowance check
        let retries = 3;
        let allowanceUpdated = false;

        while (retries > 0 && !allowanceUpdated) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await checkTokenAllowance();

          // Check if approval was successful by reading allowance again
          try {
            const updatedAllowance = await readContract(wagmiConfig, {
              address: baseContractAddress.iouVult as `0x${string}`,
              abi: IOUVultAbi,
              functionName: "allowance",
              args: [
                address,
                attestData.domain.verifyingContract as `0x${string}`,
              ],
            });
            const updatedAllowanceAmount = Number(
              formatEther(updatedAllowance as bigint)
            );

            if (updatedAllowanceAmount >= burnAmount - 0.000001) {
              allowanceUpdated = true;
            }
          } catch (error) {
            console.error("Error checking updated allowance:", error);
          }

          retries--;
        }
      } else {
        message.error("Failed to approve tokens");
      }
    } catch (error) {
      console.error("Approve error:", error);
      message.error("Failed to approve tokens");
    } finally {
      setState((prevState) => ({
        ...prevState,
        approveLoading: false,
      }));
    }
  };

  const handleBurnSubmit = async () => {
    if (!burnAmount || burnAmount <= 0) return;

    // Check if approval is needed
    if (needsApproval) {
      message.error("Please approve tokens first");
      return;
    }

    setState((prevState) => ({
      ...prevState,
      burnLoading: true,
      currentChainId: base.id,
      burnTxHash: undefined, // Clear previous burn tx hash
    }));

    try {
      const mergeHash = await writeContract(wagmiConfig, {
        address: attestData.domain.verifyingContract as `0x${string}`,
        abi: BaseMergeAbi,
        functionName: "merge",
        args: [
          useMaxAmount ? iouVultBalance : parseEther(String(burnAmount)),
          vultisigWallet.account,
          attestData.signature,
        ],
      });

      const mergeReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: mergeHash,
      });

      const success = mergeReceipt.status === "success" ? true : false;
      if (success) {
        message.success("Tokens burned successfully");
        setState((prevState) => ({
          ...prevState,
          burnTxHash: mergeHash,
        }));
        setClaimTransaction(address, {
          amount: burnAmount,
          date: Date.now(),
          hash: mergeHash,
          status: "success",
          isClaimed: false,
          eventId: mergeReceipt.logs.length - 1,
        });
        getIOUVultBalance();
        // Reload claim transaction to update claimAmount
        loadClaimTransaction();
        // Wait a bit for blockchain state to update after burn
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Refresh allowance check after successful burn
        // This will update the button to "Approve" if allowance is now insufficient
        await checkTokenAllowance();
      } else {
        setState((prevState) => ({ ...prevState, burnLoading: false }));
        message.error("Failed to burn tokens");
      }
    } catch {
      setState((prevState) => ({ ...prevState, burnLoading: false }));
      message.error("Failed to burn tokens");
    }
    setState((prevState) => ({ ...prevState, burnLoading: false }));
  };
  const handleMaxAmount = () => {
    setState((prevState) => ({
      ...prevState,
      useMaxAmount: true,
      burnAmount: Number(formatEther(iouVultBalance as bigint)),
    }));
  };

  const handleClaimBurnSelect = (baseTxId: string) => {
    const selected = unclaimedBurns?.find((burn) => burn.baseTxId === baseTxId);
    if (selected) {
      setState((prevState) => ({
        ...prevState,
        selectedBurn: {
          baseTxId: selected.baseTxId,
          baseEventId: selected.baseEventId,
          amount: selected.amount,
        },
        claimAmount: Number(formatEther(BigInt(selected.amount))),
      }));
    }
  };

  const handleClaimSubmit = async () => {
    if (!selectedBurn) {
      message.error("Please select a burn transaction to claim");
      return;
    }
    setState((prevState) => ({
      ...prevState,
      currentChainId: mainnet.id,
      claimLoading: true,
      claimTxHash: undefined, // Clear previous claim tx hash
    }));
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    pollingStartTimeRef.current = Date.now();
    const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

    setState((prevState) => ({ ...prevState, isPollingAttestBurn: true }));

    const pollAttestBurn = async (): Promise<boolean> => {
      if (
        pollingStartTimeRef.current &&
        Date.now() - pollingStartTimeRef.current >= TIMEOUT_MS
      ) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        pollingStartTimeRef.current = null;
        message.error("Timeout: Failed to attest burn within 5 minutes");
        setState((prevState) => ({
          ...prevState,
          claimLoading: false,
          isPollingAttestBurn: false,
        }));
        return false; // Indicate polling should stop
      }

      try {
        // Fetch transaction receipt to find the event index
        // baseEventId from API is a hash, we need to find which log index it corresponds to
        let eventId: number;

        try {
          const receipt = await getTransactionReceipt(wagmiConfig, {
            hash: selectedBurn.baseTxId as `0x${string}`,
            chainId: base.id,
          });

          // Default to last log index as fallback
          eventId = receipt.logs.length - 1;

          // Find the log index that matches the baseEventId hash
          // The baseEventId should be in one of the indexed topics of the Merge event
          let foundEventId: number | undefined;

          for (let i = 0; i < receipt.logs.length; i++) {
            const log = receipt.logs[i];
            // The baseEventId should be in one of the indexed topics
            // Check if any topic matches the baseEventId (case-insensitive comparison)
            if (
              log.topics.some(
                (topic) =>
                  topic.toLowerCase() === selectedBurn.baseEventId.toLowerCase()
              )
            ) {
              foundEventId = i;
              break;
            }
          }

          // If not found by topic matching, try finding by contract address and use last log index
          // This is a fallback - the merge event should be one of the last logs
          if (foundEventId === undefined) {
            const mergeContractAddress =
              attestData.domain.verifyingContract.toLowerCase();
            const relevantLogs = receipt.logs.filter(
              (log) => log.address.toLowerCase() === mergeContractAddress
            );
            // Use the index of the last relevant log as a fallback
            if (relevantLogs.length > 0) {
              const lastRelevantLog = relevantLogs[relevantLogs.length - 1];
              foundEventId = receipt.logs.indexOf(lastRelevantLog);
            } else {
              // Final fallback: use last log index (similar to old implementation)
              foundEventId = receipt.logs.length - 1;
            }
          }

          eventId = foundEventId;
        } catch (receiptError) {
          console.error("Error fetching transaction receipt:", receiptError);
          message.error(
            "Failed to fetch transaction receipt. Please try again."
          );
          setState((prevState) => ({
            ...prevState,
            claimLoading: false,
            isPollingAttestBurn: false,
          }));
          // Clear intervals on error
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          pollingStartTimeRef.current = null;
          return false; // Indicate polling should stop
        }

        const attestBurnResult = await api.attestBurn({
          txId: selectedBurn.baseTxId,
          eventId: eventId,
        });

        if (attestBurnResult.success) {
          try {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            pollingStartTimeRef.current = null;

            setState((prevState) => ({
              ...prevState,
              isPollingAttestBurn: false,
            }));

            const attestData = attestBurnResult.data;
            setState((prevState) => ({
              ...prevState,
              claimAmount: Number(formatEther(BigInt(attestData.amount))),
            }));

            const isMetaMask = connector?.name === "MetaMask";

            if (chainId !== mainnet.id) {
              if (isMetaMask) {
                await connector.switchChain?.({ chainId: mainnet.id });
              } else {
                try {
                  await switchChainAsync({ chainId: mainnet.id });
                } catch (error) {
                  console.error("Error switching chain:", error);
                  message.error(
                    "Failed to switch chain to Mainnet. Please switch manually from your wallet."
                  );
                }
              }
            }

            const claimHash = await writeContract(wagmiConfig, {
              chainId: mainnet.id,
              address: attestData.domain.verifyingContract as `0x${string}`,
              abi: ETHClaimAbi,
              functionName: "claim",
              args: [
                attestData.baseTxId,
                attestData.baseEventId,
                attestData.amount,
                attestData.recipient,
                attestData.signature,
              ],
            });
            const claimReceipt = await waitForTransactionReceipt(wagmiConfig, {
              hash: claimHash,
            });
            const success = claimReceipt.status === "success" ? true : false;
            if (success) {
              setState((prevState) => ({
                ...prevState,
                claimTxHash: claimHash,
                selectedBurn: undefined,
              }));
              message.success("Tokens claimed successfully");
              // Refetch unclaimed burns after successful claim
              getUnclaimedBurns();
              setState((prevState) => ({ ...prevState, claimLoading: false }));
            } else {
              message.error("Failed to claim tokens");
              setState((prevState) => ({ ...prevState, claimLoading: false }));
            }
          } catch (error) {
            if (pollingIntervalRef.current)
              clearInterval(pollingIntervalRef.current);

            pollingIntervalRef.current = null;
            pollingStartTimeRef.current = null;
            setState((prevState) => ({ ...prevState, claimLoading: false }));
            message.error("Failed to claim tokens");
            console.error("Error claiming tokens:", error);
            return false; // Indicate polling should stop
          }
          return false; // Successfully completed, no need to continue polling
        }
        return true; // Continue polling - attestBurn not successful yet
      } catch (error) {
        return true; // Indicate polling should continue
      }
    };

    const shouldContinuePolling = await pollAttestBurn();

    // Only set interval if polling should continue
    if (shouldContinuePolling && !pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(async () => {
        const shouldContinue = await pollAttestBurn();
        if (!shouldContinue && pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }, 20000);
    }
  };

  const handleConnect = () => {
    if (connecting) return;

    setState((prevState) => ({ ...prevState, connecting: true }));

    vultisigConnect()
      .then((vultisigWallet) => {
        message.success("Vultisig connected successfully");
        setState((prevState) => ({
          ...prevState,
          connecting: false,
          vultisigWallet,
          vultisigConnected: true,
        }));
      })
      .catch(() => {
        message.error("Failed to connect Vultisig");

        setState((prevState) => ({ ...prevState, connecting: false }));
      });
  };

  const checkAndRegisterVultisigWallet = useCallback(async () => {
    if (vultisigWallet.account) {
      setState((prevState) => ({ ...prevState, connecting: true }));
      const status = await api.applyStatus(vultisigWallet.publicKeyEcdsa);
      if (status) {
        const attestResult = await api.attestAddress(vultisigWallet.account);
        if (attestResult.success) {
          setState((prevState) => ({
            ...prevState,
            isWalletRegistered: status,
            connecting: false,
            attestData: attestResult.data,
          }));
        } else {
          message.error("Failed to verify vultisig wallet");
          setState((prevState) => ({
            ...prevState,
            isWalletRegistered: false,
            connecting: false,
          }));
        }
      }
      if (!status) {
        registerVultisigWallet();
      }
    }
  }, [vultisigWallet]);

  useEffect(() => {
    checkAndRegisterVultisigWallet();
  }, [checkAndRegisterVultisigWallet]);

  const registerVultisigWallet = useCallback(async () => {
    if (vultisigWallet.account && vultisigWallet.uid && !isWalletRegistered) {
      try {
        setState((prevState) => ({ ...prevState, connecting: true }));
        const { message: challengeMessage } = await api.challengeMessage(
          vultisigWallet.uid
        );
        const hexMessage = toHex(challengeMessage);
        const signature = await vultisigPersonalSign(
          hexMessage,
          vultisigWallet.account
        );
        await api.registerVultisigWallet(
          vultisigWallet,
          challengeMessage,
          signature
        );

        const result = await api.attestAddress(vultisigWallet.account);

        if (result.success) {
          setState((prevState) => ({
            ...prevState,
            isWalletRegistered: true,
            connecting: false,
            attestData: result.data,
          }));
        } else {
          message.error("Failed to verify vultisig wallet");
        }
      } catch {
        message.error("Failed to register Vultisig wallet");
        setState((prevState) => ({
          ...prevState,
          connecting: false,
          isWalletRegistered: false,
          vultisigConnected: false,
        }));
      }
    }
  }, [vultisigWallet, isWalletRegistered]);

  const handleContinue = () => {
    if (disabled) return;

    setStep(step + 1);
  };

  useEffect(() => {
    if (!isConnected) setStep(0);
  }, [isConnected]);

  const getIOUVultBalance = useCallback(() => {
    if (address && chainId && chainId === base.id) {
      setState((prevState) => ({ ...prevState }));
      getBalance(wagmiConfig, {
        address,
        token: baseContractAddress.iouVult,
      })
        .then(({ value }) => {
          // Validate the balance value
          if (value !== undefined && value !== null) {
            setState((prevState) => ({
              ...prevState,
              iouVultBalance: value,
            }));
          }
        })
        .catch((error) => {
          console.error("Error fetching IOU balance:", error);
          message.error("Failed to get IOU vault balance");
        });
    }
  }, [address, chainId, message, isConnected]);

  const loadClaimTransaction = useCallback(() => {
    if (!address) return;
    const claimTransactions = getClaimTransactions(address);
    const unclaimedTransaction = claimTransactions
      .filter((tx) => !tx.isClaimed)
      .sort((a, b) => b.date - a.date)[0];

    if (unclaimedTransaction) {
      setState((prevState) => ({
        ...prevState,
        claimAmount: unclaimedTransaction.amount,
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        claimAmount: undefined,
      }));
    }
  }, [address]);

  const getUnclaimedBurns = useCallback(() => {
    if (!address) return;
    api
      .getBurns(address)
      .then((result) => {
        if (result.success && result.data) {
          const unclaimedBurnsList = result.data.filter(
            (burn: { claimed: boolean }) => !burn.claimed
          );
          setState((prevState) => ({
            ...prevState,
            unclaimedBurns: unclaimedBurnsList.map(
              (burn: {
                baseTxId: string;
                baseEventId: string;
                amount: string;
                recipient: string;
                blockNumber: number;
              }) => ({
                baseTxId: burn.baseTxId,
                baseEventId: burn.baseEventId,
                amount: burn.amount,
                recipient: burn.recipient,
                blockNumber: burn.blockNumber,
              })
            ),
          }));
        } else {
          setState((prevState) => ({
            ...prevState,
            unclaimedBurns: [],
          }));
        }
      })
      .catch(() => {
        message.error("Failed to get unclaimed burns");
        setState((prevState) => ({
          ...prevState,
          unclaimedBurns: [],
        }));
      });
  }, [address, message]);

  const handleSwitchChain = useCallback(async () => {
    if (isConnected) {
      if (chainId && chainId !== currentChainId) {
        const isMetaMask = connector?.name === "MetaMask";
        if (isMetaMask) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${currentChainId.toString(16)}` }],
            });
            return;
          } catch (error) {
            message.error(
              `Failed to switch chain. Please switch to ${
                currentChainId === base.id ? "Base" : "Mainnet"
              } network from your wallet manually and try again.`
            );
          }
        }

        try {
          await switchChainAsync({ chainId: currentChainId });
        } catch {
          message.error(
            `Failed to switch chain. Please switch to ${
              currentChainId === base.id ? "Base" : "Mainnet"
            } network from your wallet manually and try again.`
          );
        }
      }
      getIOUVultBalance();
    }
  }, [
    isConnected,
    chainId,
    message,
    getIOUVultBalance,
    currentChainId,
    connector,
  ]);

  useEffect(() => {
    handleSwitchChain();
  }, [handleSwitchChain]);

  useEffect(() => {
    loadClaimTransaction();
  }, [loadClaimTransaction]);

  useEffect(() => {
    checkTokenAllowance();
  }, [checkTokenAllowance]);

  useEffect(() => {
    getUnclaimedBurns();

    // Set up polling to refresh unclaimed burns every 12 seconds
    if (address) {
      // Clear any existing interval
      if (unclaimedBurnsIntervalRef.current) {
        clearInterval(unclaimedBurnsIntervalRef.current);
      }

      // Set up new interval
      unclaimedBurnsIntervalRef.current = setInterval(() => {
        getUnclaimedBurns();
      }, 12000); // 12 seconds
    }

    // Cleanup function
    return () => {
      if (unclaimedBurnsIntervalRef.current) {
        clearInterval(unclaimedBurnsIntervalRef.current);
        unclaimedBurnsIntervalRef.current = null;
      }
    };
  }, [getUnclaimedBurns, address]);

  useEffect(() => setCurrentPage("claim"), []);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (unclaimedBurnsIntervalRef.current) {
        clearInterval(unclaimedBurnsIntervalRef.current);
        unclaimedBurnsIntervalRef.current = null;
      }
      pollingStartTimeRef.current = null;
    };
  }, []);

  return (
    <VStack
      as={Content}
      $style={{
        gap: "24px",
        maxWidth: "1200px",
        padding: "24px 16px",
        width: "100%",
      }}
    >
      <Stack as="span" $style={{ fontSize: "32px", fontWeight: "600" }}>
        Claim IOU $VULT
      </Stack>
      <VStack
        $style={{ gap: "24px", flexGrow: "1" }}
        $media={{ xl: { $style: { flexDirection: "row" } } }}
      >
        <VStack $media={{ xl: { $style: { flex: "none", width: "322px" } } }}>
          <Stack
            $style={{
              backgroundColor: colors.bgSecondary.toHex(),
              borderRadius: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              justifyContent: "space-between",
              padding: "32px",
            }}
            $media={{
              md: { $style: { flexDirection: "row" } },
              xl: { $style: { flexDirection: "column" } },
            }}
          >
            {[
              "Connect Base Wallet",
              "Connect Vultisig Extension",
              "Claim Overview",
            ].map((item, index) => {
              const disabled = step < index;
              const passed = step > index;

              return (
                <Fragment key={index}>
                  {index > 0 && <Divider light />}
                  <HStack $style={{ alignItems: "center", gap: "8px" }}>
                    <HStack
                      as="span"
                      $style={{
                        alignItems: "center",
                        backgroundColor: passed
                          ? colors.success.toHex()
                          : colors.bgTertiary.toHex(),
                        border:
                          disabled || passed
                            ? undefined
                            : `solid 1px ${colors.accentFour.toHex()}`,
                        borderRadius: "50%",
                        color: passed
                          ? colors.neutral50.toHex()
                          : disabled
                          ? colors.textTertiary.toHex()
                          : colors.accentFour.toHex(),
                        height: "24px",
                        justifyContent: "center",
                        width: "24px",
                      }}
                    >
                      {passed ? <CheckIcon /> : index + 1}
                    </HStack>
                    <Stack
                      as="span"
                      $style={{
                        color:
                          disabled || passed
                            ? colors.textTertiary.toHex()
                            : colors.textPrimary.toHex(),
                      }}
                    >
                      {item}
                    </Stack>
                  </HStack>
                </Fragment>
              );
            })}
          </Stack>
        </VStack>
        <Divider vertical={isDesktop} />
        <VStack
          $style={{ gap: "24px" }}
          $media={{ xl: { $style: { flexGrow: "1" } } }}
        >
          <Stack
            $style={{
              backgroundColor: colors.bgSecondary.toHex(),
              borderRadius: "24px",
              padding: "32px",
            }}
          >
            <Stack
              $style={{
                display: step === 0 ? "flex" : "none",
                flexDirection: "column",
                gap: "32px",
              }}
            >
              <Stack as="span">
                To claim your $VULT tokens from the IOU Merge contract, make
                sure you have enough ETH on both Base and Ethereum networks to
                cover gas fees. Then, connect your Base wallet, burn your IOU
                tokens, and claim your $VULT with your Vultisig wallet.
              </Stack>
              <VStack $style={{ gap: "12px" }}>
                <Stack
                  as="span"
                  $style={{
                    fontSize: "22px",
                    fontWeight: "500",
                    lineHeight: "24px",
                  }}
                >
                  Connect Base Wallet
                </Stack>
                <Stack as="span">
                  Connect the wallet holding your IOU $VULT tokens on BASE
                </Stack>
              </VStack>
              {isConnected ? (
                <HStack $style={{ alignItems: "center", gap: "8px" }}>
                  <Stack
                    as={CheckIcon}
                    $style={{
                      backgroundColor: colors.success.toHex(),
                      borderRadius: "50%",
                      fontSize: "16px",
                      padding: "2px",
                    }}
                  />
                  <Stack
                    as="span"
                    $style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      lineHeight: "16px",
                    }}
                  >
                    {address}
                  </Stack>
                </HStack>
              ) : (
                <HStack>
                  <Button href={modalHash.connect}>{t("connect")}</Button>
                </HStack>
              )}
            </Stack>
            <Stack
              $style={{
                display: step === 1 ? "flex" : "none",
                flexDirection: "column",
                gap: "32px",
              }}
            >
              <Stack as="span">
                To Claim your $VULT tokens from the IOU Merge contract you need
                to connect your base wallet, burn the IOU tokens and claim the
                $VULT with your Vultisig wallet.
              </Stack>
              <VStack $style={{ gap: "12px" }}>
                <Stack
                  as="span"
                  $style={{
                    fontSize: "22px",
                    fontWeight: "500",
                    lineHeight: "24px",
                  }}
                >
                  Connect Vultisig Wallet
                </Stack>
                <Stack as="span">
                  Connect your Vultisig vault to receive your claimed $VULT
                  tokens on Ethereum.
                </Stack>
              </VStack>
              {vultisigConnected ? (
                <HStack $style={{ alignItems: "center", gap: "8px" }}>
                  <Stack
                    as={CheckIcon}
                    $style={{
                      backgroundColor: colors.success.toHex(),
                      borderRadius: "50%",
                      fontSize: "16px",
                      padding: "2px",
                    }}
                  />
                  <Stack
                    as="span"
                    $style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      lineHeight: "16px",
                    }}
                  >
                    {vultisigWallet.account}
                  </Stack>
                </HStack>
              ) : (
                <HStack>
                  <Button
                    disabled={connecting}
                    loading={connecting}
                    onClick={handleConnect}
                  >
                    {t("connect")}
                  </Button>
                </HStack>
              )}
            </Stack>
            <Stack
              $style={{
                display: step === 2 ? "flex" : "none",
                flexDirection: "column",
                gap: "32px",
              }}
            >
              <Stack
                as="span"
                $style={{
                  fontSize: "22px",
                  fontWeight: "500",
                  lineHeight: "24px",
                }}
              >
                Claim Overview
              </Stack>
              <Stack
                as="span"
                $style={{
                  color: colors.textSecondary.toHex(),
                  fontSize: "13px",
                  fontWeight: "500",
                  lineHeight: "16px",
                }}
              >
                Make sure to have sufficient Gas on Ethereum and Base available
                to burn and claim.
              </Stack>
              <VStack $style={{ gap: "4px" }}>
                <Stack
                  as="span"
                  $style={{
                    color: colors.textSecondary.toHex(),
                    fontSize: "13px",
                    fontWeight: "500",
                    lineHeight: "16px",
                  }}
                >
                  Base Wallet
                </Stack>
                <Stack as="span">{address}</Stack>
              </VStack>
              <VStack $style={{ gap: "8px" }}>
                <Stack
                  as="span"
                  $style={{
                    color: colors.textSecondary.toHex(),
                    fontSize: "13px",
                    fontWeight: "500",
                    lineHeight: "16px",
                  }}
                >
                  Vultisig Vault
                </Stack>
                <Stack as="span">{vultisigWallet.account}</Stack>
              </VStack>
              <VStack $style={{ gap: "8px" }}>
                <Stack as="span" $style={{ fontWeight: "500" }}>
                  IOU $VULT tokens to burn
                </Stack>
                <HStack $style={{ gap: "12px" }}>
                  <AmountInput
                    controls={false}
                    formatter={(value = "") => toNumberFormat(value)}
                    min={0}
                    onChange={handleBurnAmount}
                    placeholder="0"
                    suffix={tokens.VULT.ticker}
                    value={burnAmount}
                  />
                  <SubmitButton
                    onClick={needsApproval ? handleApprove : handleBurnSubmit}
                    disabled={
                      iouVultBalance === 0n ||
                      iouVultBalance === undefined ||
                      (needsApproval ? approveLoading : burnLoading) ||
                      !burnAmount ||
                      burnAmount <= 0
                    }
                    loading={needsApproval ? approveLoading : burnLoading}
                  >
                    {needsApproval ? "Approve" : "Burn"}
                  </SubmitButton>
                </HStack>
                <HStack>
                  <Tooltip title={t("clickToUseFullAmount")}>
                    <HStack
                      as="span"
                      onClick={handleMaxAmount}
                      $style={{
                        color: colors.textTertiary.toHex(),
                        cursor: "pointer",
                        gap: "4px",
                      }}
                      $hover={{ color: colors.textSecondary.toHex() }}
                    >
                      <Stack as="span">{`${t("available")}:`}</Stack>
                      <Stack as="span" $style={{ fontWeight: "600" }}>
                        {iouVultBalance !== undefined && iouVultBalance !== null
                          ? (() => {
                              // Convert bigint to string first to avoid precision loss
                              const balanceString = formatEther(iouVultBalance);
                              const balanceNumber = parseFloat(balanceString);
                              // Ensure we have a valid number
                              if (
                                isNaN(balanceNumber) ||
                                !isFinite(balanceNumber)
                              ) {
                                return "0";
                              }
                              return toAmountFormat(balanceNumber);
                            })()
                          : "0"}
                      </Stack>
                    </HStack>
                  </Tooltip>
                </HStack>
              </VStack>
              {burnTxHash && (
                <VStack $style={{ gap: "8px" }}>
                  <Stack
                    as="span"
                    $style={{
                      fontWeight: "500",
                      color: colors.success.toHex(),
                    }}
                  >
                    ✓ Burn Transaction Hash
                  </Stack>
                  <HStack $style={{ alignItems: "center", gap: "8px" }}>
                    <Stack
                      as="span"
                      $style={{
                        fontSize: "13px",
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      {burnTxHash}
                    </Stack>
                    <Stack
                      as="a"
                      href={getExplorerLink(burnTxHash, base.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      $style={{
                        color: colors.accentFour.toHex(),
                        fontSize: "13px",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                      $hover={{ textDecoration: "underline" }}
                    >
                      View on BaseScan
                    </Stack>
                  </HStack>
                </VStack>
              )}
              <VStack $style={{ gap: "8px" }}>
                <Stack as="span" $style={{ fontWeight: "500" }}>
                  $VULT to Claim
                </Stack>
                <HStack $style={{ gap: "12px" }}>
                  <BurnSelect
                    placeholder="Select burn transaction"
                    value={selectedBurn?.baseTxId}
                    onChange={(value) => handleClaimBurnSelect(value as string)}
                    disabled={
                      claimLoading ||
                      !unclaimedBurns ||
                      unclaimedBurns.length === 0
                    }
                    options={
                      unclaimedBurns?.map((burn) => {
                        const amount = Number(formatEther(BigInt(burn.amount)));
                        return {
                          value: burn.baseTxId,
                          label: `${toAmountFormat(amount)} ${
                            tokens.VULT.ticker
                          }`,
                        };
                      }) || []
                    }
                  />
                  <SubmitButton
                    onClick={handleClaimSubmit}
                    disabled={claimLoading || !selectedBurn}
                    loading={claimLoading}
                    style={{ width: claimLoading ? "240px" : "140px" }}
                  >
                    {isPollingAttestBurn
                      ? "Confirming burn tx\n (≈2 min)"
                      : "Claim"}
                  </SubmitButton>
                </HStack>
              </VStack>
              {claimTxHash && (
                <VStack $style={{ gap: "8px" }}>
                  <Stack
                    as="span"
                    $style={{
                      fontWeight: "500",
                      color: colors.success.toHex(),
                    }}
                  >
                    ✓ Claim Transaction Hash
                  </Stack>
                  <HStack $style={{ alignItems: "center", gap: "8px" }}>
                    <Stack
                      as="span"
                      $style={{
                        fontSize: "13px",
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      {claimTxHash}
                    </Stack>
                    <Stack
                      as="a"
                      href={getExplorerLink(claimTxHash, mainnet.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      $style={{
                        color: colors.accentFour.toHex(),
                        fontSize: "13px",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                      $hover={{ textDecoration: "underline" }}
                    >
                      View on Etherscan
                    </Stack>
                  </HStack>
                </VStack>
              )}
            </Stack>
          </Stack>
          {step < 2 && (
            <HStack $style={{ justifyContent: "center" }}>
              <Button disabled={disabled} onClick={handleContinue}>
                Continue
              </Button>
            </HStack>
          )}
        </VStack>
      </VStack>
    </VStack>
  );
};

const AmountInput = styled(InputNumber)`
  background-color: ${({ theme }) => theme.bgPrimary.toHex()} !important;
  border-radius: 12px;
  box-shadow: none;
  flex-grow: 1;
  outline: none;
  width: 100%;

  .ant-input-number-input {
    font-size: 16px;
    font-weight: 500;
    height: 54px;
  }
`;

const BurnSelect = styled(Select)`
  flex-grow: 1;
  width: 100%;
  height: auto;

  .ant-select-selector {
    background-color: ${({ theme }) => theme.bgPrimary.toHex()} !important;
    border-radius: 12px !important;
    height: 56px !important;
    font-size: 16px !important;
    font-weight: 500 !important;
    display: flex !important;
    align-items: center !important;
    padding: 0 40px 0 16px !important;
  }

  .ant-select-selection-placeholder {
    line-height: 54px !important;
  }

  .ant-select-selection-item {
    line-height: 54px !important;
  }

  .ant-select-arrow {
    margin-top: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    right: 16px !important;
    height: auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .ant-select-selection-search {
    display: flex !important;
    align-items: center !important;
  }
`;

const SubmitButton = styled(Button)`
  border-radius: 12px;
  height: 56px;
  width: 112px;
`;
