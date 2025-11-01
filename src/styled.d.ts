import "styled-components";

import { ColorToken, SharedColors } from "@/utils/styled";

declare module "styled-components" {
  export interface DefaultTheme extends SharedColors {
    bgAlert: ColorToken;
    bgError: ColorToken;
    bgNeutral: ColorToken;
    bgPrimary: ColorToken;
    bgSecondary: ColorToken;
    bgSuccess: ColorToken;
    bgTertiary: ColorToken;
    borderLight: ColorToken;
    borderNormal: ColorToken;
    buttonDisabled: ColorToken;
    buttonDisabledText: ColorToken;
    buttonPrimary: ColorToken;
    buttonPrimaryHover: ColorToken;
    buttonSecondary: ColorToken;
    buttonSecondaryHover: ColorToken;
    buttonTextDark: ColorToken;
    buttonTextLight: ColorToken;
    textPrimary: ColorToken;
    textSecondary: ColorToken;
    textTertiary: ColorToken;
  }
}
