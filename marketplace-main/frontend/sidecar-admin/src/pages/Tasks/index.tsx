import React, {FunctionComponent, useEffect, useState} from 'react';
import {TasksPageContainer} from "./styles";
import Footer from "../../components/Footer";
import TasksTable from "./components/CompletedTasksTable";
import API from "../../api/backendApi";
import NavableLoader from "../../components/NavableLoader";

interface TasksPageProps {
}


const TasksPage: FunctionComponent<TasksPageProps> = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const storeUserResponse = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event = urlParams.get("event");
    const envelopeId = urlParams.get("envelope_id");

    if (envelopeId && event === "signing_complete") {
      setIsLoading(true)
      const document_type = urlParams.get("document_type");
      const fund_external_id = urlParams.get("fund_external_id");
      if (document_type === 'agreement') {
        await API.storeUserResponse(envelopeId);
      }
      else if (document_type == 'company_document' && fund_external_id) {
        await API.storeCompanyDocumentUserResponse(fund_external_id, envelopeId);
      }
      setIsLoading(false)
    }
  }

  useEffect(() => {
    storeUserResponse()
  }, [])

  if (isLoading) return <TasksPageContainer fluid className={'p-0'}>
    <NavableLoader/>
  </TasksPageContainer>

  return <>
    <TasksPageContainer fluid className={'p-0'}>
      <h4>Tasks</h4>
      <TasksTable setIsLoading={setIsLoading}/>
    </TasksPageContainer>
    <Footer/>
  </>
};

export default TasksPage;
