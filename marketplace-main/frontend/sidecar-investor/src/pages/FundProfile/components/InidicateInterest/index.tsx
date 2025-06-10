import React, {FunctionComponent} from 'react';
import styled from "styled-components";
import {IFundWithProfile} from "../../../../interfaces/fundProfile";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import { useCompanyPrefix } from '../../../../utils/hooks';

const InterestButton = styled.a`
  background: #470C75;
  border-color: #470C75;
  border-radius: 70px;
  font-family: Quicksand;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 30px;
  color: #FFFFFF;
  z-index: 100;
  width: fit-content;
  padding: 16px 40px;
  margin-top: 40px;
  text-decoration: none;
  
  :hover {
    color: #FFFFFF;
  }
`


interface IndicateInterestProps {
  fund: IFundWithProfile
}


const IndicateInterest: FunctionComponent<IndicateInterestProps> = ({fund}) => {
  const {companyPrefix} =useCompanyPrefix()
  return <InterestButton href={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${fund.external_id}/interest`}>
    Indicate Interest
  </InterestButton>
};

export default IndicateInterest;
