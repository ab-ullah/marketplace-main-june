import React, { FunctionComponent, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";

import Container from "react-bootstrap/Container";
import API from "../../../../../../api/backendApi";
import NavableLoader from "../../../../../../components/NavableLoader";

interface StoreDocuSignRespProps {}

const StoreDocuSignResp: FunctionComponent<StoreDocuSignRespProps> = () => {
  const { envelopeId } = useParams<{ envelopeId: string }>();
  const history = useHistory();

  const storeUserResponse = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event = urlParams.get("event");
    if (envelopeId && ["signing_complete","viewing_complete"].includes(event as string) ) {
      await API.saveCarryDocsSigningUrl(envelopeId);
      history.push(`/admin/carryManagement?tab=documents`);
    }
  };

  useEffect(() => {
    storeUserResponse();
  }, []);

  return (
    <Container className={"ps-5 pe-5"} style={{marginTop:'10rem'}}>
      <h4 className={"mt-3"} style={{textAlign:'center'}}>Please wait while we store your response</h4>
      <NavableLoader />
    </Container>
  );
};

export default StoreDocuSignResp;
