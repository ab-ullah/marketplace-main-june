import { FunctionComponent } from 'react';
import { useParams } from "react-router-dom";
import isEmpty from "lodash/isEmpty";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { DropzoneArea } from 'material-ui-dropzone';
import API from "../../../api/backendApi";
import { Params } from "../../TaxForms/interfaces";
import FilePreviewModal from "../../../components/FilePreviewModal";
import { SelectButton } from '../../KnowYourCustomer/styles';
import { useDeleteSignedProgramDocsMutation, useGetFundDetailsQuery } from "../../../api/rtkQuery/fundsApi";
import { AgreeDocumentBlock } from "../../EligibilityCriteria/styles";
import { logMixPanelEvent } from '../../../utils/mixpanel';
import { get } from 'lodash';

interface IWetSignDoc {
  id: string;
  doc: any;
  signedDoc: any;
  callbackSubmit?: () => void;
}

const MAX_FILE_SIZE = 25000000;

const WetSignDoc: FunctionComponent<IWetSignDoc> = ({ id, doc, signedDoc, callbackSubmit }) => {
  const [deleteSignedProgramDocs] = useDeleteSignedProgramDocsMutation()
  const { externalId } = useParams<Params>();
  const {data: fundDetails} = useGetFundDetailsQuery(externalId, {
    skip: !externalId,
  });

  const uploadFile = (file: File[]) => {
    if (isEmpty(file)) return;
    const formData = new FormData();
    formData.append('completed', 'true');
    formData.append('file_data', file[0]);
    API.updateProgramDocs(externalId, id, formData).then(() => {
      if (callbackSubmit) callbackSubmit();
    });
    logMixPanelEvent('Uploaded wet sign document', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))  
  }

  const handleDelete = (id: number) => {
    deleteSignedProgramDocs({documentId: id})
  }

  return (
    <>

      <Row className={'mt-2'}>
        <Col md={12}>
          <div className="d-inline-flex ms-3">
            <AgreeDocumentBlock>
              <FilePreviewModal
                documentId={`${doc.document.document_id}`}
                documentName={doc.document.title}
              >
                <>
                  {doc.document.title}
                </>
              </FilePreviewModal>
            </AgreeDocumentBlock>
          </div>
        </Col>
      </Row>
      <Row className={'mt-2'}>
        <Col md={12}>
          {signedDoc ? (
            <>
              <b>Signed {doc.document.title} Document:</b>
              <div className="d-inline-flex ms-3">
                <AgreeDocumentBlock>
                  <FilePreviewModal
                    documentId={`${signedDoc.document_id}`}
                    documentName={signedDoc.title}
                    handleDelete={()=> handleDelete(signedDoc.id)}
                  >
                    <>
                      {signedDoc.title}
                    </>
                  </FilePreviewModal>
                </AgreeDocumentBlock>
              </div>
            </>
          ) : (
            <>
              <p>Please upload the {doc.document.title} document</p>
              <DropzoneArea
                dropzoneText='Drag and drop your files here or click to upload'
                filesLimit={1}
                maxFileSize={MAX_FILE_SIZE}
                onChange={(file: File[]) => uploadFile(file)}
                showPreviewsInDropzone={true}
                showAlerts={true}
                clearOnUnmount={true}
                Icon={Icon as any}
              />
            </>
          )}
        </Col>
      </Row>

    </>);
}

const Icon = () => <SelectButton>Select</SelectButton>;

export default WetSignDoc;