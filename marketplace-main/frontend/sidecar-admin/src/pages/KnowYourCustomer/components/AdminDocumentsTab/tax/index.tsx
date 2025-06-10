import React, {FunctionComponent} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {selectApplicationInfo} from "../../../selectors";
import Col from "react-bootstrap/Col";
import {useAppDispatch, useAppSelector} from "../../../../../app/hooks";
import {useGetTaxDocumentOptionsQuery, useGetTaxDocumentsQuery} from "../../../../../api/rtkQuery/taxApi";
import TaxDocuments from "./taxDocuments";
import AddDocumentButton from "../AddDocumentButton";
import {getTaxFormOptions} from "./utils";
import API from "../../../../../api"
import {fetchApplicationInfo, fetchTaxFormsAdmin} from "../../../thunks";

interface AdminDocumentsProps {
}


const TaxInfo: FunctionComponent<AdminDocumentsProps> = () => {
  const applicationInfo = useAppSelector(selectApplicationInfo);
  const {data: taxDocumentOptions} = useGetTaxDocumentOptionsQuery()
  const dispatch = useAppDispatch()
  const {data: taxDocuments, refetch} = useGetTaxDocumentsQuery(
    applicationInfo?.tax_record,
    {skip: !applicationInfo || !applicationInfo.tax_record}
  );

  if (!applicationInfo || !taxDocumentOptions) return <></>

  const taxRecordId = applicationInfo.tax_record;

  const handleSave = async (payload: any) => {
    payload.append("application_id", applicationInfo.id.toString());
    payload.append("form_id", payload.get('field_id'));
    await API.createTaxDocument(payload);
    refetch()
    if (taxRecordId) dispatch(fetchTaxFormsAdmin(taxRecordId));
    dispatch(fetchApplicationInfo(applicationInfo.id))
  }


  return <Container className="page-container mb-4">
    <Row className={'mb-3'}>
      <Col md={6}>
        <h5>Tax Documents</h5>
      </Col>
      <Col md={6}>
        <AddDocumentButton onSave={handleSave} options={getTaxFormOptions(taxDocumentOptions)}/>
      </Col>
    </Row>
    {taxRecordId && <Row>
      <Col md={12}>
        <TaxDocuments
          taxDocuments={taxDocuments}
          taxRecordId={taxRecordId}
          refetchDocuments={refetch}
          applicationId={applicationInfo.id}
        />
      </Col>
    </Row>}

  </Container>
};

export default TaxInfo;
