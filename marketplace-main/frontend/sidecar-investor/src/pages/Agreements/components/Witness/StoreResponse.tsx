import React, {FunctionComponent, useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import API from "../../../../api";
import Container from "react-bootstrap/Container";
import {IRequesterInfo} from "../../../../interfaces/Agreement/agreementDocuments";
import NavableLoader from "../../../../components/NavableLoader";
import Logo from "../../../../components/Logo";


interface StoreWitnessResponseProps {
}


const StoreWitnessResponse: FunctionComponent<StoreWitnessResponseProps> = () => {
  const [requesterInfo, setRequesterInfo] = useState<IRequesterInfo | null>(null)
  const {uuid, envelopeId} = useParams<{ uuid: string, envelopeId: string }>();

  const storeResponse = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event = urlParams.get("event");
    if (envelopeId && event === "signing_complete") {
      await API.storeWitnessResponse(uuid, envelopeId)
      await getRequesterInfo()
    }
  };

  const getRequesterInfo = async () => {
    const response = await API.getWitnessRequesterInfo(uuid)
    setRequesterInfo(response)
  }


  useEffect(() => {
    storeResponse()
  }, [])

  if (!requesterInfo) return <Container className={'mt-5 ps-5 pe-5'}>
    <Logo size="md"/>
    <h4 className={'mt-4'}>Please wait while we store your response</h4>
    <NavableLoader/>
  </Container>

  if (!requesterInfo.completed) return <h4>We are unable to process your response, please
    inform {requesterInfo.first_name}</h4>

  return <Container className={'mt-5 ps-5 pe-5'}>
    <Logo size="md"/>
    <h4 className={'mt-4'}>Thank you for signing, we have let {requesterInfo.first_name} know that their document has been witnessed and
      electronically signed by you.
    </h4>

  </Container>
};

export default StoreWitnessResponse;
