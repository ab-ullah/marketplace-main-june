import {useState} from "react";
import find from "lodash/find";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import {useDeleteCompanyProfileMutation, useGetCompanyInfoQuery} from "../../api/rtkQuery/companyApi";
import RsuiteTable from "../Table/RSuite";
import DocumentForm from "./DocumentForm";
import {getColumns} from "./config";
import {DocumentFormDiv, ProgramDocumentDiv, StyledModal, TableContainer} from "./styles";
import AddIcon from "@material-ui/icons/Add";
import {AddDocumentButton} from "../../pages/Companies/Details/styles";

const Documents = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [documentDetails, setDocumentDetails] = useState<any>({});
  const {data: companyInfo} = useGetCompanyInfoQuery({});
  const [deleteCompanyProfile] = useDeleteCompanyProfileMutation();

  const showDocDetails = (docId: any) => {
    const data = find(companyInfo.company_required_documents, (doc) => doc.id === docId);
    setDocumentDetails(data);
    setShowModal(true);
  }

  const handleHideModal = () => {
    setShowModal(false);
    setDocumentDetails({});
  }

  return (
    <>
      <div>
        <Row className={'m-0'}>
          <Col md={6}  className={'p-0'}>
            <ProgramDocumentDiv>
              <div className={'heading'}>Program Documents</div>
              <div className={'subtitle'}>Add program documents your investor will sign during onboarding</div>
            </ProgramDocumentDiv>
          </Col>
          <AddDocumentButton md={6}>
            <div onClick={() => setShowModal(true)} className={'add-document-button'}>
              <div><AddIcon/></div><div className={'button-text'}>Add Program Document</div>
            </div>
          </AddDocumentButton>
        </Row>
      </div>
      <TableContainer>
        <RsuiteTable
          height="500px"
          allowColMinWidth={false}
          wordWrap={true}
          rowSelection={false}
          columns={getColumns(showDocDetails, deleteCompanyProfile)}
          data={companyInfo?.company_required_documents}
        />
      </TableContainer>
      <StyledModal size={'lg'} show={showModal} onHide={handleHideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Program Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showModal && <DocumentFormDiv>
            <DocumentForm data={documentDetails} closeModal={handleHideModal}/>
          </DocumentFormDiv>
          }
        </Modal.Body>
      </StyledModal>

    </>
  )
};

export default Documents;
