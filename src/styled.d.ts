import "styled-components";

import { ColorToken, SharedColors } from "@/utils/styled";

declare module "styled-components" {
  export interface DefaultTheme extends SharedColors {
    bgPrimary: ColorToken;
    bgSecondary: ColorToken;
    bgTertiary: ColorToken;
    borderLight: ColorToken;
    borderNormal: ColorToken;
    buttonDisabled: ColorToken;
    buttonTextDisabled: ColorToken;
    textPrimary: ColorToken;
    textSecondary: ColorToken;
    textTertiary: ColorToken;
  }
}
