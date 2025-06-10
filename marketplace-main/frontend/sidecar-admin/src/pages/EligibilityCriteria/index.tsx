import React, {FunctionComponent} from 'react';
import {MainEligibilityContainer} from "./styles";
import FundsList from "./components/FundsList";
import {useAppSelector} from "../../app/hooks";
import {selectSelectedCriteria, selectSelectedFund} from "./selectors";
import EligibilityFormCreation from "./components/EligibilityFormCreation";


interface EligibilityCriteriaPageProps {
}


const EligibilityCriteriaPage: FunctionComponent<EligibilityCriteriaPageProps> = () => {
  const selectedFund = useAppSelector(selectSelectedFund)
  const selectedCriteria = useAppSelector(selectSelectedCriteria)

  return <MainEligibilityContainer fluid>
    {!selectedFund && <FundsList/>}
    {selectedFund && selectedCriteria && <EligibilityFormCreation/>}
  </MainEligibilityContainer>
};

export default EligibilityCriteriaPage;
