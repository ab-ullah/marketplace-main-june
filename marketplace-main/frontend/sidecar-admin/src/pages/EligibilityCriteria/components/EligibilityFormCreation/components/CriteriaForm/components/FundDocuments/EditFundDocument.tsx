import React, { FC, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import API from '../../../../../../../../api/index'
import DocumentDropZone from '../../../../../../../../components/FileUpload';
import { IFund } from '../../../../../../../Funds/interfaces';
import NavableLoader from '../../../../../../../../components/NavableLoader';
import { IFundBaseInfo } from '../../../../../../../../interfaces/fundDetails';

interface IEditFundDocumentProps {
    fundDocument: any;
    fund: IFund | IFundBaseInfo | null;
    handleClose: () => void
}

const FILE_UPLOAD_ERROR_MESSAGE = "Unable to update document. Please try again"

const EditFundDocument: FC<IEditFundDocumentProps> = ( { fund, fundDocument, handleClose }) => {
    const [fileUploadError, setFileUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const handleUpdateDocument = async (fileData: any) => {
        if(!fundDocument || !fund) return;
        setFileUploadError(null);
        setIsUploading(true)
        try {
            const formData = new FormData();
            formData.append("title", fileData.name);
            formData.append("fund_external_id", fund.external_id);
            formData.append("document_file", fileData);
            formData.append("replaces", fundDocument.id);
            await API.uploadFundsDocuments(fund.external_id, formData);
            setIsUploading(false)
            handleClose()
        }
        catch (e) {
            console.log("errors out", e)
            setIsUploading(false)
            setFileUploadError(FILE_UPLOAD_ERROR_MESSAGE)
        }
    }

    if(isUploading) return <NavableLoader />

    return <>
        <Row>
            <Col>
            <h4>Select document to replace {fundDocument.document_name}</h4>
            <p className='text-danger'>This document will only be visible for the new applications</p>
            <DocumentDropZone onFileSelect={handleUpdateDocument} disabled={false} />
            <p className='text-danger'>{fileUploadError}</p>
            </Col>
        </Row>
    </>
}

export default EditFundDocument;