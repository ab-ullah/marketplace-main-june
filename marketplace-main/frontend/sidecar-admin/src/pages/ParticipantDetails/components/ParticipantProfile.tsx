import React, { FC, useState } from 'react';
import API from '../../../api/backendApi';
import { Row, Col, Button } from 'react-bootstrap';
import { CustomButton, DocumentWrapper, ParticipantCard, UndeleteDocBtn } from '../styles';
import DetailRow from './DetailsRow';
import Edit from '@material-ui/icons/Edit';
import { Add, DeleteOutline } from '@material-ui/icons';
import { maskString } from '../utls';
import EditProfile from './Modals/EditProfile';
import AddDefaultID from './Modals/AddDefaultID';
import { get } from 'lodash';
import { DEPARTMENTS, ID_DOCUMENT_TYPES, JOB_BANDS } from '../../EligibilityCriteriaPreview/components/CountrySelector/constants';
import FilePreviewModal from '../../../components/FilePreviewModal';
import {
    useCreateKYCDocumentFieldsMutation,
    useUpdateKYCDocumentFieldsMutation,
    useUpdateKycDocumentMutation,
    useUpdatePaymentDetailsFieldsMutation
} from '../../../api/rtkQuery/kycApi';
import DeleteIcon from '../../../assets/images/delete-icon.svg';
import { useParams } from 'react-router-dom';
import { standardizeDate } from '../../../utils/dateFormatting';

