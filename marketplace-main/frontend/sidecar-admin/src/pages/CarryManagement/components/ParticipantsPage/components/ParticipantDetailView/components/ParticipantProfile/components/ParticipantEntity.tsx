import React, { useState, FC } from 'react';
import API from '../../../../../../../../../api/backendApi';
import { Row, Col } from 'react-bootstrap';
import { CustomButton, DocumentWrapper, ParticipantCard, UndeleteDocBtn } from '../styles';
import { Add, Edit } from '@material-ui/icons';
import DetailRow from './DetailsRow';
import EntityParticipant from './EntityParticipant';
import EditEntity from './Modals/EditEntity';
import EditEntityDocuments from './Modals/EditEntityDocument';
import { get } from 'lodash';
import DeleteIcon from '../../../../../../../../../assets/images/delete-icon.svg';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import FilePreviewModal from '../../../../../../../../../components/FilePreviewModal';
import { ENTITY_TYPE_MAPPINGS } from '../../../../../../../../KnowYourCustomer/constants';
import { useUpdateKYCDocumentFieldsMutation, useUpdateKycDocumentMutation } from '../../../../../../../../../api/rtkQuery/kycApi';
import { standardizeDate } from '../../../../../../../../../utils/dateFormatting';

const ParticipantEntity: FC<any> = ({
    record,
    countries,
    refetchData
}) => {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditDocumentsModalOpen, setIsEditDocumentsModalOpen] = useState(false);
    const [updateKycDocumentFields] = useUpdateKYCDocumentFieldsMutation()
    const [updateKycDocument] = useUpdateKycDocumentMutation()
    const Jurisdiction = get(record, 'jurisdiction')?.name;
    const stateRegionLabel = get(record, 'home_state') ? "State" : "Region";
    const stateRegion = get(record, 'home_state') ? get(record, 'home_state') : get(record, 'home_region')

    const onEditEntity = async (values: any) => {
        await updateKycDocumentFields({
            ...values,
            uuid: record.uuid
        })
        refetchData();
        setIsEditModalOpen(false)
    }

    const onAddKycDocument = async (values: any) => {
        const formData = new FormData();
        if (values.file) {
            formData.append("file_data", values.file);
            formData.append("field_id", get(values, 'field_id.value'));
            formData.append("record_id", record.id.toString());
            await API.createKycDocument(record.id, formData);
            refetchData();
            setIsEditDocumentsModalOpen(false);
        }
    }

    const onDeleteKycDocument = async (documentId: any, payload: any) => {
        await updateKycDocument({kycRecordId: record.id, kycDocumentId: documentId, ...payload})
        refetchData();
    }

    return <>
        <div className='header'>
            <h3>{get(record, 'first_name')}'s Entity</h3>
            <CustomButton 
            variant="outline-primary"
            onClick={() => setIsEditModalOpen(true)} 
            >
                <Edit className='mr-1' />
                Edit Entity</CustomButton>
        </div>
        <Row>
            <Col>
                <DetailRow label="Type" value={ENTITY_TYPE_MAPPINGS[get(record, 'kyc_investor_type_name')]} />
            </Col>
            <Col>
                <DetailRow label="Jurisdiction" value={Jurisdiction} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="Title Signing on Behalf of Your Entity" value={get(record, 'entity_title')} />
            </Col>
            <Col>
                <DetailRow label={stateRegionLabel} value={stateRegion} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="Date of Formation" value={standardizeDate(get(record, 'date_of_formation'))} />
            </Col>
            <Col>
                <DetailRow label="Registered Address" value={get(record, 'registered_address')} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="Nature of Business" value={get(record, 'nature_of_business')} />
            </Col>
            <Col />
        </Row>
        <div className='header mt-3'>
            <h3>Entity Documents</h3>
            <CustomButton 
            variant="outline-primary"
            onClick={() => setIsEditDocumentsModalOpen(true)}
            >
                <Add className='mr-1' />
                Upload</CustomButton>
        </div>
        {
            get(record, 'kyc_documents', []).map((doc: any) => <DocumentWrapper className='mt-4'>
            <FilePreviewModal
                documentName={`${get(doc, 'deleted') ? '(Deleted)' : ''} ${get(doc, 'document.title')}`}
                documentId={get(doc, 'document.document_id')} />
                {
                !get(doc, 'deleted') ? <img src={DeleteIcon} onClick={() => {
                    onDeleteKycDocument(get(doc, 'id'), { deleted: true })
                }} alt="delete" /> : <UndeleteDocBtn
                style={{fontSize: '14px'}} 
                onClick={() => {
                       onDeleteKycDocument(get(doc, 'id'), { deleted: false })
                   }}>
                        <DeleteOutline /> Undelete
                   </UndeleteDocBtn>
                   
            }
            </DocumentWrapper>)
        }
        <div className='header mt-3'>
            <h3>Entity Participants</h3>
        </div>
        {
            get(record, 'kyc_participants', []).map((participant: any) => 
            <EntityParticipant participant={participant} countries={countries} refetchData={refetchData}/>)
        }
        <EditEntity 
            record={record}
            countries={countries}
            show={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            onEditEntity={onEditEntity}
            />
        <EditEntityDocuments 
        show={isEditDocumentsModalOpen} 
        onClose={() => setIsEditDocumentsModalOpen(false)} 
        onCreate={onAddKycDocument}
        />
    </>
}

export default ParticipantEntity;
