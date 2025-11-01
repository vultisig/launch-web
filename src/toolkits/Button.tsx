import { ButtonHTMLAttributes, FC, HTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import { Spin } from "@/toolkits/Spin";
import { match } from "@/utils/functions";

type Kind = "danger" | "info" | "primary" | "secondary" | "success" | "warning";

type ButtonProps = HTMLAttributes<HTMLElement> & {
  disabled?: boolean;
  ghost?: boolean;
  href?: string;
  icon?: ReactNode;
  kind?: Kind;
  loading?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

const StyledButton = styled.div<{
  $disabled: boolean;
  $ghost: boolean;
  $kind: Kind;
}>`
  border: none;
  display: flex;
  align-items: center;
  border-radius: 44px;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  font-family: inherit;
  font-weight: 500;
  gap: 8px;
  justify-content: center;
  transition: all 0.2s;

  ${({ $ghost }) => {
    return (
      !$ghost &&
      css`
        height: 44px;
        padding: 0 24px;
      `
    );
  }}

  ${({ $disabled, $ghost, $kind, theme }) => {
    return $disabled
      ? css`
          background-color: ${$ghost
            ? "transparent"
            : theme.buttonDisabled.toHex()};
          color: ${theme.buttonDisabledText.toHex()};
        `
      : $ghost
      ? css`
          background-color: transparent;
          color: ${theme.textPrimary.toHex()};

          &:hover {
            ${match($kind, {
              danger: () => css`
                color: ${theme.error.toHex()};
              `,
              info: () => css`
                color: ${theme.info.toHex()};
              `,
              primary: () => css`
                color: ${theme.buttonPrimary.toHex()};
              `,
              secondary: () => css`
                color: ${theme.buttonSecondary.toHex()};
              `,
              success: () => css`
                color: ${theme.success.toHex()};
              `,
              warning: () => css`
                color: ${theme.warning.toHex()};
              `,
            })}
          }
        `
      : css`
          ${match($kind, {
            danger: () => css`
              background-color: ${theme.error.toHex()};
              color: ${theme.buttonTextLight.toHex()};
            `,
            info: () => css`
              background-color: ${theme.info.toHex()};
              color: ${theme.buttonTextLight.toHex()};
            `,
            primary: () => css`
              background-color: ${theme.buttonPrimary.toHex()};
              color: ${theme.buttonTextLight.toHex()};
            `,
            secondary: () => css`
              background-color: ${theme.buttonSecondary.toHex()};
              color: ${theme.textPrimary.toHex()};
            `,
            success: () => css`
              background-color: ${theme.success.toHex()};
              color: ${theme.buttonTextLight.toHex()};
            `,
            warning: () => css`
              background-color: ${theme.warning.toHex()};
              color: ${theme.buttonTextLight.toHex()};
            `,
          })}

          &:hover {
            ${match($kind, {
              danger: () => css`
                background-color: ${theme.error.lighten(5).toHex()};
              `,
              info: () => css`
                background-color: ${theme.info.lighten(5).toHex()};
              `,
              primary: () => css`
                background-color: ${({ theme }) =>
                  theme.buttonPrimaryHover.toHex()};
              `,
              secondary: () => css`
                background-color: ${({ theme }) =>
                  theme.buttonSecondaryHover.toHex()};
              `,
              success: () => css`
                background-color: ${theme.success.lighten(5).toHex()};
              `,
              warning: () => css`
                background-color: ${theme.warning.lighten(5).toHex()};
              `,
            })}
          }
        `;
  }}
`;

export const Button: FC<ButtonProps> = (props) => {
  const {
    children,
    disabled = false,
    ghost = false,
    href,
    icon,
    kind = "primary",
    loading = false,
    type = "button",
    onClick,
    ...rest
  } = props;

  return (
    <StyledButton
      onClick={(e) => !disabled && onClick && onClick(e)}
      $disabled={disabled}
      $ghost={ghost}
      $kind={kind}
      {...rest}
      {...(disabled
        ? { as: "span" }
        : href
        ? { as: Link, state: true, to: href }
        : { as: "button", type })}
    >
      {loading ? <Spin size="small" /> : icon}
      {children}
    </StyledButton>
  );
};
