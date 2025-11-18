import axios from "axios";
import { request } from "graphql-request";
import { v4 as uuidv4 } from "uuid";

import { contractAddress } from "@/utils/constants";
import { Currency } from "@/utils/currency";
import { toCamelCase } from "@/utils/functions";
import {
  HistoricalPriceProps,
  SuggestedGasFeeProps,
  VultisigWalletProps,
} from "@/utils/types";

const fetch = axios.create({
  baseURL: import.meta.env.VITE_SERVER_ADDRESS,
  headers: { accept: "application/json" },
});

const fetchTalkApi = axios.create({
  baseURL: import.meta.env.VITE_TALK_ADDRESS,
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

export const api = {
  balance: async (
    address: string,
    decimals: number,
    contract: string,
    isNative: boolean
  ) => {
    return fetch
      .post<{ result: string }>(import.meta.env.VITE_RPC_MAINNET, {
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
  historicalPriceByDay: async (
    endpoint: string,
    contract: string,
    start: number,
    end: number
  ): Promise<HistoricalPriceProps[]> => {
    const query = `{
      tokenDayDatas(
        orderBy: date
        orderDirection: desc
        where: {date_lte: ${start}, date_gte: ${end}, token_: {id: "${contract.toLowerCase()}"}}
      ) { 
        date
        priceUSD
      }
    }`;
    return await request<{
      tokenDayDatas: { date: number; priceUSD: string }[];
    }>(endpoint, query)
      .then(({ tokenDayDatas }) =>
        tokenDayDatas.map(({ date, priceUSD }) => ({
          date: date * 1000,
          price: parseFloat(priceUSD) || 0,
        }))
      )
      .catch(() => []);
  },
  historicalPriceByHour: async (
    endpoint: string,
    contract: string,
    start: number,
    end: number
  ): Promise<HistoricalPriceProps[]> => {
    const query = `{
    tokenHourDatas(
      orderBy: periodStartUnix
      orderDirection: desc
      where: {periodStartUnix_lte: ${start}, periodStartUnix_gte: ${end}, token_: {id: "${contract.toLowerCase()}"}}
    ) {
      priceUSD
      periodStartUnix
    }
  }`;
    return await request<{
      tokenHourDatas: { periodStartUnix: number; priceUSD: string }[];
    }>(endpoint, query)
      .then(({ tokenHourDatas }) =>
        tokenHourDatas.map(({ periodStartUnix, priceUSD }) => ({
          date: periodStartUnix * 1000,
          price: parseFloat(priceUSD) || 0,
        }))
      )
      .catch(() => []);
  },
  historicalPrice: async (
    contract: string,
    days: number
  ): Promise<HistoricalPriceProps[]> => {
    const endpoint = `https://gateway.thegraph.com/api/${
      import.meta.env.VITE_GRAPH_API_KEY
    }/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`;

    const startEpochSec = Math.floor(Date.now() / 1000);
    const endEpochSec = startEpochSec - 24 * days * 3600;

    if (days > 7) {
      return await api.historicalPriceByDay(
        endpoint,
        contract,
        startEpochSec,
        endEpochSec
      );
    } else {
      let allData: HistoricalPriceProps[] = [];
      let currentStart = startEpochSec;

      while (currentStart > endEpochSec) {
        const data = await api.historicalPriceByHour(
          endpoint,
          contract,
          currentStart,
          endEpochSec
        );

        if (!data.length) break;

        allData = [...allData, ...data];

        currentStart = data[data.length - 1].date / 3600000;

        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      return allData;
    }
  },
  suggestedFees: async () => {
    return fetch.get<SuggestedGasFeeProps>(
      "https://gas.api.cx.metamask.io/networks/1/suggestedGasFees"
    );
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
        `/geckoterminal/api/v2/networks/eth/pools/${contractAddress.vultUsdcPool}`,
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
  applyStatus: async (ecdsa: string) => {
    const { data } = await fetchTalkApi.get<{ applied: boolean }>(
      `/whitelist?ecdsa=${ecdsa}`
    );
    return data.applied;
  },
  challengeMessage: async (uid: string) => {
    const { data } = await fetchTalkApi.post<{
      message: string;
      nonce: string;
      timestamp: string;
    }>(`/challenge`, {
      uid,
    });
    return {
      message: data.message,
      nonce: data.nonce,
      timestamp: data.timestamp,
    };
  },

  registerVultisigWallet: async (
    wallet: VultisigWalletProps,
    message: string,
    signature: string
  ) => {
    const { data } = await fetchTalkApi.post<{
      id: number;
      uid: string;
      name: string;
      whitelisted: boolean;
      created_at: string;
    }>(`/whitelist`, {
      ...wallet,
      message,
      signature,
    });
    return data;
  },
  attestAddress: async (address: string) => {
    const { data } = await fetchTalkApi.get<{
      success: boolean;
      data: {
        address: string;
        signature: string;
        domain: {
          name: string;
          version: string;
          chainId: number;
          verifyingContract: string;
        };
      };
    }>(`/attest_address?address=${address}`);
    return data;
  },
  attestBurn: async ({ txId, eventId }: { txId: string; eventId: number }) => {
    const { data } = await fetchTalkApi.get<{
      success: boolean;
      data: {
        baseTxId: string;
        baseEventId: string;
        amount: string;
        recipient: string;
        signature: string;
        blockNumber: number;
        confirmations: number;
        domain: {
          name: string;
          version: string;
          chainId: number;
          verifyingContract: string;
        };
      };
    }>(`/attest_burn?tx_id=${txId}&event_id=${eventId}`);
    return data;
  },
  getBurns: async (address: string) => {
    const { data } = await fetchTalkApi.get<{
      success: boolean;
      data: Array<{
        baseTxId: string;
        baseEventId: string;
        ethTxId: string | null;
        claimed: boolean;
        amount: string;
        recipient: string;
        blockNumber: number;
      }>;
    }>(`/burns?address=${address}`);
    return data;
  },
};
