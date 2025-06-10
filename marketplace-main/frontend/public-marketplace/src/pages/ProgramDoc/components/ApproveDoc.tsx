import { FunctionComponent, useState } from 'react';
import { useParams } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import API from "../../../api/marketplaceApi";
// import { Params } from "../../TaxForms/interfaces";
import FilePreviewModal from "../../../components/FilePreviewModal";
import ApprovalDropdown from "../../../components/FilePreviewModal/ApprovalDropdown";
import { useGetFundDetailsQuery } from 'api/rtkQuery/fundsApi';
import { logMixPanelEvent } from 'utils/mixpanel';
import { get } from 'lodash';


interface IApproveDocs {
  id: string;
  is_acknowledged: boolean;
  doc: any;
  callbackSubmit?: () => void;
}

const ApproveDocs: FunctionComponent<IApproveDocs> = ({  id, doc, is_acknowledged, callbackSubmit }) => {
  const [isEnable, setIsEnable] = useState(false);
  const { externalId } = useParams<any>();
  const {data: fundDetails} = useGetFundDetailsQuery(externalId, {
    skip: !externalId,
  });
  
  const updataFileStatus = (isAcknowledged: boolean) => {
    if (!externalId) return
    const formData = new FormData();
    formData.append('completed', 'true');
    formData.append('is_acknowledged', `${isAcknowledged}`);
    API.updateProgramDocs(externalId, id, formData).then(() => {
      if (callbackSubmit) callbackSubmit();
    });
    logMixPanelEvent('Acknowledged approval document', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
  }

  return (
    <Row className={'mt-2'}>
      <Col md={12}>
        <FilePreviewModal
          documentId={`${doc.document.document_id}`}
          documentName={doc.document.title}
          callbackDownloadFile={() => setIsEnable(true)}
        >
          <ApprovalDropdown
            document={{ ...doc.document, document_name: doc.document.title }}
            value={is_acknowledged}
            disabled={!isEnable}
            onChange={(e: any) => updataFileStatus(e)}
          />
        </FilePreviewModal>
      </Col>
    </Row>
  )
}


export default ApproveDocs;