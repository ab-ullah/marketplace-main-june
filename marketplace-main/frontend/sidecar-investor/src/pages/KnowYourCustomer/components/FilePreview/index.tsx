import React, { FunctionComponent, useState } from 'react';
import API from "../../../../api";
import Modal from "react-bootstrap/Modal";
import { Document, Page, pdfjs } from 'react-pdf';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { CloseButton, FileName, ModalContainer, PDFContainer, PreviewContainer } from './styles';

interface Props {
  title: string;
  questionId: string;
  documentName: string;
  documentId: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const FilePreviewModal: FunctionComponent<Props> = ({ documentName, title, questionId, documentId }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [numPages, setNumPages] = useState(null);

  const onHide = () => setShowPreview(false);

    // @ts-ignore
    function onDocumentLoadSuccess({ numPages }) {
      setNumPages(numPages);
    }

  const cacheDocument = async () => {
    const { fileURL, fileType } = await API.getKYCDocumentAsDataURI(documentId);
    setFileType(fileType);
    setFileUrl(fileURL);
  }
  const onOpenClick = async () => {
    if (!fileUrl) cacheDocument();
    setShowPreview(true);
  }

  const getPreview = () => {
    if (fileType.startsWith("image/")) {
      return <img src={fileUrl} alt={title} />;
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

  return <>
    <OpenInNewIcon onClick={onOpenClick} /><FileName onClick={onOpenClick}>{documentName}</FileName>
    <ModalContainer size={'lg'} show={showPreview} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='inspectlet-sensitive'>
        {fileType && (
          <PreviewContainer> 
            {getPreview()}
        </PreviewContainer>)}
        {!fileUrl && <PreviewContainer><span>Loading...</span></PreviewContainer>}
        <CloseButton onClick={onHide}>Close </CloseButton>
      </Modal.Body>
    </ModalContainer>
  </>
};

export default FilePreviewModal;
