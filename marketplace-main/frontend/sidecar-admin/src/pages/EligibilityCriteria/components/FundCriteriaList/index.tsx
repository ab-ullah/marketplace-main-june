import React, {FunctionComponent} from 'react';
import {FundCriteriaListContainer, FundHeading} from "./styles";
import CreateCriteriaButton from "./components/CreateCriteriaModal";
import FundCriteriaTable from "./components/FundCriteriaTable";
import {IFundDetail} from "../../../../interfaces/fundDetails";


interface FundCriteriaProps {
  fund: IFundDetail
}


const FundCriteriaList: FunctionComponent<FundCriteriaProps> = ({fund}) => {
  return <FundCriteriaListContainer fluid>

      <FundHeading>
        Eligibility criteria for {fund.name}
        <CreateCriteriaButton fund={fund}/>
      </FundHeading>

      <FundCriteriaTable fund={fund}/>
  </FundCriteriaListContainer>
};

export default FundCriteriaList;
