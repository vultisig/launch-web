import { FC } from "react";
import { useTheme } from "styled-components";

import { Stack } from "@/toolkits/Stack";

type DividerProps = {
  light?: boolean;
  vertical?: boolean;
};

export const Divider: FC<DividerProps> = ({ light, vertical }) => {
  const colors = useTheme();

  return (
    <Stack
      as="span"
      $style={{
        backgroundColor: light
          ? colors.borderLight.toHex()
          : colors.borderNormal.toHex(),
        ...(vertical ? { width: "1px" } : { height: "1px" }),
      }}
    />
  );
};
