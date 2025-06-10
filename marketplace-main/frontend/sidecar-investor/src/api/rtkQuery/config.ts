import axios from "axios";
import { fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { AS_OF_DATE } from '../../pages/CarryVestingTool';
import { SHOW_UNPUBLISHED_FUNDS, VIEW_AS_ADVISOR_HEADER, VIEW_AS_USER_HEADER } from "../../constants/headers";
import { getCookie } from "../../utils/cookiesUtils";

const API_BASE = process.env.REACT_APP_API_URL

export const baseQuery = retry(
  async (args, api, extraOptions) => {
    const result = await fetchBaseQuery({
      baseUrl: `${API_BASE}/api/`,
      prepareHeaders: (headers) => {
        const token = axios.defaults.headers.common['Authorization'];
        const storedDate = getCookie(AS_OF_DATE) || "";
        const viewAs = axios.defaults.headers.common[VIEW_AS_USER_HEADER] || ""
        const viewAsAdvisor = axios.defaults.headers.common[VIEW_AS_ADVISOR_HEADER] || ""
        const showUnpublishedFunds = axios.defaults.headers.common[SHOW_UNPUBLISHED_FUNDS] ||  false
        
        if (token) {
          headers.set("Authorization", token);
          headers.set(AS_OF_DATE, storedDate);
          headers.set(VIEW_AS_USER_HEADER,viewAs)
          headers.set(VIEW_AS_ADVISOR_HEADER,viewAsAdvisor)
          headers.set(SHOW_UNPUBLISHED_FUNDS,showUnpublishedFunds)
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
