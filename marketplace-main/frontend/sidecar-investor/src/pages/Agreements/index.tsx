import {FunctionComponent, useMemo, useState} from 'react';
import {Link, useParams} from "react-router-dom";
import {useGetAgreementsQuery} from "../../api/rtkQuery/agreementsApi";
import ApplicantAgreementDocument from "./components/ApplicantDocument";
import {IApplicantAgreement} from "../../interfaces/Agreement/agreementDocuments";
import { hasKycPermission } from '../../components/FundReview/onboardingPermission';
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import {SideCarStyledTable} from "../../presentational/StyledTableContainer";
import NavableLoader from "../../components/NavableLoader";
import Logo from "../../components/Logo";
import {useGetFundDetailsQuery} from "../../api/rtkQuery/fundsApi";
import { INVESTOR_URL_PREFIX } from '../../constants/routes';
import { Wrapper } from './styles'
import { StyledLink, Button } from '../KnowYourCustomer/styles';
import { ArrowBack } from '@material-ui/icons';
import { useCompanyPrefix } from '../../utils/hooks';
import { useAppSelector } from '../../app/hooks';
import { selectUserInfo } from '../User/selectors';
import { getAdvisorSelectedFromLocal } from '../../utils/advisorSelected';


interface AgreementsProps {
}


const AgreementsPage: FunctionComponent<AgreementsProps> = () => {
  const {externalId} = useParams<{ externalId: string }>();
  const {companyPrefix} =useCompanyPrefix()
  const userInfo = useAppSelector(selectUserInfo);
  const advisorSelected = getAdvisorSelectedFromLocal()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {data: fundDetails} = useGetFundDetailsQuery(externalId);
  const {data: agreements, isLoading: isLoadingAgreements} = useGetAgreementsQuery(externalId);
  
  const isSigningComplete = useMemo(() => {
      let allDocumentsSigned = false;
      if(agreements){
        for(let i = 0; i < agreements.length; i++){
          allDocumentsSigned = agreements[i]?.completed;
          if(!allDocumentsSigned) break;
        }
      }
      return allDocumentsSigned
    }, [agreements])

  if (isSubmitting || isLoadingAgreements) return <NavableLoader/>
  if (!agreements) return <></>
  if (isSigningComplete)
    return (
      <Container className={"mt-5"}>
        <Logo size="md" suffixText={fundDetails?.name} />
        <Wrapper>
          <h4 className="mt-5 mb-4 ms-3">
          Thank You. We are reviewing your information and will reach out with next steps.
          </h4>
          <Link
            to={`${companyPrefix}`}
            className="btn btn-outline-primary btn-purple"
          >
            Back to Home Page
          </Link>
        </Wrapper>
      </Container>
    );

  // const hasWitness = witnesses && witnesses.length > 0
  return <Container className={'mt-5'}>
    <Logo size="md" suffixText={fundDetails?.name} />
    <div className={'mt-3'}>
    <StyledLink to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/application`}><ArrowBack /> Back to Application Overview</StyledLink>
    </div>
    <div className={'mt-3 d-flex justify-content-between align-items-center'}><h2>Subscription Documents</h2>
    {userInfo?.is_advisor && advisorSelected?.value && <Button>Send to Client</Button>}
    </div>
    {/*{!hasWitness && <h4>Please elect a witness to sign subscription documents</h4>}*/}
    <SideCarStyledTable className={'mt-5'}>
      <Table striped bordered hover>
        <thead>
        <tr>
          <th>Document Name</th>
          <th>Status</th>
        </tr>
        </thead>
        <tbody>
        {agreements.map((agreement: IApplicantAgreement) => {
          return <ApplicantAgreementDocument
            agreementDocument={agreement}
            key={agreement.id}
            setIsSubmitting={setIsSubmitting}
          />
        })}
        </tbody>
      </Table>

      {/*<div className={'mt-5'}><h2>Witness</h2></div>*/}
      {/*{hasWitness && <Table striped bordered hover>*/}
      {/*  <thead>*/}
      {/*  <tr>*/}
      {/*    <th>Name</th>*/}
      {/*    <th>Email</th>*/}
      {/*  </tr>*/}
      {/*  </thead>*/}
      {/*  <tbody>*/}
      {/*  {witnesses.map((witness: IApplicationWitness) => {*/}
      {/*    return <tr key={witness.id}>*/}
      {/*      <td>{witness.name}</td>*/}
      {/*      <td>{witness.email}</td>*/}
      {/*    </tr>*/}
      {/*  })}*/}
      {/*  </tbody>*/}
      {/*</Table>}*/}
    </SideCarStyledTable>
    {/*{!witnesses || witnesses.length === 0 && <div>*/}
    {/*  <WitnessForm setIsSubmitting={setIsSubmitting}/>*/}
    {/*</div>}*/}
  </Container>
};

export default hasKycPermission(AgreementsPage);
