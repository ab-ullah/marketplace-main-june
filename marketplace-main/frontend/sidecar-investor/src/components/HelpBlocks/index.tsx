import React, {FunctionComponent} from "react";
import styled from "styled-components";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Block from "./Block";
import userIcon from "../../assets/icons/users.svg"
import guideIcon from "../../assets/icons/guide.svg"
import worldIcon from "../../assets/icons/world.svg"
import faqIcon from "../../assets/icons/faq.svg"
import {INVESTOR_URL_PREFIX} from "../../constants/routes";
import { useCompanyPrefix } from "../../utils/hooks";

const BlockCol = styled(Col)`
  padding-left: 0;
  padding-right: 20px;
`
const WrapperRow = styled(Row)`
  margin: 0;
`


const ParentCol = styled(Col)`
  padding: 40px 60px;
`

interface HelpBlocksProps {

}

const HelpBlocks: FunctionComponent<HelpBlocksProps> = () => {
  const UserIcon = <img src={userIcon} alt="user" width={'40px'}/>
  const GuideIcon = <img src={guideIcon} alt="guide" width={'40px'}/>
  const WorldIcon = <img src={worldIcon} alt="world" width={'40px'}/>
  const FaqIcon = <img src={faqIcon} alt="faq" width={'40px'}/>
  const {companyPrefix} =useCompanyPrefix()


  return <Row>
    <ParentCol md={12}>
      <WrapperRow>
        <BlockCol md={3}>
          <Block
            label={'Access Employee Investor Portal'}
            url={`${companyPrefix}/${INVESTOR_URL_PREFIX}/ownership`}
            icon={UserIcon}
          />
        </BlockCol>
        <BlockCol md={3}><Block label={'Co-investment Program Guide'} url={''} icon={GuideIcon}/></BlockCol>
        <BlockCol md={3}><Block label={'FAQs'} url={''} icon={FaqIcon}/></BlockCol>
        <BlockCol md={3}><Block label={'Taxes references by country'} url={''} icon={WorldIcon}/></BlockCol>
      </WrapperRow>
    </ParentCol>
  </Row>
};

export default HelpBlocks;