import { Spin as DefaultSpin, SpinProps } from "antd";
import { FC } from "react";
import styled, { css } from "styled-components";

const StyledSpin = styled(DefaultSpin)<{ $centered: boolean }>`
  color: currentColor;

  ${({ $centered }) =>
    $centered &&
    css`
      align-items: center;
      display: flex;
      flex-grow: 1;
      justify-content: center;
    `}

  .ant-spin-dot-holder {
    color: currentColor;
  }
`;

export const Spin: FC<SpinProps & { centered?: boolean }> = ({
  centered = false,
  ...rest
}) => <StyledSpin $centered={centered} {...rest} />;
