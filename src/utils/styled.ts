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
  buttonPrimary: ColorToken;
  buttonPrimaryHover: ColorToken;
  buttonSecondary: ColorToken;
  buttonSecondaryHover: ColorToken;
  buttonText: ColorToken;
  error: ColorToken;
  info: ColorToken;
  success: ColorToken;
  warning: ColorToken;
};

const sharedColors: SharedColors = {
  accentOne: new ColorToken(224, 95, 31), //hsla(224, 95%, 31%, 1)
  accentTwo: new ColorToken(224, 96, 40), //hsla(224, 96%, 40%, 1)
  accentThree: new ColorToken(224, 75, 50), //hsla(224, 75%, 50%, 1)
  accentFour: new ColorToken(224, 98, 64), //hsla(224, 98%, 64%, 1)
  buttonPrimary: new ColorToken(224, 75, 50), //hsla(224, 75%, 50%, 1)
  buttonPrimaryHover: new ColorToken(215, 75, 47), //hsla(215, 75%, 47%, 1)
  buttonSecondary: new ColorToken(216, 81, 13), //hsla(216, 81%, 13%, 1)
  buttonSecondaryHover: new ColorToken(207, 64, 15), //hsla(207, 64%, 15%, 1)
  buttonText: new ColorToken(220, 67, 96), //hsla(220, 67%, 96%, 1)
  error: new ColorToken(0, 100, 68), //hsla(0, 100%, 68%, 1)
  info: new ColorToken(212, 100, 68), //hsla(212, 100%, 68%, 1)
  success: new ColorToken(166, 83, 43), //hsla(166, 83%, 43%, 1)
  warning: new ColorToken(38, 100, 68), //hsla(38, 100%, 68%, 1)
};

export const themes: Record<Theme, DefaultTheme> = {
  dark: {
    ...sharedColors,
    bgPrimary: new ColorToken(217, 91, 9), //hsla(217, 91%, 9%, 1)
    bgSecondary: new ColorToken(216, 81, 13), //hsla(216, 81%, 13%, 1)
    bgTertiary: new ColorToken(216, 63, 18), //hsla(216, 63%, 18%, 1)
    borderLight: new ColorToken(216, 63, 18), //hsla(216, 63%, 18%, 1)
    borderNormal: new ColorToken(215, 62, 28), //hsla(215, 62%, 28%, 1)
    buttonDisabled: new ColorToken(221, 68, 14), //hsla(221, 68%, 14%, 1)
    buttonTextDisabled: new ColorToken(216, 15, 52), //hsla(216, 15%, 52%, 1)
    textPrimary: new ColorToken(220, 67, 96), //hsla(220, 67%, 96%, 1)
    textSecondary: new ColorToken(215, 40, 85), //hsla(215, 40%, 85%, 1)
    textTertiary: new ColorToken(214, 21, 60), //hsla(214, 21%, 60%, 1)
  },
  light: {
    ...sharedColors,
    bgPrimary: new ColorToken(0, 0, 100), //hsla(0, 0%, 100%, 1)
    bgSecondary: new ColorToken(226, 21, 97), //hsla(226, 21%, 97%, 1)
    bgTertiary: new ColorToken(240, 20, 97), //hsla(240, 20%, 97%, 1)
    borderLight: new ColorToken(0, 0, 0, 0.05), //hsla(0, 0%, 0%, 0.05)
    borderNormal: new ColorToken(0, 0, 0, 0.1), //hsla(0, 0%, 0%, 0.1)
    buttonDisabled: new ColorToken(240, 20, 97), //hsla(240, 20%, 97%, 1)
    buttonTextDisabled: new ColorToken(215, 16, 52), //hsla(215, 16%, 52%, 1)
    textPrimary: new ColorToken(217, 91, 9), //hsla(217, 91%, 9%, 1)
    textSecondary: new ColorToken(217, 55, 19), //hsla(217, 55%, 19%, 1)
    textTertiary: new ColorToken(215, 16, 52), //hsla(215, 16%, 52%, 1)
  },
} as const;

//export type ThemeColorKeys = keyof DefaultTheme;
