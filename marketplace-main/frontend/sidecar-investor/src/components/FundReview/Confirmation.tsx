import { ArrowBack, ArrowForward } from '@material-ui/icons';
import { FunctionComponent } from 'react';
import { useParams, Link } from "react-router-dom";
import { INVESTOR_URL_PREFIX } from '../../constants/routes';
import { StyledLink } from '../../pages/KnowYourCustomer/styles';
import { Container, NextButton, FormContainer } from "../../pages/TaxForms/styles";
import { useCompanyPrefix } from '../../utils/hooks';

const REVIEW_TEXT = 'Thank you! We will review your application shortly. You will receive an email when your application is ready for next steps.'

interface IConfirmation {
  showNext: boolean;
  handleClickNext: () => void;
  customText?: string | null;
}

const Confirmation: FunctionComponent<IConfirmation> = ({ showNext, handleClickNext, customText }) => {
  let { externalId } = useParams<{ externalId: string, company: string }>();
  const {companyPrefix} =useCompanyPrefix()
  return <Container>
    <FormContainer>
    {externalId && (
        <StyledLink to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/application`}>
          <ArrowBack /> Back to Application Overview
        </StyledLink>
      )}
      <h6 className="mt-5 mb-4">{customText ? customText : REVIEW_TEXT}</h6>
      {showNext && (
        <NextButton
          variant="primary"
          className="mr-2"
          onClick={handleClickNext}
        >
          Next Step <ArrowForward />
        </NextButton>
      )}
    </FormContainer>
  </Container>
};

export default Confirmation;
