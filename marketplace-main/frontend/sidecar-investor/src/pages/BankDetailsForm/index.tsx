import {FunctionComponent, useEffect, useState} from "react";
import get from "lodash/get";
import size from "lodash/size";
import first from "lodash/first";
import {useHistory, useParams} from "react-router";
import {
  useFetchBankingDetailsQuery,
  useFetchModulePositionQuery,
  useFetchProgramDocsQuery,
  useGetApplicationStatusQuery,
  useGetDocumentsQuery,
  useGetFundDetailsQuery,
  useSaveBankingDetailsMutation,
  useUpdateModulePositionMutation
} from "../../api/rtkQuery/fundsApi";
import DetailsForm from "./Form";
import Confirmation from "../../components/FundReview/ConfirmationSection";
import {hasOnBoardingPermission} from '../../components/FundReview/onboardingPermission';
import {Params} from "../TaxForms/interfaces";
import {BigTitle, Container, FormContainer,} from "../TaxForms/styles";
import Logo from "../../components/Logo";
import {INVESTOR_URL_PREFIX} from '../../constants/routes';
import {BANKING_DETAILS} from '../../constants/commentModules';
import { logMixPanelEvent } from "../../utils/mixpanel";
import { StyledLink } from "../KnowYourCustomer/styles";
import { ArrowBack } from "@material-ui/icons";
import {IApplicationStatus} from "../../interfaces/application";
import { useCompanyPrefix } from "../../utils/hooks";
import { AGREEMENTS_STEP_MESSAGE } from "../../constants/agreements_message";
import { canMovePastReviewDocs } from "../../utils/statusChecks";

interface BankDetailsFormProps {}

const BankDetailsForm: FunctionComponent<BankDetailsFormProps> = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const history = useHistory();
  const { externalId } = useParams<Params>();
  const {companyPrefix} =useCompanyPrefix()
  const [updateBankDetailPosition] = useUpdateModulePositionMutation();
  const [saveBankingDetails] = useSaveBankingDetailsMutation();
  const { data: applicationStatus, refetch: refetchAppStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(
    externalId, {
      skip: !externalId,
    }
  );
  const {data: fundDetails} = useGetFundDetailsQuery(externalId, {
    skip: !externalId,
  });

  const { data: documents } = useGetDocumentsQuery(externalId, {
    skip: !externalId,
  });
  const { data:  programDocuments } = useFetchProgramDocsQuery({externalId, skipRquiredOnce: true}, {
    skip: !externalId,
  });
  const {data: bankPositionDetails} = useFetchModulePositionQuery(externalId, {
    skip: !externalId
  });
  const positionDetails = first(bankPositionDetails);
  const canMoveToAgreementsStep = canMovePastReviewDocs(applicationStatus)


  const { data: bankingApiData, isLoading: isLoadingBankingData } =
    useFetchBankingDetailsQuery(externalId, {
      skip: !externalId,
    });

  useEffect(() => {
    updateBankDetailPosition({moduleId: BANKING_DETAILS, externalId, currentStep: 0});
    refetchAppStatus()
  }, []);

  const onSubmit = (values: any) => {
    saveBankingDetails({
      externalId,
      ...values,
      currency: get(values, "currency.value"),
      bank_country: get(values, "bank_country.value"),
    })
      .then(async (resp: any) => {
        if (resp.data) {
          await refetchAppStatus()
          if(programDocuments.length > 0) {
            history.push(`${companyPrefix}/investor/funds/${externalId}/program_doc`);
          }
          else {
            if(size(documents) === 0) setShowConfirmation(true);
            else history.push(`${companyPrefix}/investor/funds/${externalId}/review_docs`);
          }
          logMixPanelEvent('Bank details submitted', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
        }
      })
      .catch((e) => {
        console.log({ e });
      });
  };

  if (isLoadingBankingData) return <></>;

  if((showConfirmation && size(documents) === 0) || (!applicationStatus.has_pre_document_stage && get(positionDetails, 'last_position') === '1' && get(positionDetails, 'module') === BANKING_DETAILS))
    return (<Confirmation customText={canMoveToAgreementsStep ? AGREEMENTS_STEP_MESSAGE : null} moduleId={BANKING_DETAILS} redirectUrl={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/agreements`}/>);

  return (
    <Container>
      <BigTitle>
        <Logo size="md" suffixText={fundDetails?.name} />
        Banking Details
      </BigTitle>

      <FormContainer>
      <StyledLink to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/application`}><ArrowBack /> Back to Application Overview</StyledLink>
        <DetailsForm details={first(bankingApiData)} handleSubmit={onSubmit} />
      </FormContainer>
    </Container>
  );
};

export default hasOnBoardingPermission(BankDetailsForm);
