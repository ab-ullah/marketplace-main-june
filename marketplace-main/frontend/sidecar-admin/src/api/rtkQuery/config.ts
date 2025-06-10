import axios from "axios";
import { fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { AS_OF_DATE } from "../../pages/CarryManagement/components/VestingTool";
import { getCookie } from "../../utils/cookiesUtils";

const API_BASE = process.env.REACT_APP_API_URL

export const baseQuery = retry(
  async (args, api, extraOptions) => {
    const result = await fetchBaseQuery({
      baseUrl: `${API_BASE}/api/`,
      prepareHeaders: (headers) => {
        const token = axios.defaults.headers.common['Authorization'];
        const storedDate = getCookie(AS_OF_DATE) || "";
        if (token) {
          headers.set("Authorization", token);
          headers.set(AS_OF_DATE, storedDate);
          headers.set("Content-Type", "application/json");
        }
        return headers;
      },
    })(args, api, extraOptions);
    
    // if any error, need to try to call this api again
    if (result.error?.status === 503) {
      retry.fail(result.error);
    }
    return result;
  },
  {
    maxRetries: 0,
  }
);
