import React, {FunctionComponent, useEffect} from 'react';
import {useHistory, useParams} from "react-router-dom";

import API from "../../api";
import {INVESTOR_URL_PREFIX} from "../../constants/routes";
import Container from "react-bootstrap/Container";
import NavableLoader from "../../components/NavableLoader";
import Logo from "../../components/Logo";
import {useGetFundDetailsQuery} from "../../api/rtkQuery/fundsApi";
import { get } from 'lodash';
import { logMixPanelEvent } from '../../utils/mixpanel';
import { useCompanyPrefix } from '../../utils/hooks';


interface StoreUserResponseProps {
}


const StoreUserResponse: FunctionComponent<StoreUserResponseProps> = () => {
  const {envelopeId, externalId} = useParams<{ envelopeId: string, externalId: string }>();
  const {companyPrefix} =useCompanyPrefix()
  const history = useHistory();
  const {data: fundDetails} = useGetFundDetailsQuery(externalId);


  const storeUserResponse = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event = urlParams.get("event");
    if (envelopeId && event === "signing_complete") {
      await API.storeUserResponse(envelopeId)
      history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/agreements`);
      logMixPanelEvent('Signed agreement document', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
    }
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

export default StoreUserResponse;
