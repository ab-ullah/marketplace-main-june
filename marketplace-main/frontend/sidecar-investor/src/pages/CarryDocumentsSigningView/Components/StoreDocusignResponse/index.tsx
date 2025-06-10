import React, {FunctionComponent, useEffect} from 'react';
import {useHistory, useParams} from "react-router-dom";

import Container from "react-bootstrap/Container";
import {useCompanyPrefix} from "../../../../utils/hooks";
import NavableLoader from "../../../../components/NavableLoader";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import API from '../../../../api/backendApi'


interface StoreDocuSignRespProps {
}


const StoreDocuSignResp: FunctionComponent<StoreDocuSignRespProps> = () => {
    const {envelopeId} = useParams<{ envelopeId: string}>();
    const {companyPrefix} =useCompanyPrefix()
    const history = useHistory();


    const storeUserResponse = async () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const event = urlParams.get("event");
        if (envelopeId && event === "signing_complete"){
            await API.saveCarryDocsSigningUrl(envelopeId);
            history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/carry-plans/documents/signature`);
        }
    }

    useEffect(() => {
        storeUserResponse()
    }, [])

    return <Container className={'mt-5 ps-5 pe-5'}>
        <h4 className={'mt-3'}>Please wait while we store your response</h4>
        <NavableLoader/>
    </Container>
};

export default StoreDocuSignResp;
