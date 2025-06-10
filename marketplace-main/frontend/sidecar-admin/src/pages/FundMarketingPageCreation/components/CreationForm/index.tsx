import React, {FunctionComponent} from 'react';
import {IFundMarketingPageDetail} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";
import MainBlock from "./MainBlock";
import FundFactBlock from "./FundFactBlock";
import FooterBlock from "./FooterBlock";
import RequestAllocationBlock from "./RequestAllocationBlock";
import DocumentsBlock from "./DocumentsBlock";
import PromoFileBlock from "./PromoBlock";
import ContactBlock from "./ContactBlock";


interface CreationFormProps {
  marketingPageDetail: IFundMarketingPageDetail
}


const CreationForm: FunctionComponent<CreationFormProps> = ({marketingPageDetail}) => {


  return <>
    <MainBlock marketingPageDetail={marketingPageDetail}/>
    <FundFactBlock marketingPageDetail={marketingPageDetail}/>
    <PromoFileBlock marketingPageDetail={marketingPageDetail}/>
    <DocumentsBlock marketingPageDetail={marketingPageDetail}/>
    <RequestAllocationBlock marketingPageDetail={marketingPageDetail}/>
    <FooterBlock marketingPageDetail={marketingPageDetail}/>
    <ContactBlock marketingPageDetail={marketingPageDetail}/>
  </>
};

export default CreationForm;
