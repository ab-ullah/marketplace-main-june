import {FunctionComponent, useEffect} from 'react';
import Button from "react-bootstrap/Button";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";




import ApplicantInfoForm from "./ApplicantInfoForm";
import {ErrorDiv} from "../../../OpportunityOnboarding/components/UserDocsBlock/styled";
import {fetchGeoSelector} from "../../../OpportunityOnboarding/thunks";
import {selectError} from "../../../OpportunityOnboarding/selectors";
import {resetError} from "../../../OpportunityOnboarding/eligibilityCriteriaSlice";

interface CountryInvestorSelectorProps {
  externalId: string
}


const CountryInvestorSelector: FunctionComponent<CountryInvestorSelectorProps> = ({externalId}) => {
  const dispatch = useAppDispatch()
  const errorMessage = useAppSelector(selectError)

  useEffect(() => {
    dispatch(fetchGeoSelector(externalId))
  }, [dispatch])


  return <div>
    {errorMessage ? (
      <>
        <Button variant="outline-primary btn-back" className="mb-2" onClick={() => dispatch(resetError())}>Back</Button>
        <h4 className="mt-5 mb-4">Not eligible</h4>
        <ErrorDiv>{errorMessage}</ErrorDiv>
      </>
    ) : (
      <>
        <ApplicantInfoForm externalId={externalId}/>
        {errorMessage && <ErrorDiv className={'mt-4'}>{errorMessage}</ErrorDiv>}
      </>  
    )}
  </div>
};

export default CountryInvestorSelector;
