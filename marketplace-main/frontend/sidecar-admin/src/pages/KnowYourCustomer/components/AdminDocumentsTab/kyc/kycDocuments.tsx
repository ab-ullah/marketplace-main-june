import React, {FunctionComponent, useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  useGetKYCDocumentOptionsQuery,
  useUpdateKYCDocumentFieldsMutation,
  useUpdateKycDocumentMutation
} from "../../../../../api/rtkQuery/kycApi";
import RsuiteTable from "../../../../../components/Table/RSuite";
import {getDocumentTableColumns} from "./utils";
import {IKycRecord} from "../../../../../interfaces/kycRecord";
import NavableLoader from "../../../../../components/NavableLoader";
import {DocumentsTableCol} from "../styles";
import size from "lodash/size";
import AddDocumentButton from "./AddDocumentButton";
import API from "../../../../../api"
import get from "lodash/get";
import {ID_DOC_IMAGE_VALUE, showExpirationDate} from "./constants";
import {standardizeDateForApi} from "../../../../../utils/dateFormatting";


interface AdminDocumentsProps {
  kycRecord: IKycRecord
  refetchKycDocuments: () => void
  refetchKycRecord: () => void
}


const KycWithDocuments: FunctionComponent<AdminDocumentsProps> = ({
                                                                    kycRecord,
                                                                    refetchKycDocuments,
                                                                    refetchKycRecord
                                                                  }) => {
  const [loading, setLoading] = useState(false)
  const [updateKycDocument] = useUpdateKycDocumentMutation()
  const [updateKycDocumentFields] = useUpdateKYCDocumentFieldsMutation()
  const {data: kycDocumentOptions} = useGetKYCDocumentOptionsQuery()


  const performDocumentUpdate = async (documentId: number, payload: any) => {
    setLoading(true)
    await updateKycDocument({kycRecordId: kycRecord.id, kycDocumentId: documentId, ...payload})
    setLoading(false)
  }

  const handleSave = async (values: any) => {
    const formData = new FormData();
    if (values.file_data) {
      formData.append("file_data", values.file_data);
      formData.append("field_id", get(values.field_id, "value"));
      formData.append("record_id", kycRecord.id.toString());
      await API.createKycDocument(kycRecord.id, formData);
    }

    if (get(values.field_id, "value") === ID_DOC_IMAGE_VALUE) {
      const payload: any = {
        id_document_type: values.id_document_type,
        uuid: kycRecord.uuid
      }
      if (values.id_issuing_country) payload.id_issuing_country = values.id_issuing_country
      if (values.number_of_id) payload.number_of_id = values.number_of_id

      if (showExpirationDate(values.id_document_type)) {
        if (values.id_expiration_date) payload.id_expiration_date = standardizeDateForApi(values.id_expiration_date)
      } else {
        payload.id_expiration_date = null;
      }
      await updateKycDocumentFields(payload)
    }

    refetchKycDocuments()
    refetchKycRecord()
  }

  if (loading) return <NavableLoader/>
  if (!kycDocumentOptions) return <></>

  const numDocuments = size(kycRecord.kyc_documents)
  return <>

    <Container className="page-container mb-4">
      <Row className={'mb-3'}>
        <Col md={6}>
          <h5>KYC Record: <i>{kycRecord.display_name}</i></h5>
        </Col>
        <Col md={6}>
          <AddDocumentButton
            onSave={handleSave}
            options={kycDocumentOptions.options}
            kycRecord={kycRecord}
          />
        </Col>
      </Row>
      {numDocuments > 0 && <Row>
        <DocumentsTableCol md={12}>
          <RsuiteTable
            height={`auto`}
            autoHeight={true}
            allowColMinWidth={true}
            wordWrap={true}
            rowSelection={false}
            columns={getDocumentTableColumns(performDocumentUpdate, kycDocumentOptions?.mapping)}
            data={kycRecord.kyc_documents}
          />
        </DocumentsTableCol>
      </Row>}
    </Container>
  </>
};

export default KycWithDocuments;
