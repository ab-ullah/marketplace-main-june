import { FunctionComponent, useState } from "react";
import truncate from "lodash/truncate";
import Modal from "react-bootstrap/Modal";
import { Document, Page, pdfjs } from 'react-pdf';
// import PreviewIcon from "@material-ui/icons/VisibilityOutlined";
import API from "../../api";
// import DownloadIcon from "../../assets/images/download.svg";
import DeleteIcon from "../../assets/images/delete-icon.svg";

import {
  ButtonWrapper,
  CloseButton,
  ModalContainer,
  PreviewContainer,
  ModalFooter
} from "./styles";
import { PDFContainer } from "../../pages/KnowYourCustomer/components/FilePreview/styles";
import DownloadIconRound from "../../assets/react-icons/DownloadIconRound";
import PreviewIcon from "../../assets/react-icons/PreviewIcon";

interface IFilePreviewModalProps {
  documentId: string;
  documentName: string;
  showPreviewIcon?: boolean;
  handleDelete?: () => void;
  showDownloadIcon?: boolean;
  callbackPreviewFile?: () => void;
  callbackDownloadFile?: () => void;
  showAsButton?: boolean;
  dotted?:boolean
}

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const FilePreviewModal: FunctionComponent<IFilePreviewModalProps> = ({
  documentId,
  documentName,
  showPreviewIcon,
  showDownloadIcon,
  callbackPreviewFile,
  callbackDownloadFile,
  handleDelete,
  children,
  showAsButton,
  dotted
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [numPages, setNumPages] = useState(null);

  const onHide = () => setShowPreview(false);

  // @ts-ignore
  function onDocumentLoadSuccess({ numPages }) {
      setNumPages(numPages);
    }

  const cacheDocument = async () => {
    try {
      if (documentId) {
        const { fileURL, fileType } = await API.getKYCDocumentAsDataURI(
          documentId
        );
        setFileType(fileType);
        setFileUrl(fileURL);
        callbackPreviewFile && callbackPreviewFile();
      }
    } catch (e) {
      callbackPreviewFile && callbackPreviewFile();
    }
  };
  const onOpenClick = () => {
    if (!fileUrl) cacheDocument();
    setShowPreview(true);
  };

  const handleDownloadDocument = async () => {
    await API.downloadDocument(documentId, documentName);
    callbackDownloadFile && callbackDownloadFile();
  };

  const onDelete = (e: any) => {
    e.stopPropagation();
    if (handleDelete) handleDelete();
  };

  const docName = truncate(documentName, { length: 40 });

  const getPreview = () => {
    if (fileType.startsWith("image/")) {
      return <img src={fileUrl} alt={docName} />;
    } else if (fileType === "application/pdf") {
      return (
        <>
          <PDFContainer>
            <Document
              file={`data:application/pdf;base64,${
                fileUrl.split("base64,")[1]
              }`}
              options={{
                standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
              }}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page renderTextLayer={false} key={`page_${index + 1}`} pageNumber={index + 1}  width={720}/>
              ))}
            </Document>
          </PDFContainer>
        </>
      );
    } else
      return (
        <object
          data={fileUrl + "#toolbar=0&navpanes=0&scrollbar=0"}
          type={fileType}
        >
          <span>Unable to display file on this browser.</span>
        </object>
      );
  };

  return (
    <>
      <ButtonWrapper>
        {showDownloadIcon && (<DownloadIconRound onClick={handleDownloadDocument} style={{cursor:'pointer'}}/>)}
        {showAsButton && <div className="file-tag" onClick={onOpenClick}>
          {children || <span className={`${dotted ?'doc-namme':''}`}>{docName}</span>}
          {showPreviewIcon && (
              <>
                &nbsp;
                <PreviewIcon />
              </>
          )}
        </div>}
        {!showAsButton && <span onClick={onOpenClick} className={`${dotted ?'doc-namme':''}`}>{docName}</span>}
        {handleDelete && (
          <img src={DeleteIcon} onClick={onDelete} alt="Delete" title="Delete" />
        )}
      </ButtonWrapper>
      <ModalContainer size={"lg"} show={showPreview} onHide={onHide}>
        <Modal.Header>
          <Modal.Title>{docName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="inspectlet-sensitive">
          {fileType && (
            <PreviewContainer>
               {getPreview()}
            </PreviewContainer>
          )}
          {!fileUrl && (
            <PreviewContainer>
              <span>Loading...</span>
            </PreviewContainer>
          )}
        </Modal.Body>
        <ModalFooter>
          <CloseButton onClick={handleDownloadDocument}>Download</CloseButton>
          <CloseButton onClick={onHide}>Close</CloseButton>
        </ModalFooter>
      </ModalContainer>
    </>
  );
};

FilePreviewModal.defaultProps = {
  showAsButton: true,
  showDownloadIcon: true,
  showPreviewIcon: true,
  callbackPreviewFile: () => {},
  callbackDownloadFile: () => {},
  dotted: true
};

export default FilePreviewModal;
