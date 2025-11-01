import { InputNumber, InputNumberProps, Layout, Tooltip } from "antd";
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

type StateProps = {
  burnAmount?: number;
  claimAmount?: number;
  connecting?: boolean;
  vultisigWallet?: VultisigWalletProps & { account: string };
  isWalletRegistered?: boolean;
  vultisigConnected?: boolean;
  iouVultBalance?: bigint;
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
};

export const ClaimPage = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({});
  const {
    burnAmount,
    claimAmount,
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
  } = state;
  const [step, setStep] = useState(0);
  const { message, setCurrentPage, tokens } = useCore();
  const { address = "", isConnected, chainId, connector } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const isDesktop = useMediaQuery({ query: "(min-width: 1200px)" });
  const colors = useTheme();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);

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
    }));
  };

  const handleBurnSubmit = async () => {
    if (!burnAmount || burnAmount <= 0) return;
    setState((prevState) => ({
      ...prevState,
      burnLoading: true,
      currentChainId: base.id,
    }));
    console.log("burnAmount: ", burnAmount);
    try {
      //check allowance of the token from the address to the attestData.domain.verifyingContract
      const allowance = await readContract(wagmiConfig, {
        address: baseContractAddress.iouVult as `0x${string}`,
        abi: IOUVultAbi,
        functionName: "allowance",
        args: [address, attestData.domain.verifyingContract as `0x${string}`],
      });
      console.log("allowance: ", allowance);

      if (Number(formatEther(allowance as bigint)) < burnAmount) {
        const approveHash = await writeContract(wagmiConfig, {
          address: baseContractAddress.iouVult as `0x${string}`,
          abi: IOUVultAbi,
          functionName: "approve",
          args: [
            attestData.domain.verifyingContract as `0x${string}`,
            parseEther(String(burnAmount)),
          ],
        });
        const approveReceipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: approveHash,
        });
        console.log("approveReceipt: ", approveReceipt);
        const approveSuccess =
          approveReceipt.status === "success" ? true : false;
        if (approveSuccess) {
          message.success("Tokens approved successfully");
          // Wait 5 seconds after successful approval before continuing
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          message.error("Failed to approve tokens");
          setState((prevState) => ({ ...prevState, burnLoading: false }));
          return;
        }
      }
      console.log("attest DatA:", attestData);

      console.log("calling merge");
      const mergeHash = await writeContract(wagmiConfig, {
        address: attestData.domain.verifyingContract as `0x${string}`,
        abi: BaseMergeAbi,
        functionName: "merge",
        args: [
          parseEther(String(burnAmount)),
          vultisigWallet.account,
          attestData.signature,
        ],
      });

      const mergeReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: mergeHash,
      });

      console.log("mergeReceipt:", mergeReceipt);
      const success = mergeReceipt.status === "success" ? true : false;
      if (success) {
        message.success("Tokens burned successfully");
        setClaimTransaction(address, {
          amount: burnAmount,
          date: Date.now(),
          hash: mergeHash,
          status: "success",
          isClaimed: false,
          eventId: mergeReceipt.logs.length - 1,
        });
        getIOUVultBalance();
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

  const handleClaimAmount: InputNumberProps["onChange"] = (value) => {
    setState((prevState) => ({
      ...prevState,
      claimAmount: typeof value === "number" ? value : undefined,
    }));
  };

  const handleClaimSubmit = async () => {
    if (!claimAmount || claimAmount <= 0) return;
    setState((prevState) => ({
      ...prevState,
      currentChainId: mainnet.id,
      claimLoading: true,
    }));
    const claimTransactions = getClaimTransactions(address);
    const claimTransaction = claimTransactions
      .filter((tx) => !tx.isClaimed)
      .sort((a, b) => b.date - a.date)[0];
    if (!claimTransaction) {
      message.error("No claim transaction found");
      setState((prevState) => ({ ...prevState, claimLoading: false }));
      return;
    }

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    pollingStartTimeRef.current = Date.now();
    const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

    const pollAttestBurn = async (): Promise<void> => {
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
        setState((prevState) => ({ ...prevState, claimLoading: false }));
        return;
      }

      try {
        const attestBurnResult = await api.attestBurn({
          txId: claimTransaction.hash,
          eventId: claimTransaction.eventId,
        });

        if (attestBurnResult.success) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          pollingStartTimeRef.current = null;

          console.log("attestBurnResult: ", attestBurnResult);
          const attestData = attestBurnResult.data;
          setState((prevState) => ({
            ...prevState,
            claimAmount: Number(formatEther(BigInt(attestData.amount))),
          }));

          // MetaMask doesn't support programmatic chain switching
          const isMetaMask = connector?.name === "MetaMask";

          if (isMetaMask) {
            message.warning(
              "Please switch to Mainnet network manually in your MetaMask wallet to continue claiming."
            );
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

          const claimHash = await writeContract(wagmiConfig, {
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
          console.log("claimHash: ", claimHash);
          const claimReceipt = await waitForTransactionReceipt(wagmiConfig, {
            hash: claimHash,
          });
          console.log("claimReceipt: ", claimReceipt);
          const success = claimReceipt.status === "success" ? true : false;
          if (success) {
            setClaimTransaction(address, {
              ...claimTransaction,
              isClaimed: true,
            });
            message.success("Tokens claimed successfully");
            setState((prevState) => ({ ...prevState, claimLoading: false }));
          } else {
            message.error("Failed to claim tokens");
            setState((prevState) => ({ ...prevState, claimLoading: false }));
          }
        }
      } catch (error) {
        console.error("Error polling attestBurn:", error);
      }
    };

    await pollAttestBurn();

    pollingIntervalRef.current = setInterval(pollAttestBurn, 20000);
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
          setState((prevState) => ({
            ...prevState,
            iouVultBalance: value,
          }));
        })
        .catch(() => {
          message.error("Failed to get IOU vault balance");
        });
    }
  }, [address, chainId, message, isConnected]);

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

  useEffect(() => setCurrentPage("claim"), []);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
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
                  Connect your Vultisig vault to receive the claimed $VULT
                  tokens.
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
                    onClick={handleBurnSubmit}
                    disabled={
                      iouVultBalance === 0n ||
                      iouVultBalance === undefined ||
                      burnLoading
                    }
                    loading={burnLoading}
                  >
                    Burn
                  </SubmitButton>
                </HStack>
                <HStack>
                  <Tooltip title={t("clickToUseFullAmount")}>
                    <HStack
                      as="span"
                      onClick={() =>
                        handleBurnAmount(
                          Number(formatEther(iouVultBalance ?? 0n))
                        )
                      }
                      $style={{
                        color: colors.textTertiary.toHex(),
                        cursor: "pointer",
                        gap: "4px",
                      }}
                      $hover={{ color: colors.textSecondary.toHex() }}
                    >
                      <Stack as="span">{`${t("available")}:`}</Stack>
                      <Stack as="span" $style={{ fontWeight: "600" }}>
                        {toAmountFormat(
                          Number(formatEther(iouVultBalance ?? 0n))
                        )}
                      </Stack>
                    </HStack>
                  </Tooltip>
                </HStack>
              </VStack>
              <VStack $style={{ gap: "8px" }}>
                <Stack as="span" $style={{ fontWeight: "500" }}>
                  VULT to Claim
                </Stack>
                <HStack $style={{ gap: "12px" }}>
                  <AmountInput
                    controls={false}
                    formatter={(value = "") => toNumberFormat(value)}
                    min={0}
                    onChange={handleClaimAmount}
                    placeholder="0"
                    suffix={tokens.VULT.ticker}
                    value={claimAmount}
                  />
                  <SubmitButton
                    onClick={handleClaimSubmit}
                    disabled={claimLoading}
                    loading={claimLoading}
                  >
                    Claim
                  </SubmitButton>
                </HStack>
              </VStack>
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

const SubmitButton = styled(Button)`
  border-radius: 12px;
  height: 56px;
  width: 112px;
`;
