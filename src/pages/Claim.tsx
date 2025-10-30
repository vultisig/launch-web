import { InputNumber, InputNumberProps, Layout, Tooltip } from "antd";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import styled, { useTheme } from "styled-components";
import { useAccount } from "wagmi";
import { switchChain, getBalance } from "wagmi/actions";
import { useCore } from "@/hooks/useCore";
import { CheckIcon } from "@/icons/CheckIcon";
import { Button } from "@/toolkits/Button";
import { Divider } from "@/toolkits/Divider";
import { HStack, Stack, VStack } from "@/toolkits/Stack";
import { baseContractAddress, modalHash } from "@/utils/constants";
import { vultisigConnect } from "@/utils/extension";
import { toAmountFormat, toNumberFormat } from "@/utils/functions";
import { wagmiConfig } from "@/utils/wagmi";
import { base } from "viem/chains";

const { Content } = Layout;

type StateProps = {
  burnAmount?: number;
  claimAmount?: number;
  connecting?: boolean;
  vultisigAddress?: string;
  vultisigConnected?: boolean;
  iouVultBalance?: bigint;
};

export const ClaimPage = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<StateProps>({});
  const {
    burnAmount,
    claimAmount,
    connecting,
    vultisigAddress = "",
    vultisigConnected,
    iouVultBalance,
  } = state;
  const [step, setStep] = useState(0);
  const { message, setCurrentPage, tokens } = useCore();
  const { address = "", isConnected, chainId } = useAccount();

  const isDesktop = useMediaQuery({ query: "(min-width: 1200px)" });
  const colors = useTheme();

  const disabled = useMemo(() => {
    switch (step) {
      case 0:
        return !isConnected;
      case 1:
        return !vultisigConnected;
      default:
        return false;
    }
  }, [isConnected, step, vultisigConnected]);

  const handleBurnAmount: InputNumberProps["onChange"] = (value) => {
    setState((prevState) => ({
      ...prevState,
      burnAmount: typeof value === "number" ? value : undefined,
    }));
  };

  const handleBurnSubmit = () => {
    if (!burnAmount || burnAmount <= 0) return;

    console.log("Burning tokens...", burnAmount);
  };

  const handleClaimAmount: InputNumberProps["onChange"] = (value) => {
    setState((prevState) => ({
      ...prevState,
      claimAmount: typeof value === "number" ? value : undefined,
    }));
  };

  const handleClaimSubmit = () => {
    if (!claimAmount || claimAmount <= 0) return;

    console.log("Claiming tokens...", claimAmount);
  };

  const handleConnect = () => {
    if (connecting) return;

    setState((prevState) => ({ ...prevState, connecting: true }));

    vultisigConnect()
      .then((vultisigAddress) => {
        message.success("Vultisig connected successfully");

        setState((prevState) => ({
          ...prevState,
          connecting: false,
          vultisigAddress,
          vultisigConnected: true,
        }));
      })
      .catch(() => {
        message.error("Failed to connect Vultisig");

        setState((prevState) => ({ ...prevState, connecting: false }));
      });
  };

  const handleContinue = () => {
    if (disabled) return;

    setStep(step + 1);
  };

  useEffect(() => {
    if (!isConnected) setStep(0);
  }, [isConnected]);

  const getIOUVultBalance = useCallback(() => {
    if (address && chainId && chainId === base.id) {
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
  }, [address, chainId, message]);

  const handleSwitchChain = useCallback(async () => {
    if (isConnected) {
      if (chainId && chainId !== base.id) {
        try {
          await switchChain(wagmiConfig, { chainId: base.id });
        } catch {
          message.error(
            "Failed to switch chain. Please switch to BASE chain from your wallet manually and try again."
          );
        }
      }
      getIOUVultBalance();
    }
  }, [isConnected, chainId, message, getIOUVultBalance]);

  useEffect(() => {
    handleSwitchChain();
  }, [handleSwitchChain]);

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
                    {vultisigAddress}
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
                <Stack as="span">{vultisigAddress}</Stack>
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
                  <SubmitButton onClick={handleBurnSubmit}>Burn</SubmitButton>
                </HStack>
                <HStack>
                  <Tooltip title={t("clickToUseFullAmount")}>
                    <HStack
                      as="span"
                      onClick={() => handleBurnAmount(Number(iouVultBalance))}
                      $style={{
                        color: colors.textTertiary.toHex(),
                        cursor: "pointer",
                        gap: "4px",
                      }}
                      $hover={{ color: colors.textSecondary.toHex() }}
                    >
                      <Stack as="span">{`${t("available")}:`}</Stack>
                      <Stack as="span" $style={{ fontWeight: "600" }}>
                        {toAmountFormat(Number(iouVultBalance))}
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
                  <SubmitButton onClick={handleClaimSubmit}>Claim</SubmitButton>
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
