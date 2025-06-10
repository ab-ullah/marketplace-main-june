import {FunctionComponent, useMemo, useState, useEffect} from 'react';
import size from "lodash/size";
import isNil from "lodash/isNil";
import isEmpty from "lodash/isEmpty";
import find from "lodash/find";
import { useParams, useHistory } from "react-router";
import { INVESTOR_URL_PREFIX } from '../../constants/routes';
import { Params } from "../TaxForms/interfaces";
import {
  useGetDocumentsQuery,
  useFetchSignedPowerOfAttorneyQuery,
  useFetchProgramDocsQuery,
  useGetApplicationStatusQuery
} from "../../api/rtkQuery/fundsApi";
import { hasOnBoardingPermission } from '../../components/FundReview/onboardingPermission';
import ProgramDocForm from "./Form";
import Logo from "../../components/Logo";
import Confirmation from "../../components/FundReview/ConfirmationSection";
import {
  BigTitle,
  FormContainer,
  Container, NextButton
} from "../TaxForms/styles";
import { ArrowBack, ArrowForward } from '@material-ui/icons';
import { StyledLink } from '../KnowYourCustomer/styles';
import {IApplicationStatus} from "../../interfaces/application";
import {canMovePastReviewDocs} from "../../utils/statusChecks";
import {AGREEMENTS_STEP_MESSAGE} from "../../constants/agreements_message";
import { useCompanyPrefix } from '../../utils/hooks';


const PowerOfAttorney: FunctionComponent = () => {
  const { externalId } = useParams<Params>();
  const {companyPrefix} =useCompanyPrefix()
  const history = useHistory();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { data: programDocuments } = useFetchProgramDocsQuery({externalId, skipRquiredOnce: true}, {
    skip: !externalId,
  });
  const { data: documents } = useGetDocumentsQuery(externalId, {
    skip: !externalId,
  });
  const { data: signedDocuments } = useFetchSignedPowerOfAttorneyQuery(externalId, {
    skip: !externalId,
  });
  const { data: applicationStatus, refetch: refetchAppStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);

  useEffect(()=>{
    refetchAppStatus()
  }, [])

  const isAllowed = useMemo(() => {
    const data = find(programDocuments, (doc) => {
      const { company_document, signed_document, is_acknowledged } = doc;
      const { require_signature, require_wet_signature } = company_document;
      return (
        (require_signature && require_wet_signature && signed_document === null) ||
        (!require_signature && !require_wet_signature && !is_acknowledged)
      );
    })
    return isEmpty(data) || isNil(data);
  }, [programDocuments])

  const callbackSubmitPOA =async () => {
    await refetchAppStatus()
    if (size(documents) === 0) setShowConfirmation(true);
    else history.push(`${companyPrefix}/investor/funds/${externalId}/review_docs`);
  }

  const canMoveToNextStep = canMovePastReviewDocs(applicationStatus)

  if (showConfirmation && size(documents) === 0)
    return (<Confirmation
      redirectUrl={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/agreements`}
      customText={canMoveToNextStep ? AGREEMENTS_STEP_MESSAGE : null}
    />);

  return <Container>
    <BigTitle>
      <Logo size="md" />
      Program Documents
    </BigTitle>
    <FormContainer>
      <StyledLink to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/application`}>
        <ArrowBack /> Back to Application Overview
      </StyledLink>
      <div className='mb-5'>
        <ProgramDocForm />
      </div>
      <div className="text-end">
        <NextButton
          variant="primary"
          className="mr-2"
          disabled={!isAllowed}
          onClick={callbackSubmitPOA}
        >
          Next Step <ArrowForward />
        </NextButton>
      </div>
    </FormContainer>
  </Container>
}

export default hasOnBoardingPermission(PowerOfAttorney);