const ParticipantProfile: FC<any> = ({
    record,
    countries,
    currencies,
    refetchData
}) => {
    const { participantId } = useParams<any>()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddIdModalOpen, setIsAddIdModalOpen] = useState(false);
    const [updateKycDocumentFields] = useUpdateKYCDocumentFieldsMutation()
    const [createKYCDocumentFields] = useCreateKYCDocumentFieldsMutation()
    const [updatePaymentDetailFields] = useUpdatePaymentDetailsFieldsMutation()
    const [updateKycDocument] = useUpdateKycDocumentMutation()
    const countryOfCitizenship = get(record, 'citizenship_country')?.name
    const officeLocation = get(record, 'office_location')?.name;
    const idIssuingCountry = get(record, 'id_issuing_country')?.name;
    const idDocumentType = ID_DOCUMENT_TYPES.find((type: any) => type.value === get(record, 'id_document_type'))?.label;
    const idDocumentFiles = get(record, 'kyc_documents', []).filter((doc: any) => doc.kyc_record_file_id
        === 'id_doc_image')

    const onEditProfile = async (values: any) => {
        if(record) {
            await updateKycDocumentFields({
                ...values,
                uuid: record.uuid
            })
        }
        else {
            await createKYCDocumentFields({
                ...values,
                user: Number(participantId)
            })
        }
        refetchData();
        setIsEditModalOpen(false)
    }

    const onEditPaymentDetailEntity = async(values: any) => {
        await updatePaymentDetailFields({
            ...values,
            id: record.payment_detail.id
        })
        refetchData()
        setIsEditModalOpen(false)
    }

    const uploadDocument = async (recordId: number, file: any) => {
        const formData = new FormData();
        formData.append("file_data", file);
        formData.append("field_id", "id_doc_image");
        formData.append("record_id", recordId.toString());
        await API.createKycDocument(recordId, formData);
    }

    const onUpdateDefaultId = async (values: any) => {
        if (values.file && record) {
            await uploadDocument(record.id, values.file);
        }
        if(record){
            await updateKycDocumentFields({
                ...values,
                uuid: record.uuid
            })
        }
        else {
            const response =await createKYCDocumentFields({
                ...values,
                user: Number(participantId)
            })
            if (values.file) {
                await uploadDocument(get(response, 'data.id'), values.file);
            }
        }
        refetchData();
        setIsAddIdModalOpen(false)
    }

    const onDeleteKycDocument = async (documentId: any, payload: any) => {
        await updateKycDocument({kycRecordId: record.id, kycDocumentId: documentId, ...payload})
        refetchData();
    }

    return <ParticipantCard>
        <div className='header'>
            <h3>Profile</h3>
            <CustomButton
                onClick={() => setIsEditModalOpen(true)}
                variant="outline-primary">
                <Edit className='mr-1' />
                Edit Profile</CustomButton>
        </div>
        <h6>Contact</h6>
        <Row>
            <Col>
                <DetailRow label="Email" value={get(record, 'user.email')} />
            </Col>
            <Col>
                <DetailRow label="Home Address" value={get(record, 'home_address')} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="Phone" value={get(record, 'phone_number')} />
            </Col>
            <Col>
                <DetailRow label="Country of Citizenship" value={countryOfCitizenship} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="Date of Birth" value={standardizeDate(get(record, 'date_of_birth'))} />
            </Col>
            <Col>
                <DetailRow label="Politically Exposed" value={get(record, 'pollitically_exposed_person') ? 'Yes' : 'No'} />
            </Col>
        </Row>
        <h6 className='mt-4'>Job Information</h6>
        <Row>
            <Col>
                <DetailRow label="Job Title" value={get(record, 'job_title')} />
            </Col>
            <Col>
                <DetailRow label="Office Location" value={officeLocation} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow
                    label="Department"
                    value={DEPARTMENTS.find((department: any) => department.value === get(record, 'department'))?.label} />
            </Col>
            <Col>
                <DetailRow label="Job Band"
                    value={JOB_BANDS.find((band: any) => band.value === get(record, 'job_band'))?.label} />
            </Col>
        </Row>
        <h6 className='mt-4'>Banking Details</h6>
        <Row>
            <Col>
                <DetailRow label="Bank Name" value={get(record, 'payment_detail.bank_name')} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow
                    label="Routing Number"
                    value={get(record, 'payment_detail.routing_number')} />
            </Col>
            <Col>
                <DetailRow label="Account Number"
                           value={get(record, 'payment_detail.account_number')} />
            </Col>
            <Col>
                <DetailRow label="Swift Code"
                           value={get(record, 'payment_detail.swift_code')} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow
                    label="Account Name"
                    value={get(record, 'payment_detail.account_name')} />
            </Col>
            <Col>
                <DetailRow label="For further credit account name"
                           value={get(record, 'payment_detail.for_further_credit_account_name')} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow
                    label="Currency"
                    value={get(record, 'payment_detail.currency')} />
            </Col>
            <Col>
                <DetailRow label="For further credit account number"
                           value={get(record, 'payment_detail.for_further_credit_account_number')} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="Bank Country" value={get(record, 'payment_detail.bank_country.name')} />
            </Col>
            <Col>
                <DetailRow label="Bank State" value={get(record, 'payment_detail.state')} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="Bank City" value={get(record, 'payment_detail.city')} />
            </Col>
            <Col>
                <DetailRow label="Bank Street Address" value={get(record, 'payment_detail.street_address')} />
            </Col>
        </Row>
        <div className='header mt-3'>
            <h3>Default ID Document</h3>
            <Button
                variant="outline-primary"
                onClick={() => setIsAddIdModalOpen(true)}
            >
                <Add />
                Upload</Button>
        </div>
        <Row>
            <Col>
                <DetailRow label="Document Type" value={idDocumentType} />
            </Col>
            <Col>
                <DetailRow label="Issuing Country" value={idIssuingCountry} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="ID Expiration" value={standardizeDate(get(record, 'id_expiration_date'))} />
            </Col>
            <Col>
                <DetailRow label="Identification Number" value={maskString(get(record, 'number_of_id', ''), 2, '*')} />
            </Col>
        </Row>
        {
            idDocumentFiles.map((idDocumentImage: any) => <DocumentWrapper className='mt-4'>
                <FilePreviewModal
                    documentName={`${get(idDocumentImage, 'deleted') ? '(Deleted)' : ''} ${get(idDocumentImage, 'document.title')}`}
                    documentId={get(idDocumentImage, 'document.document_id')} />
                {
                    !get(idDocumentImage, 'deleted') ? <img src={DeleteIcon} onClick={() => {
                        onDeleteKycDocument(get(idDocumentImage, 'id'), { deleted: true })
                    }} alt="delete" /> : <UndeleteDocBtn
                        style={{ fontSize: '14px' }}
                        onClick={() => {
                            onDeleteKycDocument(get(idDocumentImage, 'id'), { deleted: false })
                        }}>
                        <DeleteOutline /> Undelete
                    </UndeleteDocBtn>

                }
            </DocumentWrapper>)
        }
        <EditProfile
            show={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            record={record}
            countries={countries}
            currencies={currencies}
            onEditPaymentDetail={onEditPaymentDetailEntity}
            onEditProfile={onEditProfile}
        />
        <AddDefaultID
            show={isAddIdModalOpen}
            onClose={() => setIsAddIdModalOpen(false)}
            onUpdateDefaultId={onUpdateDefaultId}
            record={record}
            countries={countries}
        />
    </ParticipantCard>
}

export default ParticipantProfile;