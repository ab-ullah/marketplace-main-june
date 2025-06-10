import React, {FunctionComponent, useEffect} from 'react';
import {useNavigate, useParams} from "react-router-dom";

import API from "../../api/marketplaceApi";
import Container from "react-bootstrap/Container";
import NavableLoader from "../../components/NavableLoader";
import {useGetFundDetailsQuery} from "../../api/rtkQuery/fundsApi";
import { PageWrapper } from 'components/Page';
import { logMixPanelEvent } from 'utils/mixpanel';
import { get } from 'lodash';


interface StoreDocuSignRespProps {
}


const StoreDocuSignResp: FunctionComponent<StoreDocuSignRespProps> = () => {
  const {envelopeId, fundSlug, viewType, company} = useParams<{ envelopeId: string, fundSlug: string, viewType: string, company: string }>();
  const history = useNavigate();
  const {data: fundDetails} = useGetFundDetailsQuery(fundSlug);


  const storeUserResponse = async () => {
    if(!fundSlug) return
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event = urlParams.get("event");
    if (envelopeId && event === "signing_complete")
      await API.saveProgramDocsSigningUrl(fundSlug, envelopeId);
    if(viewType === "onboarding")
      history(`/${company}/funds/${fundSlug}/program_doc`);
    else
      history(`${company}/funds/${fundSlug}/application`);
    logMixPanelEvent('Signed program document', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
  }

  useEffect(() => {
    storeUserResponse()
  }, [])

  return <PageWrapper> <Container className={'mt-5 ps-5 pe-5'}>
    <h4 className={'mt-3'}>Please wait while we store your response</h4>
    <NavableLoader/>
  </Container>
  </PageWrapper>
};

export default StoreDocuSignResp;
