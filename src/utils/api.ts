import axios from "axios";
import { request } from "graphql-request";

import { VULT_CONTRACT_ADDRESS } from "utils/constants";
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

interface HistoricalPriceProps {
  date: number;
  price: number;
}

const api = {
  historicalPriceByDay: async (
    endpoint: string,
    contract: string,
    start: number,
    end: number
  ): Promise<HistoricalPriceProps[]> => {
    const query = `{
      tokenDayDatas(
        where: {id_lte: "${contract}-${start}", id_gte: "${contract}-${end}"}
        orderBy: id
        orderDirection: desc
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
        where: {id_lte: "${contract}-${start}", id_gte: "${contract}-${end}"}
        orderBy: id
        orderDirection: desc
      ) {
        periodStartUnix
        priceUSD  
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
  historicalPrice: async (days: number): Promise<HistoricalPriceProps[]> => {
    const endpoint = `https://gateway.thegraph.com/api/${
      import.meta.env.VITE_GRAPH_API_KEY
    }/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`;
    const startEpochHours = Math.floor(Date.now() / 1000 / 3600);
    const endEpochHours = startEpochHours - 24 * days;

    if (days > 7) {
      return await api.historicalPriceByDay(
        endpoint,
        VULT_CONTRACT_ADDRESS,
        Math.floor(startEpochHours / 24),
        Math.floor(endEpochHours / 24)
      );
    } else {
      let allData: HistoricalPriceProps[] = [];
      let currentStart = startEpochHours;

      while (currentStart > endEpochHours) {
        const data = await api.historicalPriceByHour(
          endpoint,
          VULT_CONTRACT_ADDRESS,
          currentStart,
          endEpochHours
        );

        if (!data.length) break;

        allData = [...allData, ...data];

        currentStart = data[data.length - 1].date / 3600000;

        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      return allData;
    }
  },
  volume: async (days: number): Promise<number> => {
    const endpoint = `https://gateway.thegraph.com/api/${
      import.meta.env.VITE_GRAPH_API_KEY
    }/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`;
    const currentEpochDay = Math.floor(Date.now() / 1000 / 3600 / (24 * days));
    const query = `{
      tokenDayData(id: "${VULT_CONTRACT_ADDRESS}-${currentEpochDay}") {
        volumeUSD
      }
    }`;

    return request<{
      tokenDayData: { volumeUSD: string };
    }>(endpoint, query)
      .then(({ tokenDayData }) =>
        tokenDayData?.volumeUSD ? parseFloat(tokenDayData.volumeUSD) : 0
      )
      .catch(() => 0);
  },
};

export default api;
