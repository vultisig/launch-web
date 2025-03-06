import axios from "axios";

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

//const externalAPI = {};

const api = {
  oneInch: async (id: number) => {
    return await fetch
      .get<{
        tokens: {
          [address: string]: {
            decimals: number;
            logoURI: string;
            name: string;
            symbol: string;
          };
        };
      }>(`${import.meta.env.VITE_VULTISIG_SERVER}1inch/swap/v6.0/${id}/tokens`)
      .then(({ data }) => data);
  },
};

export default api;
