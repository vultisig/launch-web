import { FC } from "react";
import { Dropdown, MenuProps } from "antd";

import { defaultTokens, TickerKey } from "utils/constants";

import { ChevronDown } from "icons";

interface ComponentProps {
  ticker: TickerKey;
  onChange: (ticker: TickerKey) => void;
}

const Component: FC<ComponentProps> = ({ ticker, onChange }) => {
  const items: MenuProps["items"] = Object.values(defaultTokens)
    .filter((token) => !token.isAirdropToken && token.ticker !== ticker)
    .map(({ ticker }) => ({
      key: ticker,
      icon: <img src={`/tokens/${ticker.toLowerCase()}.svg`} alt={ticker} />,
      label: ticker,
      onClick: () => onChange(ticker),
    }));

  return defaultTokens[ticker].isAirdropToken ? (
    <span className="token-dropdown">
      <img
        src={`/tokens/${ticker.toLowerCase()}.svg`}
        alt={ticker}
        className="logo"
      />
      <span className="ticker">{ticker}</span>
    </span>
  ) : (
    <Dropdown menu={{ items }} rootClassName="token-dropdown-menu">
      <span className="token-dropdown">
        <img
          src={`/tokens/${ticker.toLowerCase()}.svg`}
          alt={ticker}
          className="logo"
        />
        <span className="ticker">{ticker}</span>
        <ChevronDown className="arrow" />
      </span>
    </Dropdown>
  );
};

export default Component;
