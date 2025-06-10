import { PageWrapper } from 'components/Page';
import { FunctionComponent } from 'react';
import { useParams, Link ,useNavigate} from "react-router-dom";
import CustomButton from 'components/Button/ThemeButton';
import { Container, NextButton, FormContainer } from "../../pages/TaxForms/styles";
import BackToApplication from 'components/BackToApplication';
import { ArrowForward } from '@material-ui/icons';

const REVIEW_TEXT = 'Thank you! We will review your application shortly.'

interface IConfirmation {
  showNext: boolean;
  handleClickNext: () => void;
  customText?: string | null;
}

const Confirmation: FunctionComponent<IConfirmation> = ({ showNext, handleClickNext, customText }) => {
  let { externalId , company } = useParams<{ externalId: string, company: string }>();
  const navigate=useNavigate()
  return <PageWrapper> <Container>
    <FormContainer>
      <BackToApplication />
      <h6 className="mt-5 mb-4">{customText ? customText : REVIEW_TEXT}</h6>
      {showNext && (
        <CustomButton
          // variant="primary"
          // className="mr-2"
          onClick={handleClickNext}
        >
          <ArrowForward /> Next Step
        </CustomButton>
      )}
    </FormContainer>
  </Container>
  </PageWrapper>
};

export default Confirmation;
