import React, {FunctionComponent} from 'react';
import {IFundMarketingPageDetail} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";
import {IMAGE_TYPE} from "../../../../constants/promoFileTypes";
import {PromoDiv, PromoImage} from "./styles";


interface PromoProps {
  previewFundPage: IFundMarketingPageDetail
}


const Promo: FunctionComponent<PromoProps> = ({previewFundPage}) => {

  return <PromoDiv>
    {previewFundPage.fund_page_promo_files.filter(
      promoFile => promoFile.file_type === IMAGE_TYPE
    ).map(
      promoFile => <div className={'mt-4'}>
        <PromoImage src={promoFile.promo_file}/>
      </div>
    )}
  </PromoDiv>
}


export default Promo;
