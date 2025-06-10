import React, {FunctionComponent, useMemo} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {selectApplicationInfo} from "../../../selectors";
import Col from "react-bootstrap/Col";
import {useAppDispatch, useAppSelector} from "../../../../../app/hooks";
import AddDocumentButton from "../AddDocumentButton";
import {getCompanyDocumentOptions} from "./utils";
import API from "../../../../../api"
import {fetchApplicationInfo} from "../../../thunks";
import {
  useFetchExistingAndDeletedProgramDocsQuery,
  useFetchProgramDocsQuery
} from "../../../../../api/rtkQuery/fundsApi";
import ApplicationProgramDocuments from "./applicationProgramDocuments";
import {useGetCompanyDocumentOptionsQuery} from "../../../../../api/rtkQuery/companyApi";

interface AdminDocumentsProps {
}


const ProgramDocuments: FunctionComponent<AdminDocumentsProps> = () => {
  const applicationInfo = useAppSelector(selectApplicationInfo);
  const applicationId = applicationInfo?.id;
  const {data: applicationProgramDocuments, refetch} = useFetchExistingAndDeletedProgramDocsQuery(applicationId, {
    skip: !applicationId,
  });
  const {data: companyDocumentOptions} = useGetCompanyDocumentOptionsQuery()
  const dispatch = useAppDispatch()

  if (!applicationInfo || !applicationProgramDocuments || !companyDocumentOptions) return <></>

  const handleSave = async (payload: any) => {
    payload.append("application_id", applicationInfo.id.toString());
    payload.append("company_document_id", payload.get('field_id'));
    await API.createApplicationProgramDocument(applicationInfo.id, payload);
    refetch()
    dispatch(fetchApplicationInfo(applicationInfo.id))
  }


  return <Container className="page-container mb-4">
    <Row className={'mb-3'}>
      <Col md={6}>
        <h5>Program Documents</h5>
      </Col>
      <Col md={6}>
        <AddDocumentButton onSave={handleSave} options={companyDocumentOptions}/>
      </Col>
    </Row>
    {applicationId && <Row>
      <Col md={12}>
        <ApplicationProgramDocuments
          applicationProgramDocuments={applicationProgramDocuments}
          refetchDocuments={refetch}
          applicationId={applicationInfo.id}
        />
      </Col>
    </Row>}

  </Container>
};

export default ProgramDocuments;
