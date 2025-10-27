import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { ContractAddress, Currency } from "utils/constants";
import { toCamelCase } from "utils/functions";

const fetch = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_ADDRESS}`,
  headers: { accept: "application/json" },
});

fetch.interceptors.request.use(
  (config) => config,
  (error) => {
    return Promise.reject(error.response);
  }
);

fetch.interceptors.response.use(
  (response) => {
    response.data = toCamelCase(response.data);

    return response;
  },
  ({ response }) => {
    return Promise.reject(response.data.error);
  }
);

interface GasFeeEstimate {
  suggestedMaxPriorityFeePerGas: string;
  suggestedMaxFeePerGas: string;
  minWaitTimeEstimate: number;
  maxWaitTimeEstimate: number;
}

export interface SuggestedGasFeeData {
  low: GasFeeEstimate;
  medium: GasFeeEstimate;
  high: GasFeeEstimate;
  estimatedBaseFee: string;
  networkCongestion: number;
  latestPriorityFeeRange: [string, string];
  historicalPriorityFeeRange: [string, string];
  historicalBaseFeeRange: [string, string];
  priorityFeeTrend: "up" | "down" | "stable";
  baseFeeTrend: "up" | "down" | "stable";
  version: string;
}

const api = {
  balance: async (
    address: string,
    decimals: number,
    contract: string,
    isNative: boolean
  ) => {
    return fetch
      .post<{ result: string }>("/eth/", {
        id: uuidv4(),
        jsonrpc: "2.0",
        method: isNative ? "eth_getBalance" : "eth_call",
        params: [
          isNative
            ? address
            : {
                data: `0x70a08231000000000000000000000000${address.replace(
                  "0x",
                  ""
                )}`,
                to: contract,
              },
          "latest",
        ],
      })
      .then(({ data }) => {
        const result = parseInt(data?.result, 16);

        return result ? result / Math.pow(10, decimals) : 0;
      })
      .catch(() => 0);
  },
  suggestedFees: async (): Promise<SuggestedGasFeeData> => {
    const endpoint =
      "https://gas.api.cx.metamask.io/networks/1/suggestedGasFees";
    const response = await axios.get(endpoint, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },
  values: async (ids: number[], currency: Currency) => {
    const modifedData: Record<string, number> = {};

    return fetch
      .get<{
        data: Record<string, { quote: Record<string, { price: number }> }>;
      }>(
        `/cmc/v2/cryptocurrency/quotes/latest?id=${ids.join(
          ","
        )}&skip_invalid=true&aux=is_active&convert=${currency}`
      )
      .then(({ data }) => {
        Object.entries(data.data).forEach(([key, value]) => {
          modifedData[key] =
            (value.quote[currency] && value.quote[currency].price) || 0;
        });

        return modifedData;
      })
      .catch(() => modifedData);
  },
  volume: async (): Promise<number> => {
    return fetch
      .get<{ data: { attributes: { volumeUsd: { h24: string | null } } } }>(
        `/geckoterminal/api/v2/networks/eth/pools/${ContractAddress.VULT_USDC_POOL}`,
        {
          params: {
            include: "base_token",
            include_volume_breakdown: false,
            include_composition: false,
          },
        }
      )
      .then(({ data }) =>
        data?.data?.attributes?.volumeUsd?.h24
          ? Number(data.data.attributes.volumeUsd.h24)
          : 0
      )
      .catch(() => 0);
  },
};

export default api;
