import React, {FunctionComponent, useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import API from "../../../../api";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import {IRequesterInfo} from "../../../../interfaces/Agreement/agreementDocuments";
import NavableLoader from "../../../../components/NavableLoader";
import Logo from "../../../../components/Logo";
import { useCompanyPrefix } from '../../../../utils/hooks';


interface InitiateWitnessSigningProps {
}


const InitiateWitnessSigning: FunctionComponent<InitiateWitnessSigningProps> = () => {
  const [requesterInfo, setRequesterInfo] = useState<IRequesterInfo | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {uuid, envelopeId} = useParams<{ uuid: string, envelopeId: string }>();
  const {companyPrefix} =useCompanyPrefix()
  
  const getSigningUrl = async () => {
    setIsSubmitting(true)
    const {protocol, host} = window.location;
    const return_url = encodeURIComponent(
      `${protocol}//${host}${companyPrefix}/${INVESTOR_URL_PREFIX}/witness/${uuid}/submit/${envelopeId}`
    );
    const response = await API.getWitnessAgreementsSigningUrl(uuid, envelopeId, return_url);
    window.open(response.signing_url, "_self");
    return response;
  };

  const getRequesterInfo = async () => {
    const response = await API.getWitnessRequesterInfo(uuid)
    setRequesterInfo(response)
  }


  useEffect(() => {
    getRequesterInfo()
  }, [])

  if (!requesterInfo || isSubmitting) return <NavableLoader/>

  if (requesterInfo.completed) return <Container className={'mt-5 ps-5 pe-5'}>
    <h4>Looks like you have already signed your document</h4>
  </Container>

  return <Container className={'mt-5 ps-5 pe-5'}>
    <Logo size="md"/>
    <h4 className={'mt-4'}>{requesterInfo?.first_name} {requesterInfo?.last_name} has requested that you electronically sign the following
      document as their witness.
    </h4>
    <Button variant={'outline-primary'} className={'mt-5'} onClick={getSigningUrl}>Sign Now</Button>

  </Container>
};

export default InitiateWitnessSigning;
