import { DefaultTheme } from "styled-components";

import { Theme } from "@/utils/theme";

export class ColorToken {
  constructor(
    private h: number,
    private s: number,
    private l: number,
    private a: number = 1
  ) {}

  private getRgb(): { r: number; g: number; b: number } {
    const { h, s, l } = this;
    const C = (1 - Math.abs((2 * l) / 100 - 1)) * (s / 100);
    const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l / 100 - C / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
      r = C;
      g = X;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = X;
      g = C;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = C;
      b = X;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = X;
      b = C;
    } else if (240 <= h && h < 300) {
      r = X;
      g = 0;
      b = C;
    } else if (300 <= h && h < 360) {
      r = C;
      g = 0;
      b = X;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  darken(amount: number): ColorToken {
    return new ColorToken(this.h, this.s, Math.max(0, this.l - amount));
  }

  lighten(amount: number): ColorToken {
    return new ColorToken(this.h, this.s, Math.min(100, this.l + amount));
  }

  toHex(): string {
    const { r, g, b } = this.getRgb();
    const hex = (value: number) => value.toString(16).padStart(2, "0");
    const a = Math.round(Math.max(0, Math.min(1, this.a)) * 255);

    return `#${hex(r)}${hex(g)}${hex(b)}${a < 255 ? hex(a) : ""}`;
  }

  toHSL(): string {
    return `hsl(${this.h}, ${this.s}%, ${this.l}%)`;
  }

  toHSLA(alpha: number = this.a): string {
    const clamped = Math.max(0, Math.min(1, alpha));
    return `hsla(${this.h}, ${this.s}%, ${this.l}%, ${clamped})`;
  }

  toRgba(alpha: number = this.a): string {
    const { r, g, b } = this.getRgb();

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

export type SharedColors = {
  accentOne: ColorToken;
  accentTwo: ColorToken;
  accentThree: ColorToken;
  accentFour: ColorToken;
  error: ColorToken;
  info: ColorToken;
  neutral50: ColorToken;
  neutral100: ColorToken;
  neutral200: ColorToken;
  neutral300: ColorToken;
  neutral400: ColorToken;
  neutral500: ColorToken;
  neutral600: ColorToken;
  neutral700: ColorToken;
  neutral800: ColorToken;
  neutral900: ColorToken;
  success: ColorToken;
  warning: ColorToken;
};

const sharedColors: SharedColors = {
  accentOne: new ColorToken(224, 95, 31), //hsla(224, 95%, 31%, 1)
  accentTwo: new ColorToken(224, 96, 40), //hsla(224, 96%, 40%, 1)
  accentThree: new ColorToken(224, 75, 50), //hsla(224, 75%, 50%, 1)
  accentFour: new ColorToken(224, 98, 64), //hsla(224, 98%, 64%, 1)
  error: new ColorToken(0, 100, 68), //hsla(0, 100%, 68%, 1)
  info: new ColorToken(212, 100, 68), //hsla(212, 100%, 68%, 1)
  neutral50: new ColorToken(0, 0, 100), //hsla(0, 0%, 100%, 1)
  neutral100: new ColorToken(214, 28, 95), //hsla(214, 28%, 95%, 1)
  neutral200: new ColorToken(216, 41, 85), //hsla(216, 41%, 85%, 1)
  neutral300: new ColorToken(208, 24, 67), //hsla(209, 24%, 67%, 1)
  neutral400: new ColorToken(209, 23, 61), //hsla(209, 23%, 61%, 1)
  neutral500: new ColorToken(205, 15, 55), //hsla(205, 15%, 55%, 1)
  neutral600: new ColorToken(211, 10, 43), //hsla(211, 10%, 43%, 1)
  neutral700: new ColorToken(225, 7, 27), //hsla(225, 7%, 24%, 1)
  neutral800: new ColorToken(210, 6, 6), //hsla(210, 6%, 6%, 1)
  neutral900: new ColorToken(0, 0, 0), //hsla(0, 0%, 0%, 1)
  success: new ColorToken(166, 83, 43), //hsla(166, 83%, 43%, 1)
  warning: new ColorToken(38, 100, 68), //hsla(38, 100%, 68%, 1)
};

export const themes: Record<Theme, DefaultTheme> = {
  dark: {
    ...sharedColors,
    bgAlert: new ColorToken(39, 40, 15), //hsla(39, 40%, 15%, 1)
    bgError: new ColorToken(0, 43, 12), //hsla(0, 43%, 12%, 1)
    bgNeutral: new ColorToken(216, 81, 13), //hsla(216, 81%, 13%, 1)
    bgPrimary: new ColorToken(217, 91, 9), //hsla(217, 91%, 9%, 1)
    bgSecondary: new ColorToken(216, 81, 13), //hsla(216, 81%, 13%, 1)
    bgSuccess: new ColorToken(202, 86, 11), //hsla(202, 86%, 11%, 1)
    bgTertiary: new ColorToken(216, 63, 18), //hsla(216, 63%, 18%, 1)
    borderLight: new ColorToken(216, 63, 18), //hsla(216, 63%, 18%, 1)
    borderNormal: new ColorToken(215, 62, 28), //hsla(215, 62%, 28%, 1)
    buttonDisabled: new ColorToken(221, 68, 14), //hsla(221, 68%, 14%, 1)
    buttonDisabledText: new ColorToken(216, 15, 52), //hsla(216, 15%, 52%, 1)
    buttonPrimary: new ColorToken(224, 75, 50), //hsla(224, 75%, 50%, 1)
    buttonPrimaryHover: new ColorToken(215, 75, 47), //hsla(215, 75%, 47%, 1)
    buttonSecondary: new ColorToken(216, 63, 18), //hsla(216, 63%, 18%, 1)
    buttonSecondaryHover: new ColorToken(216, 53, 24), //hsla(216, 53%, 24%, 1)
    buttonTextDark: new ColorToken(217, 91, 9), //hsla(217, 91%, 9%, 1)
    buttonTextLight: new ColorToken(220, 67, 96), //hsla(220, 67%, 96%, 1)
    textPrimary: new ColorToken(220, 67, 96), //hsla(220, 67%, 96%, 1)
    textSecondary: new ColorToken(215, 40, 85), //hsla(215, 40%, 85%, 1)
    textTertiary: new ColorToken(214, 21, 60), //hsla(214, 21%, 60%, 1)
  },
  light: {
    ...sharedColors,
    bgAlert: new ColorToken(37, 83, 86), //hsla(37, 83%, 86%, 1)
    bgError: new ColorToken(358, 83, 86), //hsla(358, 83%, 86%, 1)
    bgNeutral: new ColorToken(224, 69, 81), //hsla(224, 69%, 81%, 1)
    bgPrimary: new ColorToken(0, 0, 100), //hsla(0, 0%, 100%, 1)
    bgSecondary: new ColorToken(0, 0, 100), //hsla(0, 0%, 100%, 1)
    bgSuccess: new ColorToken(169, 81, 13), //hsla(169, 63%, 79%, 1)
    bgTertiary: new ColorToken(240, 20, 97), //hsla(240, 20%, 97%, 1)
    borderLight: new ColorToken(0, 0, 95), //hsla(0, 0%, 95%, 1)
    borderNormal: new ColorToken(0, 0, 90), //hsla(0, 0%, 90%, 1)
    buttonDisabled: new ColorToken(220, 11, 95), //hsla(220, 11%, 95%, 1)
    buttonDisabledText: new ColorToken(216, 6, 65), //hsla(216, 6%, 65%, 1)
    buttonPrimary: new ColorToken(216, 81, 13), //hsla(216, 81%, 13%, 1)
    buttonPrimaryHover: new ColorToken(215, 76, 20), //hsla(215, 76%, 20%, 1)
    buttonSecondary: new ColorToken(228, 43, 93), //hsla(228, 43%, 93%, 1)
    buttonSecondaryHover: new ColorToken(224, 65, 97), //hsla(224, 65%, 97%, 1)
    buttonTextDark: new ColorToken(217, 91, 9), //hsla(217, 91%, 9%, 1)
    buttonTextLight: new ColorToken(220, 67, 96), //hsla(220, 67%, 96%, 1)
    textPrimary: new ColorToken(217, 91, 9), //hsla(217, 91%, 9%, 1)
    textSecondary: new ColorToken(217, 55, 19), //hsla(217, 55%, 19%, 1)
    textTertiary: new ColorToken(215, 16, 52), //hsla(215, 16%, 52%, 1)
  },
} as const;

//export type ThemeColorKeys = keyof DefaultTheme;
