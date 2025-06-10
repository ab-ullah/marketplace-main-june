import React, {FunctionComponent} from 'react';


import Row from "react-bootstrap/Row";
import {IFundMarketingPageDetail} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";
import {BadgeParentDiv, BannerCol, BaseDiv, DescriptionDiv, FundNameDiv, IntroDiv, WhiteBgBadge} from "./styles";


interface FundHeaderProps {
  previewFundPage: IFundMarketingPageDetail
}


const FundHeader: FunctionComponent<FundHeaderProps> = ({previewFundPage}) => {
  const {fund} = previewFundPage;

  return <Row>
    <BannerCol md={12} bgImage={previewFundPage.background_image}>
      {previewFundPage.logo && <BaseDiv><img src={previewFundPage.logo} width={200} alt="preview-fund"/></BaseDiv>}
      <FundNameDiv>{fund.name}</FundNameDiv>
      <BadgeParentDiv>
        <WhiteBgBadge pill>{fund.symbol}</WhiteBgBadge>
        <WhiteBgBadge pill>Information guide</WhiteBgBadge>
      </BadgeParentDiv>
      <IntroDiv>{previewFundPage.sub_header}</IntroDiv>
      <DescriptionDiv>{previewFundPage.description}</DescriptionDiv>
    </BannerCol>
  </Row>
};

export default FundHeader;
