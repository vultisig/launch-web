import styled, { css } from "styled-components";

import { cssPropertiesToString } from "@/utils/functions";
import { CSSProperties } from "@/utils/types";

const defaultPropertiesToString = (props: DefaultProps) => {
  const { $after, $before, $hover, $style } = props;

  return css`
    ${$style && cssPropertiesToString($style)}
    ${$after &&
    css`
      &::after {
        ${cssPropertiesToString({ ...$after, content: $after.content || `''` })}
      }
    `}
  ${$before &&
    css`
      &::before {
        ${cssPropertiesToString({
          ...$before,
          content: $before.content || `''`,
        })}
      }
    `}
  ${$hover &&
    css`
      ${!$style?.transition &&
      css`
        transition: all 0.2s;
      `}
      &:hover {
        ${cssPropertiesToString($hover)}
      }
    `}
  `;
};

const stackPropertiesToString = (props: StackProps) => {
  const { $media } = props;

  return css`
    ${defaultPropertiesToString(props)}
    ${$media?.xl &&
    css`
      @media (min-width: 1200px) {
        ${defaultPropertiesToString($media.xl)}
      }
    `}
  `;
};

export const Stack = styled.div<StackProps>`
  ${stackPropertiesToString}
`;

export const HStack = styled.div<StackProps>`
  ${({ $style, ...props }) =>
    stackPropertiesToString({
      ...props,
      $style: { ...($style || {}), display: "flex", flexDirection: "row" },
    })}
`;

export const VStack = styled.div<StackProps>`
  ${({ $style, ...props }) =>
    stackPropertiesToString({
      ...props,
      $style: { ...($style || {}), display: "flex", flexDirection: "column" },
    })}
`;

export type StackProps = DefaultProps & { $media?: { xl?: DefaultProps } };

type DefaultProps = {
  $after?: CSSProperties;
  $before?: CSSProperties;
  $hover?: CSSProperties;
  $style?: CSSProperties;
};
