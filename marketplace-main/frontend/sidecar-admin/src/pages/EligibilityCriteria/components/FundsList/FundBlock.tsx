import React, {FunctionComponent} from 'react';
import {ICriteriaFund} from "../../../../interfaces/EligibilityCriteria/fund";
import {FundBlockDiv} from "./styles";
import detailIcon from '../../../../assets/images/detail-icon.svg';
import {useAppDispatch} from "../../../../app/hooks";
import {setSelectedFund} from "../../eligibilityCriteriaSlice";

interface CompanyTokensProps {
  fund: ICriteriaFund
}


const FundBlock: FunctionComponent<CompanyTokensProps> = ({fund}) => {
  const dispatch = useAppDispatch()

  return <FundBlockDiv onClick={() => dispatch(setSelectedFund(fund))}>
    <div><img src={detailIcon} width={40} alt="delete-icon"/></div>
    <div className={'fund-name'}>{fund.name}</div>
  </FundBlockDiv>
};

export default FundBlock;
