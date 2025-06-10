import React, {FunctionComponent, useEffect} from 'react';
import OpportunitiesList from "./components/OpportunitiesList";
import OpportunitiesHeader from "./components/Header";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FAQSection from "./components/Faqs";
import styled from "styled-components";
import CompanyStats from "./components/Stats";
import ContactInfo from "../../components/Contact";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {getCompanyProfile} from "../CompanyInfo/thunks";
import {selectCompany} from "../CompanyInfo/selectors";
import HelpBlocks from "../../components/HelpBlocks";
import LoggedInFooter from "../../components/Footer";
import {useParams} from "react-router-dom";

const FaqCol = styled(Col)`
  padding: 56px;
`

const OpportunityCol = styled(Col)`
  padding: 40px 50px;
  background: #ECEFF1;
`

const OpportunitiesHeading = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
`

const OpportunitiesDescription = styled.div`
  font-family: Quicksand;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.02em;
  color: #020203;
  margin: 24px 0;
`


interface OpportunitiesProps {
}


const Opportunities: FunctionComponent<OpportunitiesProps> = () => {
  const {companySlug} = useParams<{ companySlug: string }>();
  const dispatch = useAppDispatch()
  const company = useAppSelector(selectCompany);
  useEffect(() => {
    dispatch(getCompanyProfile(companySlug))
  }, [])

  if (!company) return <></>

  const companyProfile = company.company_profile;
  return <>
    <OpportunitiesHeader company={company}/>
    <Row>
      <FaqCol md={6}>
        <FAQSection faqs={company.company_faqs}/>
      </FaqCol>
      <FaqCol md={6}>
        <CompanyStats stats={companyProfile?.stats}/>
      </FaqCol>
    </Row>
    <Row>
      <OpportunityCol md={12}>
        <OpportunitiesHeading>Investment opportunities</OpportunitiesHeading>
        <OpportunitiesDescription>{companyProfile?.opportunities_description}</OpportunitiesDescription>
        <OpportunitiesList/>
      </OpportunityCol>
    </Row>
    <HelpBlocks/>
    <ContactInfo email={companyProfile?.contact_email}/>
    <LoggedInFooter/>
  </>
};

export default Opportunities;
