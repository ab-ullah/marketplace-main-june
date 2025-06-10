import React, { FC, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { CustomButton, DetailWrapper } from '../styles';
import DetailRow from './DetailsRow';
import Edit from '@material-ui/icons/Edit';
import { get } from 'lodash';
import { standardizeDate } from '../../../../../../../../../utils/dateFormatting';
import {formatCurrencyWithTwoDecimals} from "../../../../../../../../../utils/currency";
import { StyledBadge } from '../../../../../styled';
import EditEmploymentRecord from './Modals/EditEmploymentRecord';
import { useUpdateEmploymentRecordMutation } from '../../../../../../../../../api/rtkQuery/employeeApi';
import { getEmployeeStatus } from '../../../utils';

const UserProfile: FC<any> = ({
    record,
    refetchData
}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [updateEmploymentRecord] = useUpdateEmploymentRecordMutation()

    const onEditProfile = async (values: any) => {
        if(record) {
            await updateEmploymentRecord({
                ...values,
                user_id: record.id
            })
        }
        refetchData();
        setIsEditModalOpen(false)
    }

    return <>
        <div className='header'>
            <h4>Employment Record</h4>
            <CustomButton
                onClick={() => setIsEditModalOpen(true)}
                variant="outline-primary">
                <Edit className='mr-1' />
                Employment Record</CustomButton>
        </div>
        <Row>
            <Col>
                <DetailRow label="EIN" value={get(record, 'ein')} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="Department" value={get(record, 'department')} />
            </Col>
            <Col>
                <DetailRow label="Office Location" value={get(record, "office_location")} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="Job Band" value={get(record, 'job_band')} />
            </Col>
            <Col>
            <DetailWrapper style={{paddingBottom: '16px'}}>
             <span className='status-label'>Status:</span>
             <StyledBadge status={get(record, 'status')}>{getEmployeeStatus(get(record, 'status'))}</StyledBadge>
            </DetailWrapper>
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="Hire Date" value={standardizeDate(get(record, 'hire_date'))}/>
            </Col>
            <Col>
                <DetailRow label="Separation Date" value={standardizeDate(get(record, "separation_date"))} />
            </Col>
        </Row>
        <h6>Current Position</h6>
        <Row>
            <Col>
                <DetailRow label="Title" value={get(record, 'current_position_title')} />
            </Col>
            <Col>
                <DetailRow label="Start Date" value={standardizeDate(get(record, 'current_position_start_date'))} />
            </Col>
        </Row>
        <Row>
            <Col>
                <DetailRow label="Annual Salary" value={formatCurrencyWithTwoDecimals(get(record, 'current_position_annual_salary'))} />
            </Col>
            <Col>
                <DetailRow label="Target Bonus" value={formatCurrencyWithTwoDecimals(get(record, 'current_position_target_bonus'))} />
            </Col>
        </Row>
        <EditEmploymentRecord
        show={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={record}
        onEditProfile={onEditProfile}
        />
    </>
}

export default UserProfile;