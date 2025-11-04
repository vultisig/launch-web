import { Dropdown, MenuProps } from "antd";
import { FC } from "react";
import { useTheme } from "styled-components";

import { ChevronDownIcon } from "@/icons/ChevronDownIcon";
import { HStack, Stack } from "@/toolkits/Stack";
import { defaultTokens } from "@/utils/constants";
import { TickerKey } from "@/utils/types";

type TokenDropdownProps = {
  ticker: TickerKey;
  onChange?: (ticker: TickerKey) => void;
};

export const TokenDropdown: FC<TokenDropdownProps> = ({ ticker, onChange }) => {
  const colors = useTheme();

  const items: MenuProps["items"] = Object.values(defaultTokens)
    .filter((token) => !token?.isAirdropToken && token.ticker !== ticker)
    .map(({ ticker }) => ({
      key: ticker,
      icon: (
        <Stack
          as="img"
          alt={ticker}
          src={`/tokens/${ticker.toLowerCase()}.svg`}
          $style={{ height: "20px", width: "20px" }}
        />
      ),
      label: ticker,
      onClick: () => onChange?.(ticker),
    }));

  return defaultTokens[ticker]?.isAirdropToken ? (
    <HStack
      $style={{
        alignItems: "center",
        backgroundColor: colors.bgTertiary.toHex(),
        borderRadius: "20px",
        gap: "4px",
        padding: "8px 12px 8px 8px",
      }}
    >
      <Stack
        as="img"
        alt={ticker}
        src={`/tokens/${ticker.toLowerCase()}.svg`}
        $style={{ height: "24px", width: "24px" }}
      />
      <Stack as="span" $style={{ fontWeight: "500" }}>
        {ticker}
      </Stack>
    </HStack>
  ) : (
    <Dropdown menu={{ items }}>
      <HStack
        $style={{
          alignItems: "center",
          backgroundColor: colors.bgTertiary.toHex(),
          borderRadius: "20px",
          justifyContent: "space-between",
          cursor: "pointer",
          gap: "4px",
          padding: "8px",
        }}
      >
        <HStack
          $style={{
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Stack
            as="img"
            alt={ticker}
            src={`/tokens/${ticker.toLowerCase()}.svg`}
            $style={{ height: "24px", width: "24px" }}
          />
          <span className="ticker">{ticker}</span>
        </HStack>
        <Stack as={ChevronDownIcon} $style={{ fontSize: "24px" }} />
      </HStack>
    </Dropdown>
  );
};
