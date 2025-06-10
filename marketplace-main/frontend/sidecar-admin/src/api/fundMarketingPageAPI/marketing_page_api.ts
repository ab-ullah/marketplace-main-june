import axios from "axios";
import {
  contactUpdateUrl,
  deletePromoFilesUrl,
  deleteReviewerUrl,
  documentBlocksUrl,
  footerBlocksUpdateUrl,
  footerBlocksUrl,
  FUND_MARKETING_PAGE_URL,
  fundFactsUpdateUrl,
  fundFactsUrl, fundMarketingPagesQueryUrl,
  getMarketingPageUrl, ICONS_URL,
  promoFilesUrl,
  requestAllocationDocumentUrl,
  requestAllocationUpdateUrl,
  reviewersUrl
} from "./routes";

class FundMarketingPageAPI {
  getFundMarketingPages = async (fundId: number) => {
    const url = fundMarketingPagesQueryUrl(fundId)
    const response = await axios.get(url);
    return response.data
  }

  createFundMarketingPage = async (payload: any) => {
    const response = await axios.post(FUND_MARKETING_PAGE_URL, payload);
    return response.data
  }

  getFundMarketingPageDetail = async (pageId: number) => {
    const url = getMarketingPageUrl(pageId)
    const response = await axios.get(url);
    return response.data
  }

  updateFundMarketingPage = async (pageId: number, payload: any) => {
    const url = getMarketingPageUrl(pageId)
    const response = await axios.patch(url, payload);
    return response.data
  }

  createFundFact = async (pageId: number, payload: any) => {
    const url = fundFactsUrl(pageId)
    const response = await axios.post(url, payload);
    return response.data
  }

  updateFundFact = async (pageId: number, factId: number, payload: any) => {
    const url = fundFactsUpdateUrl(pageId, factId)
    const response = await axios.patch(url, payload);
    return response.data
  }

  createFooterBlock = async (pageId: number, payload: any) => {
    const url = footerBlocksUrl(pageId)
    const response = await axios.post(url, payload);
    return response.data
  }

  updateFooterBlock = async (pageId: number, footerBlockId: number, payload: any) => {
    const url = footerBlocksUpdateUrl(pageId, footerBlockId)
    const response = await axios.patch(url, payload);
    return response.data
  }

  updateRequestAllocation = async (pageId: number, allocationId: number, payload: any) => {
    const url = requestAllocationUpdateUrl(pageId, allocationId)
    const response = await axios.patch(url, payload);
    return response.data
  }

  updateContact = async (pageId: number, contactId: number, payload: any) => {
    const url = contactUpdateUrl(pageId, contactId)
    const response = await axios.patch(url, payload);
    return response.data
  }

  createDocument = async (pageId: number, payload: any) => {
    const url = documentBlocksUrl(pageId)
    const response = await axios.post(url, payload);
    return response.data
  }

  createAllocationDocument = async (pageId: number, allocationId: number, payload: any) => {
    const url = requestAllocationDocumentUrl(pageId, allocationId)
    const response = await axios.post(url, payload);
    return response.data
  }

  createPromoFile = async (pageId: number, payload: any) => {
    const url = promoFilesUrl(pageId)
    const response = await axios.post(url, payload);
    return response.data
  }

  deletePromoFile = async (pageId: number, promoFileId: number) => {
    const url = deletePromoFilesUrl(pageId, promoFileId)
    const response = await axios.delete(url);
    return response.data
  }

  getFundPageReviewers = async (pageId: number) => {
    const url = reviewersUrl(pageId)
    const response = await axios.get(url);
    return response.data
  };

  createFundPageReviewers = async (pageId: number, payload: any) => {
    const url = reviewersUrl(pageId)
    const response = await axios.post(url, payload);
    return response.data
  };

  deleteFundPageReviewers = async (pageId: number, reviewerId: number) => {
    const url = deleteReviewerUrl(pageId, reviewerId)
    const response = await axios.delete(url);
    return response.data
  };

  getIcons = async () => {
    const response = await axios.get(ICONS_URL);
    return response.data
  };

}

export default new FundMarketingPageAPI();