export const periods = [1, 7, 30] as const;

export type Period = (typeof periods)[number];

export const defaultPeriod: Period = 1;

export const periodNames: Record<Period, string> = {
  1: "24h",
  7: "7d",
  30: "30d",
};
