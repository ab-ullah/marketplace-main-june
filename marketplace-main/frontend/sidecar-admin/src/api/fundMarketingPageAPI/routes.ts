const API_BASE = process.env.REACT_APP_API_URL

export const FUND_MARKETING_PAGE_URL = `${API_BASE}/api/fund_marketing_pages/`
export const ICONS_URL = `${FUND_MARKETING_PAGE_URL}icons`
export const fundMarketingPagesQueryUrl = (fundId: number) => `${FUND_MARKETING_PAGE_URL}?fund_id=${fundId}`
export const getMarketingPageUrl = (pageId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}`
export const fundFactsUrl = (pageId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/fund-facts`
export const fundFactsUpdateUrl = (pageId: number, fundFactId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/fund-facts/${fundFactId}`
export const footerBlocksUrl = (pageId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/footer-blocks`
export const promoFilesUrl = (pageId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/promo-files`
export const deletePromoFilesUrl = (pageId: number, promoFileId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/promo-files/${promoFileId}`
export const footerBlocksUpdateUrl = (pageId: number, footerBlockId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/footer-blocks/${footerBlockId}`
export const requestAllocationUpdateUrl = (pageId: number, allocationId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/request-allocation/${allocationId}`
export const contactUpdateUrl = (pageId: number, contactId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/contact/${contactId}`
export const requestAllocationDocumentUrl = (pageId: number, allocationId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/request-allocation/${allocationId}/documents`
export const documentBlocksUrl = (pageId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/documents`
export const reviewersUrl = (pageId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/reviewers`
export const deleteReviewerUrl = (pageId: number, reviewerId: number) => `${FUND_MARKETING_PAGE_URL}${pageId}/reviewers/${reviewerId}`
