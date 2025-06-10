import React, {FunctionComponent} from "react";
import Row from "react-bootstrap/Row";
import Block from "./Block";
import {BlockCol, ParentCol, WrapperRow} from "./styles";
import {IFundMarketingPageDetail} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";


interface HelpBlocksProps {
  previewFundPage: IFundMarketingPageDetail
}

const HelpBlocks: FunctionComponent<HelpBlocksProps> = ({previewFundPage}) => {
  return <Row>
    <ParentCol md={12}>
      <WrapperRow>
        {previewFundPage.footer_blocks.map(footerBlock => (
          <BlockCol md={3}>
            <Block label={footerBlock.title}
                   url={footerBlock.url}
                   icon={footerBlock.icon_url?.icon}/>
          </BlockCol>
        ))}
      </WrapperRow>
    </ParentCol>
  </Row>
};

export default HelpBlocks;