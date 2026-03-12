import { InputNumber, InputNumberProps, Layout, Select, Tooltip } from "antd";
import { parseEther } from "ethers";
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
import { formatEther, toHex } from "viem";
import { base, mainnet } from "viem/chains";
import { useAccount, useSwitchChain } from "wagmi";
import {
  getBalance,
  getTransactionReceipt,
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";

import { useCore } from "@/hooks/useCore";
import { CheckIcon } from "@/icons/CheckIcon";
import {
  getClaimTransactions,
  setClaimTransaction,
} from "@/storage/claimTransaction";
import { Button } from "@/toolkits/Button";
import { Divider } from "@/toolkits/Divider";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { api } from "@/utils/api";
import {
  baseContractAddress,
  BaseMergeAbi,
  ETHClaimAbi,
  IOUVultAbi,
  modalHash,
} from "@/utils/constants";
import { vultisigConnect, vultisigPersonalSign } from "@/utils/extension";
import { toAmountFormat, toNumberFormat } from "@/utils/functions";
import { VultisigWalletProps } from "@/utils/types";
import { wagmiConfig } from "@/utils/wagmi";

const { Content } = Layout;

const DEFAULT_ATTEST_DATA = {
  address: "",
  domain: { chainId: 0, name: "", verifyingContract: "", version: "" },
  signature: "",
};

const DEFAULT_VULTISIG_WALLET = {
  account: "",
  hexChainCode: "",
  isFastVault: false,
  name: "",
  publicKeyEcdsa: "",
  publicKeyEddsa: "",
  uid: "",
};

const getExplorerLink = (txHash: string, chainId: number) => {
  if (chainId === base.id) {
    return `https://basescan.org/tx/${txHash}`;
  } else if (chainId === mainnet.id) {
    return `https://etherscan.io/tx/${txHash}`;
  }
  return `https://etherscan.io/tx/${txHash}`; // Default to Etherscan
};

type StateProps = {
  approveLoading?: boolean;
  attestData?: {
    address: string;
    domain: {
      chainId: number;
      name: string;
      verifyingContract: string;
      version: string;
    };
    signature: string;
  };
  burnAmount?: number;
  burnLoading?: boolean;
  burnTxHash?: string;
  claimAmount?: number;
  claimLoading?: boolean;
  claimTxHash?: string;
  connecting?: boolean;
  currentChainId?: typeof base.id | typeof mainnet.id;
  iouVultBalance?: bigint;
  isPollingAttestBurn?: boolean;
  isWalletRegistered?: boolean;
  needsApproval?: boolean;
  selectedBurn?: {
    amount: string;
    baseEventId: string;
    baseTxId: string;
  };
  step?: number;
  tokenAllowance?: bigint;
  unclaimedBurns?: Array<{
    amount: string;
    baseEventId: string;
    baseTxId: string;
    blockNumber: number;
    recipient: string;
  }>;
  useMaxAmount?: boolean;
  vultisigConnected?: boolean;
  vultisigWallet?: VultisigWalletProps & { account: string };
};

export const ClaimPage = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({});
  const {
    approveLoading = false,
    attestData = DEFAULT_ATTEST_DATA,
    burnAmount,
    burnLoading = false,
    burnTxHash,
    claimLoading = false,
    claimTxHash,
    connecting,
    currentChainId = base.id,
    iouVultBalance,
    isPollingAttestBurn = false,
    isWalletRegistered = false,
    needsApproval,
    selectedBurn,
    step = 0,
    unclaimedBurns,
    useMaxAmount = false,
    vultisigConnected,
    vultisigWallet = DEFAULT_VULTISIG_WALLET,
  } = state;
  const { message, setCurrentPage, tokens } = useCore();
  const { address = "", isConnected, chainId, connector } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const isDesktop = useMediaQuery({ query: "(min-width: 1200px)" });
  const colors = useTheme();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);
  const unclaimedBurnsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMetaMask = connector?.name === "MetaMask";

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

  const checkTokenAllowance = useCallback(async () => {
    if (
      !address ||
      !burnAmount ||
      burnAmount <= 0 ||
      !attestData.domain.verifyingContract ||
      chainId !== base.id
    )
      return;

    try {
      const allowance = await readContract(wagmiConfig, {
        address: baseContractAddress.iouVult as `0x${string}`,
        abi: IOUVultAbi,
        functionName: "allowance",
        args: [address, attestData.domain.verifyingContract as `0x${string}`],
      });

      const allowanceAmount = Number(formatEther(allowance as bigint));
      const needsApprovalCheck = allowanceAmount < burnAmount - 0.000001;

      setState((prev) => ({
        ...prev,
        needsApproval: needsApprovalCheck,
        tokenAllowance: allowance as bigint,
      }));
    } catch {
      message.error("Failed to check token allowance");
    }
  }, [address, attestData.domain.verifyingContract, burnAmount, chainId]);

  const getIOUVultBalance = useCallback(async () => {
    if (!address || !chainId || chainId !== base.id) return;

    try {
      const { value } = await getBalance(wagmiConfig, {
        address,
        token: baseContractAddress.iouVult,
      });

      if (value !== undefined && value !== null) {
        setState((prev) => ({
          ...prev,
          iouVultBalance: value,
        }));
      }
    } catch {
      message.error("Failed to get IOU vault balance");
    }
  }, [address, chainId]);

  const getUnclaimedBurns = useCallback(async () => {
    if (!address) return;

    try {
      const { data, success } = await api.getBurns(address);

      if (success && data) {
        const unclaimedBurnsList = data.filter(
          (burn: { claimed: boolean }) => !burn.claimed,
        );

        setState((prev) => ({
          ...prev,
          unclaimedBurns: unclaimedBurnsList.map(
            (burn: {
              baseTxId: string;
              baseEventId: string;
              amount: string;
              recipient: string;
              blockNumber: number;
            }) => ({
              amount: burn.amount,
              baseEventId: burn.baseEventId,
              baseTxId: burn.baseTxId,
              blockNumber: burn.blockNumber,
              recipient: burn.recipient,
            }),
          ),
        }));
      } else {
        setState((prev) => ({ ...prev, unclaimedBurns: [] }));
      }
    } catch {
      message.error("Failed to get unclaimed burns");

      setState((prev) => ({ ...prev, unclaimedBurns: [] }));
    }
  }, [address]);

  const handleApprove = async () => {
    if (!burnAmount || burnAmount <= 0 || !attestData.domain.verifyingContract)
      return;

    setState((prev) => ({
      ...prev,
      approveLoading: true,
      currentChainId: base.id,
    }));

    try {
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

      const { status } = await waitForTransactionReceipt(wagmiConfig, {
        hash: approveHash,
      });

      if (status === "success") {
        let retries = 3;
        let allowanceUpdated = false;

        message.success("Tokens approved successfully");

        while (retries > 0 && !allowanceUpdated) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await checkTokenAllowance();

          try {
            const updatedAllowance = await readContract(wagmiConfig, {
              abi: IOUVultAbi,
              address: baseContractAddress.iouVult as `0x${string}`,
              args: [
                address,
                attestData.domain.verifyingContract as `0x${string}`,
              ],
              functionName: "allowance",
            });

            const updatedAllowanceAmount = Number(
              formatEther(updatedAllowance as bigint),
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
      message.error("Failed to approve tokens");

      console.error("Approve error:", error);
    } finally {
      setState((prev) => ({ ...prev, approveLoading: false }));
    }
  };

  const handleBurnAmount: InputNumberProps["onChange"] = (value) => {
    setState((prev) => ({
      ...prev,
      burnAmount: typeof value === "number" ? value : undefined,
      useMaxAmount: false,
    }));
  };

  const handleBurnSubmit = async () => {
    if (!burnAmount || burnAmount <= 0) return;

    if (needsApproval) {
      message.error("Please approve tokens first");
      return;
    }

    setState((prev) => ({
      ...prev,
      burnLoading: true,
      burnTxHash: undefined,
      currentChainId: base.id,
    }));

    try {
      const mergeHash = await writeContract(wagmiConfig, {
        abi: BaseMergeAbi,
        address: attestData.domain.verifyingContract as `0x${string}`,
        args: [
          useMaxAmount ? iouVultBalance : parseEther(String(burnAmount)),
          vultisigWallet.account,
          attestData.signature,
        ],
        functionName: "merge",
      });

      const { logs, status } = await waitForTransactionReceipt(wagmiConfig, {
        hash: mergeHash,
      });

      if (status === "success") {
        message.success("Tokens burned successfully");

        setState((prev) => ({ ...prev, burnTxHash: mergeHash }));

        setClaimTransaction(address, {
          amount: burnAmount,
          date: Date.now(),
          hash: mergeHash,
          status: "success",
          isClaimed: false,
          eventId: logs.length - 1,
        });
        getIOUVultBalance();
        loadClaimTransaction();

        await new Promise((resolve) => setTimeout(resolve, 2000));
        await checkTokenAllowance();
      } else {
        message.error("Failed to burn tokens");
      }
    } catch {
      message.error("Failed to burn tokens");
    } finally {
      setState((prev) => ({ ...prev, burnLoading: false }));
    }
  };

  const handleClaimBurnSelect = useCallback(
    (baseTxId: string) => {
      const selected = unclaimedBurns?.find(
        (burn) => burn.baseTxId === baseTxId,
      );

      if (!selected) return;

      setState((prev) => ({
        ...prev,
        claimAmount: Number(formatEther(BigInt(selected.amount))),
        selectedBurn: {
          amount: selected.amount,
          baseEventId: selected.baseEventId,
          baseTxId: selected.baseTxId,
        },
      }));
    },
    [unclaimedBurns],
  );

  const handleClaimSubmit = async () => {
    if (!selectedBurn) {
      message.error("Please select a burn transaction to claim");
      return;
    }

    setState((prev) => ({
      ...prev,
      claimLoading: true,
      claimTxHash: undefined,
      currentChainId: mainnet.id,
    }));

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
    pollingStartTimeRef.current = Date.now();

    setState((prev) => ({ ...prev, isPollingAttestBurn: true }));

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

        setState((prev) => ({
          ...prev,
          claimLoading: false,
          isPollingAttestBurn: false,
        }));

        return false;
      }

      try {
        let eventId: number;

        try {
          const receipt = await getTransactionReceipt(wagmiConfig, {
            hash: selectedBurn.baseTxId as `0x${string}`,
            chainId: base.id,
          });

          eventId = receipt.logs.length - 1;

          let foundEventId: number | undefined;

          for (let i = 0; i < receipt.logs.length; i++) {
            const log = receipt.logs[i];

            if (
              log.topics.some(
                (topic) =>
                  topic.toLowerCase() ===
                  selectedBurn.baseEventId.toLowerCase(),
              )
            ) {
              foundEventId = i;
              break;
            }
          }

          if (foundEventId === undefined) {
            const mergeContractAddress =
              attestData.domain.verifyingContract.toLowerCase();

            const relevantLogs = receipt.logs.filter(
              (log) => log.address.toLowerCase() === mergeContractAddress,
            );

            if (relevantLogs.length > 0) {
              const lastRelevantLog = relevantLogs[relevantLogs.length - 1];

              foundEventId = receipt.logs.indexOf(lastRelevantLog);
            } else {
              foundEventId = receipt.logs.length - 1;
            }
          }

          eventId = foundEventId;
        } catch (receiptError) {
          message.error(
            "Failed to fetch transaction receipt. Please try again.",
          );

          console.error("Error fetching transaction receipt:", receiptError);

          setState((prev) => ({
            ...prev,
            claimLoading: false,
            isPollingAttestBurn: false,
          }));

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          pollingStartTimeRef.current = null;

          return false;
        }

        const attestBurnResult = await api.attestBurn({
          txId: selectedBurn.baseTxId,
          eventId: eventId,
        });

        if (attestBurnResult.success) {
          try {
            const attestData = attestBurnResult.data;

            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            pollingStartTimeRef.current = null;

            setState((prev) => ({
              ...prev,
              claimAmount: Number(formatEther(BigInt(attestData.amount))),
              isPollingAttestBurn: false,
            }));

            if (chainId !== mainnet.id) {
              if (isMetaMask) {
                await connector.switchChain?.({ chainId: mainnet.id });
              } else {
                try {
                  await switchChainAsync({ chainId: mainnet.id });
                } catch (error) {
                  message.error(
                    "Failed to switch chain to Mainnet. Please switch manually from your wallet.",
                  );

                  console.error("Error switching chain:", error);
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

            const { status } = await waitForTransactionReceipt(wagmiConfig, {
              hash: claimHash,
            });

            if (status === "success") {
              message.success("Tokens claimed successfully");

              setState((prev) => ({
                ...prev,
                claimLoading: false,
                claimTxHash: claimHash,
                selectedBurn: undefined,
              }));

              getUnclaimedBurns();
            } else {
              message.error("Failed to claim tokens");

              setState((prev) => ({ ...prev, claimLoading: false }));
            }
          } catch (error) {
            if (pollingIntervalRef.current)
              clearInterval(pollingIntervalRef.current);

            pollingIntervalRef.current = null;
            pollingStartTimeRef.current = null;

            setState((prev) => ({ ...prev, claimLoading: false }));

            message.error("Failed to claim tokens");

            console.error("Error claiming tokens:", error);

            return false;
          }
          return false;
        }
        return true;
      } catch {
        return true;
      }
    };

    const shouldContinuePolling = await pollAttestBurn();

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

  const handleConnect = async () => {
    if (connecting) return;

    setState((prev) => ({
      ...prev,
      attestData: DEFAULT_ATTEST_DATA,
      connecting: true,
      isWalletRegistered: false,
      vultisigConnected: false,
      vultisigWallet: DEFAULT_VULTISIG_WALLET,
    }));

    try {
      const vultisigWallet = await vultisigConnect();

      message.success("Vultisig connected successfully");

      setState((prev) => ({
        ...prev,
        connecting: false,
        vultisigConnected: true,
        vultisigWallet,
      }));
    } catch {
      message.error("Failed to connect Vultisig");

      setState((prev) => ({ ...prev, connecting: false }));
    }
  };

  const handleContinue = () => {
    if (disabled) return;

    setState((prev) => ({ ...prev, step: step + 1 }));
  };

  const handleMaxAmount = () => {
    if (iouVultBalance === undefined || iouVultBalance === null) return;

    setState((prev) => ({
      ...prev,
      burnAmount: Number(formatEther(iouVultBalance)),
      useMaxAmount: true,
    }));
  };

  const handleSwitchChain = useCallback(async () => {
    if (!isConnected) return;

    if (chainId && chainId !== currentChainId) {
      if (isMetaMask) {
        if (!window.ethereum) {
          message.error(
            "MetaMask is not available. Please install or enable the MetaMask extension.",
          );
          return;
        }

        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${currentChainId.toString(16)}` }],
          });
        } catch {
          message.error(
            `Failed to switch chain. Please switch to ${
              currentChainId === base.id ? "Base" : "Mainnet"
            } network from your wallet manually and try again.`,
          );
        }

        return;
      }

      try {
        await switchChainAsync({ chainId: currentChainId });
      } catch {
        message.error(
          `Failed to switch chain. Please switch to ${
            currentChainId === base.id ? "Base" : "Mainnet"
          } network from your wallet manually and try again.`,
        );
      }
    }

    getIOUVultBalance();
  }, [
    isConnected,
    chainId,
    message,
    getIOUVultBalance,
    currentChainId,
    connector,
  ]);

  const loadClaimTransaction = useCallback(() => {
    if (!address) return;

    const claimTransactions = getClaimTransactions(address);
    const unclaimedTransaction = claimTransactions
      .filter((tx) => !tx.isClaimed)
      .sort((a, b) => b.date - a.date)[0];

    setState((prev) => ({
      ...prev,
      claimAmount: unclaimedTransaction?.amount,
    }));
  }, [address]);

  const registerVultisigWallet = useCallback(async () => {
    if (!vultisigWallet.account || !vultisigWallet.uid || isWalletRegistered)
      return;

    try {
      setState((prev) => ({ ...prev, connecting: true }));

      const { message: challengeMessage } = await api.challengeMessage(
        vultisigWallet.uid,
      );
      const hexMessage = toHex(challengeMessage);
      const signature = await vultisigPersonalSign(
        hexMessage,
        vultisigWallet.account,
      );

      await api.registerVultisigWallet(
        vultisigWallet,
        challengeMessage,
        signature,
      );

      const { data, success } = await api.attestAddress(vultisigWallet.account);

      if (success) {
        setState((prev) => ({
          ...prev,
          attestData: data,
          connecting: false,
          isWalletRegistered: true,
        }));
      } else {
        message.error("Failed to verify vultisig wallet");

        setState((prev) => ({
          ...prev,
          connecting: false,
          isWalletRegistered: false,
          attestData: DEFAULT_ATTEST_DATA,
        }));
      }
    } catch {
      message.error("Failed to register Vultisig wallet");

      setState((prev) => ({
        ...prev,
        connecting: false,
        isWalletRegistered: false,
        vultisigConnected: false,
      }));
    }
  }, [vultisigWallet, isWalletRegistered]);

  const checkAndRegisterVultisigWallet = useCallback(async () => {
    if (vultisigWallet.account) {
      setState((prev) => ({ ...prev, connecting: true }));

      try {
        const status = await api.applyStatus(vultisigWallet.publicKeyEcdsa);

        if (status) {
          const attestResult = await api.attestAddress(vultisigWallet.account);

          if (attestResult.success) {
            setState((prev) => ({
              ...prev,
              attestData: attestResult.data,
              connecting: false,
              isWalletRegistered: status,
            }));
          } else {
            message.error("Failed to verify vultisig wallet");

            setState((prev) => ({
              ...prev,
              connecting: false,
              isWalletRegistered: false,
            }));
          }
        } else {
          registerVultisigWallet();
        }
      } catch {
        message.error("Failed to check vultisig wallet status");

        setState((prev) => ({ ...prev, connecting: false }));
      }
    }
  }, [vultisigWallet, registerVultisigWallet]);

  useEffect(() => {
    checkAndRegisterVultisigWallet();
  }, [checkAndRegisterVultisigWallet]);

  useEffect(() => {
    checkTokenAllowance();
  }, [checkTokenAllowance]);

  useEffect(() => {
    if (isConnected) return;

    setState((prev) => ({
      ...prev,
      attestData: DEFAULT_ATTEST_DATA,
      isWalletRegistered: false,
      step: 0,
      vultisigConnected: false,
      vultisigWallet: DEFAULT_VULTISIG_WALLET,
    }));
  }, [isConnected]);

  useEffect(() => {
    loadClaimTransaction();
  }, [loadClaimTransaction]);

  useEffect(() => {
    handleSwitchChain();
  }, [handleSwitchChain]);

  useEffect(() => {
    getUnclaimedBurns();

    if (address) {
      if (unclaimedBurnsIntervalRef.current) {
        clearInterval(unclaimedBurnsIntervalRef.current);
      }

      unclaimedBurnsIntervalRef.current = setInterval(() => {
        getUnclaimedBurns();
      }, 12000);
    }

    return () => {
      if (unclaimedBurnsIntervalRef.current) {
        clearInterval(unclaimedBurnsIntervalRef.current);
        unclaimedBurnsIntervalRef.current = null;
      }
    };
  }, [getUnclaimedBurns, address]);

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

  useEffect(() => setCurrentPage("claim"), []);

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
