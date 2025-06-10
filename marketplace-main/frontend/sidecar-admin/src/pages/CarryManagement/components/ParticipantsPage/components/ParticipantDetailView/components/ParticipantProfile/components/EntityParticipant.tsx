import React, { FC, useState } from 'react';
import API from '../../../../../../../../../api/backendApi';
import { Col, Row } from 'react-bootstrap';
import { CustomButton, ParticipantCard } from '../styles';
import DetailRow from './DetailsRow';
import { maskString } from '../utls';
import { get } from 'lodash';
import AddDefaultID from './Modals/AddDefaultID';
import { useUpdateKYCDocumentFieldsMutation } from '../../../../../../../../../api/rtkQuery/kycApi';
import { ID_DOCUMENT_TYPES } from '../constants';
import { standardizeDate } from '../../../../../../../../../utils/dateFormatting';

const EntityParticipant: FC<any> = ({
    participant,
    countries,
    refetchData
}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateKycDocumentFields] = useUpdateKYCDocumentFieldsMutation()
    const idDocumentType = ID_DOCUMENT_TYPES.find((type: any) => type.value === get(participant, 'id_document_type'))?.label;
    const idIssuingCountry = get(participant, 'id_issuing_country')?.name

    const onEditEntity = async (values: any) => {
        const formData = new FormData();
        if (values.file) {
            formData.append("file_data", values.file);
            formData.append("field_id", "id_doc_image");
            formData.append("record_id", participant.id.toString());
            await API.createKycDocument(participant.id, formData);
        }
        delete values.file;
        await updateKycDocumentFields({
            ...values,
            uuid: participant.uuid
        })
        refetchData();
        setIsEditModalOpen(false)
    }

    return <ParticipantCard className="py-0 mb-4">
        <div className='header mt-3 py-1'>
            <h6>{get(participant, 'first_name')} {get(participant, 'last_name')}</h6>
            <CustomButton 
            onClick={() => setIsEditModalOpen(true)}
            variant="outline-primary">Edit</CustomButton>
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
            <DetailRow label="ID Expiration" value={standardizeDate(get(participant, 'id_expiration_date'))} />
        </Col>
        <Col>
        <DetailRow label="Identification Number" value={maskString(get(participant, 'number_of_id'), 2, '*')} />
        </Col>
    </Row>
    <AddDefaultID 
            show={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)}
            onUpdateDefaultId={onEditEntity}
            record={participant}
            countries={countries}
            asParticipant
    />
    </ParticipantCard>
}

export default EntityParticipant;