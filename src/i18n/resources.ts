import { de } from "@/i18n/locales/de";
import { en } from "@/i18n/locales/en";
import { es } from "@/i18n/locales/es";
import { hr } from "@/i18n/locales/hr";
import { it } from "@/i18n/locales/it";
import { pt } from "@/i18n/locales/pt";

export const resources = Object.fromEntries(
  Object.entries({ de, en, es, hr, it, pt }).map(([lng, translation]) => [
    lng,
    { translation },
  ])
);
