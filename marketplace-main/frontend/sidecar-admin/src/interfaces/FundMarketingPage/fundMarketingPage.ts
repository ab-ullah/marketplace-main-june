import {IIcon} from "./icon";

export interface IFundFact {
  id: number;
  title: string;
  data: string
}

export interface IFooterBlock {
  id: number;
  icon_url: IIcon | null;
  title: string;
  url: string;
}


export interface IDocument {
  id: number;
  document_name: string;
  document_id: string;
  extension: string;
  doc_id: number;
}

export interface IFundPageRequestAllocation {
  id: number;
  start_date: string;
  end_date: string;
  investment_amount: number;
  allocation_documents: IDocument[];
}

export interface IPromoFile {
  id: number;
  file_type: number;
  promo_file: string;
}

export interface IMarketingPageFund {
  id: number;
  name: string;
  symbol: string;
}

export interface IContact {
  id: number;
  email: string;
}

export interface IFundMarketingPageDetail {
  id: number;
  title: string;
  sub_header: string;
  description: string;
  logo: string | null;
  background_image: string | null;
  fund_facts: IFundFact[];
  footer_blocks: IFooterBlock[];
  request_allocation_criteria: IFundPageRequestAllocation[];
  fund_page_documents: IDocument[];
  fund_page_promo_files: IPromoFile[];
  fund: IMarketingPageFund,
  fund_contact: IContact
}

export interface IMarketingPage {
  id: number;
  title: string;
  modified_at: string;
  statusName: string;
  created_by_name: string;

}