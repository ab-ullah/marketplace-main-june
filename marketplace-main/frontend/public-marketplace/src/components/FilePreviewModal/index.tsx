import { FunctionComponent, useState } from "react";
import truncate from "lodash/truncate";
import Modal from "react-bootstrap/Modal";
import { Document, Page, pdfjs } from 'react-pdf';
// import PreviewIcon from "@material-ui/icons/VisibilityOutlined";
import API from "../../api/marketplaceApi";
// import DownloadIcon from "../../assets/images/download.svg";
import DeleteIcon from "../../assets/images/delete-icon.svg";
import {
  ButtonWrapper,
  CloseButton,
  ModalContainer,
  PreviewContainer,
  ModalFooter,
DownloadIcon,
PreviewIcon
} from "./styles";
import { PDFContainer } from "../../pages/KnowYourCustomer/components/FilePreview/styles";
import Button from 'components/Button/ThemeButton'

interface IFilePreviewModalProps {
  documentId: string;
  documentName: string;
  showPreviewIcon?: boolean;
  handleDelete?: () => void;
  callbackPreviewFile?: () => void;
  callbackDownloadFile?: () => void;
  children: any;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const FilePreviewModal: FunctionComponent<IFilePreviewModalProps> = ({
  documentId,
  documentName,
  showPreviewIcon,
  callbackPreviewFile,
  callbackDownloadFile,
  handleDelete,
  children,
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
        // @ts-ignore
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
        {/* <img
          className="download-icon"
          src={DownloadIcon}
          onClick={handleDownloadDocument}
          alt="Download"
          title="Download"
        /> */}
        <DownloadIcon  onClick={handleDownloadDocument} sx={{fill: 'primary.main !important'}}/>
        <div className="file-tag" onClick={onOpenClick} >
          {children || <span className="doc-name">{docName}</span>}
          {showPreviewIcon && (
            <>
              &nbsp;
              <PreviewIcon />
            </>
          )}
        </div>
        {handleDelete && (
          <img src={DeleteIcon} onClick={onDelete} alt="Delete" title="Delete" />
        )}
      </ButtonWrapper>
      <ModalContainer size={"lg"} show={showPreview} onHide={onHide}>
        <Modal.Header>
          <Modal.Title>{docName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        <Button size='sm' onClick={handleDownloadDocument}>
						Download
					</Button>
					<Button size='sm' onClick={onHide}>
						Close
					</Button>
        </ModalFooter>
      </ModalContainer>
    </>
  );
};

FilePreviewModal.defaultProps = {
  showPreviewIcon: true,
  callbackPreviewFile: () => {},
  callbackDownloadFile: () => {},
};

export default FilePreviewModal;
