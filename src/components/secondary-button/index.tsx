import { FC } from "react";
import { Button, ButtonProps, ConfigProvider } from "antd";

import { buttonSecondary, buttonSecondaryHover } from "colors";

const Component: FC<ButtonProps> = ({
  children,
  shape = "round",
  type = "primary",
  ...props
}) => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: buttonSecondary,
        colorPrimaryHover: buttonSecondaryHover,
      },
    }}
  >
    <Button shape={shape} type={type} {...props}>
      {children}
    </Button>
  </ConfigProvider>
);

export default Component;
