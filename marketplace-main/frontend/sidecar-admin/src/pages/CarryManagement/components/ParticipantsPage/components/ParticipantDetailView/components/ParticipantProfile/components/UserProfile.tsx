import React, { FC, useState } from 'react';
import API from '../../../../../../../../../api/backendApi';
import { Row, Col, Button } from 'react-bootstrap';
import { CustomButton, DocumentWrapper, ParticipantCard, UndeleteDocBtn } from '../styles';
import DetailRow from './DetailsRow';
import Edit from '@material-ui/icons/Edit';
import { Add, DeleteOutline } from '@material-ui/icons';
import { maskString } from '../utls';
import EditKYCRecord from './Modals/EditKYCRecord';
import AddDefaultID from './Modals/AddDefaultID';
import { get, isEmpty } from 'lodash';
import DeleteIcon from '../../../../../../../../../assets/images/delete-icon.svg';
import FilePreviewModal from '../../../../../../../../../components/FilePreviewModal';
import { ID_DOCUMENT_TYPES } from '../constants';
import { useCreateKYCDocumentFieldsMutation, useUpdateKYCDocumentFieldsMutation, useUpdateKycDocumentMutation } from '../../../../../../../../../api/rtkQuery/kycApi';
import { DEPARTMENTS, JOB_BANDS } from '../../../../../../../../EligibilityCriteriaPreview/components/CountrySelector/constants';
import moment from 'moment';
import { PARTICIPANT_ID_PARAM } from '../../../../../../../constants';
import { standardizeDate } from '../../../../../../../../../utils/dateFormatting';
import EditProfile from "./Modals/EditProfile";
import {useUpdateParticipantProfileMutation} from "../../../../../../../../../api/rtkQuery/employeeApi";

const UserProfile: FC<any> = ({
    record,
    refetchData
}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateKycDocumentFields] = useUpdateParticipantProfileMutation()

    const onEditProfile = async (values: any) => {
        if(record) {
            await updateKycDocumentFields({
                ...values,
                user_id: record.id
            })
        }
        refetchData();
        setIsEditModalOpen(false)
    }


    return <>
        <div className='header'>
            <h4>User</h4>
            <CustomButton
                onClick={() => setIsEditModalOpen(true)}
                variant="outline-primary">
                <Edit className='mr-1' />
                Edit Profile</CustomButton>
        </div>
        <Row>
            <Col>
                <DetailRow label="Email" value={get(record, 'email')} />
            </Col>
            <Col></Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="First Name" value={get(record, 'first_name')} />
            </Col>
            <Col>
                <DetailRow label="Last Name" value={get(record, 'last_name')} />
            </Col>
        </Row>
        <EditProfile
            show={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            record={record}
            onEditProfile={onEditProfile}
        />
    </>
}

export default UserProfile;