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

const UserProfile: FC<any> = ({
    record,
}) => {
    return <>
        <div className='header'>
            <h4>Carry Participant</h4>
        </div>
        <Row>
            <Col>
                <DetailRow label="Name" value={get(record, 'full_name')} />
            </Col>
            <Col>
                <DetailRow label="Entity Type" value={get(record, 'entity_type')} />
            </Col>
        </Row>
    </>
}

export default UserProfile;