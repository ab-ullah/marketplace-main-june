import React, {FunctionComponent, useEffect} from 'react';
import {useHistory, useParams} from "react-router-dom";

import API from "../../api/backendApi";
import {INVESTOR_URL_PREFIX} from "../../constants/routes";
import Container from "react-bootstrap/Container";
import NavableLoader from "../../components/NavableLoader";
import Logo from "../../components/Logo";
import {useGetFundDetailsQuery} from "../../api/rtkQuery/fundsApi";
import { logMixPanelEvent } from '../../utils/mixpanel';
import { get } from 'lodash';
import { useCompanyPrefix } from '../../utils/hooks';


interface StoreDocuSignRespProps {
}


const StoreDocuSignResp: FunctionComponent<StoreDocuSignRespProps> = () => {
  const {envelopeId, fundSlug, viewType} = useParams<{ envelopeId: string, fundSlug: string, viewType: string }>();
  const {companyPrefix} =useCompanyPrefix()
  const history = useHistory();
  const {data: fundDetails} = useGetFundDetailsQuery(fundSlug);


  const storeUserResponse = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event = urlParams.get("event");
    if (envelopeId && event === "signing_complete")
      await API.saveProgramDocsSigningUrl(fundSlug, envelopeId);
    if(viewType === "onboarding")
      history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${fundSlug}/program_doc`);
    else
      history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${fundSlug}/application`);
    logMixPanelEvent('Signed program document', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
  }

  useEffect(() => {
    storeUserResponse()
  }, [])

  return <Container className={'mt-5 ps-5 pe-5'}>
    <Logo size="md" suffixText={fundDetails?.name} />
    <h4 className={'mt-3'}>Please wait while we store your response</h4>
    <NavableLoader/>
  </Container>
};

export default StoreDocuSignResp;
