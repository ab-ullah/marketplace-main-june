import {Formik, Form} from 'formik';
import React, {FC, useMemo} from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { FormSelectorFieldRow } from '../../../../../../../../../../components/Form/SelectorField';
import {get, pick,} from 'lodash';
import { generateDateWithOffset, standardizeDateForApi } from '../../../../../../../../../../utils/dateFormatting';
import FormDateField from '../../../../../../../../../../components/Form/DateField';
import { FormContainer } from '../../styles';
import CurrencyField from "../../../../../../../../../../components/Form/CurrencyField";
import {
    useGetCompanyRolesQuery,
    useGetDepartmentsQuery,
    useGetJobBandsQuery, useGetOfficeLocationsQuery
} from "../../../../../../../../../../api/rtkQuery/employeeApi";
import * as Yup from "yup";
import { EMPLOYEE_STATUS_OPTIONS } from '../../constants';
import {TextField} from "@material-ui/core";
import TextInput from "../../../../../../../../../EligibilityCriteriaPreview/components/Form/TextInput";

const EditEmploymentRecord: FC<any> = ({
    record,
    show,
    onClose,
    onEditProfile
}) => {
    const {data: jobBands} = useGetJobBandsQuery(1);
    const {data: departments} = useGetDepartmentsQuery(1);
    const {data: companyRoles} = useGetCompanyRolesQuery(1);
    const {data: officeLocations} = useGetOfficeLocationsQuery(1);

    const formatOptions = (data: { id: number, name: string }[]) => {
        return data.map(row => ({value: row.id, label: row.name}))
    }

    const jobBandsValues = useMemo(() => {
        if(!jobBands) return [];
        return formatOptions(jobBands);
    }, [jobBands])
    const departmentsValues = useMemo(() => {
        if(!departments) return [];
        return formatOptions(departments);
    }, [departments])
    const companyRolesValues = useMemo(() => {
        if(!companyRoles) return [];
        return formatOptions(companyRoles);
    }, [companyRoles])
    const officeLocationsValues = useMemo(() => {
        if(!officeLocations) return [];
        return formatOptions(officeLocations);
    }, [officeLocations])
    const onSubmit = (values: any) => {
        const payload: any = pick(values, [
            'first_name',
            'user_first_name',
            'last_name',
            'user_last_name',
            'hire_date',
            'separation_date',
            'current_position_start_date',
            'current_position_annual_salary',
            'current_position_target_bonus',
            'current_position_start_bonus',
            'current_position_title',
            'job_band',
            'department',
            'office_location',
            'carry_participants',
            'status',
        ])
        payload.department = values.department?.value
        payload.office_location = values.office_location?.value
        payload.job_band = values.job_band?.value
        payload.current_position_title = values.current_position_title?.value
        payload.status = values.status?.value
        payload.hire_date = null
        if(values.hire_date) {
            payload.hire_date = standardizeDateForApi(values.hire_date);
        }
        payload.current_position_start_date = null
        if(values.current_position_start_date) {
            payload.current_position_start_date = standardizeDateForApi(values.current_position_start_date);
        }
        payload.separation_date = null
        if(values.separation_date) {
            payload.separation_date = standardizeDateForApi(values.separation_date);
        }
        payload.user_first_name = values.first_name;
        payload.user_last_name = values.last_name;
        if(values.ein!=""){
            payload.ein = values.ein
        }
        onEditProfile(payload)
    }

    return <Modal show={show} size="lg" onHide={onClose}>
        <Modal.Header>Edit Employment Record</Modal.Header>
        <Modal.Body>
            <FormContainer>
            <Formik
                initialValues={{
                    ...record,
                    job_band: jobBandsValues?.find((country: any) => country.label === get(record, 'job_band')),
                    office_location: officeLocationsValues?.find((officeLocation: any) => officeLocation.label === get(record, 'office_location')),
                    department: departmentsValues?.find((department: any) => department.label === get(record, 'department')),
                    current_position_title: companyRolesValues?.find((companyRole: any) => companyRole.label === get(record, 'current_position_title')),
                    carry_participants: get(record, 'user_carry_participants', []).map((userCarryParticipant: any) => get(userCarryParticipant, 'carry_participant')),
                    current_position_annual_salary: get(record, 'current_position_annual_salary', 0) ? get(record, 'current_position_annual_salary', 0) : "",
                    current_position_target_bonus: get(record, 'current_position_target_bonus', 0) ? get(record, 'current_position_target_bonus', 0) : "",
                    hire_date: get(record, "hire_date") ?  generateDateWithOffset(get(record, "hire_date")) : "",
                    current_position_start_date: get(record, "current_position_start_date") ? generateDateWithOffset(get(record, "current_position_start_date")) : "",
                    separation_date: get(record, "separation_date") ? generateDateWithOffset(get(record, "separation_date")) : "",
                    status: EMPLOYEE_STATUS_OPTIONS[0],
                }}
                validationSchema={Yup.object({
                    hire_date: Yup.date().required("Required"),
                    current_position_start_date: Yup.date().required("Required"),
                    status: Yup.object().shape({
                        label: Yup.string().required('Required'),
                        value: Yup.string().required('Required'),
                    }).required('Required'),
                    ein: Yup.string().nullable()
                    .matches(/^[0-9]+$/, "EIN must be only digits")
                    .min(1, "EIN must be a between 1 and 24 digits long")
                    .max(24, "EIN must be a between 1 and 24 digits long"),
                })}
                enableReinitialize={true}
                onSubmit={onSubmit}
            >
                {({
                    values,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                    isSubmitting,
                    isValid,
                    errors
                }) => {
                    return (
                        <Form onSubmit={(data: any) => {
                            handleSubmit(data)
                        }}>
                            <h6 className='mt-4' style={
                                {fontWeight: "bold"}
                            }>Employment Record</h6>
                            <Row>
                                <Col md="12">
                                    <TextInput
                                        label={'EIN'}
                                        name={'ein'}
                                        placeholder={'EIN'}
                                        onChange={handleChange}
                                        value={values.ein}
                                    />
                                    <FormSelectorFieldRow
                                        label={'Status'}
                                        name={'status'}
                                        placeholder={''}
                                        onChange={(value: any) => setFieldValue('status', value)}
                                        value={values.status}
                                        options={EMPLOYEE_STATUS_OPTIONS}
                                    />
                                    <FormSelectorFieldRow
                                        label={'Department'}
                                        name={'department'}
                                        placeholder={''}
                                        onChange={(value: any) => setFieldValue('department', value)}
                                        value={values.department}
                                        options={departmentsValues}
                                    />
                                    <FormSelectorFieldRow
                                        label={'Office Location'}
                                        name={'office_location'}
                                        placeholder={''}
                                        onChange={(value: any) => setFieldValue('office_location', value)}
                                        value={values.office_location}
                                        options={officeLocationsValues}
                                    />
                                    <FormSelectorFieldRow
                                        label={'Job Band'}
                                        name={'job_band'}
                                        placeholder={''}
                                        onChange={(value: any) => setFieldValue('job_band', value)}
                                        value={values.job_band}
                                        options={jobBandsValues}
                                    />
                                    <FormDateField
                                        name="hire_date"
                                        label="Hire Date"
                                        placeholder="Enter Hire Date"
                                        value={get(values, 'hire_date', new Date())}
                                        onChange={(e: any) => setFieldValue('hire_date', new Date(e))}
                                        onBlur={handleBlur}
                                    />
                                    <FormDateField
                                        name="separation_date"
                                        label="Separation Date"
                                        placeholder="Enter Separation Date"
                                        value={get(values, 'separation_date')}
                                        onChange={(e: any) => setFieldValue('separation_date', new Date(e))}
                                        onBlur={handleBlur}
                                    />
                                    <h6 style={{
                                        fontWeight: "bold"
                                    }} className="mt-4">Current Position</h6>
                                    <FormSelectorFieldRow
                                        label={'Job Title'}
                                        name={'current_position_title'}
                                        placeholder={'Job Title'}
                                        onChange={(value: any) => setFieldValue('current_position_title', value)}
                                        value={values.current_position_title}
                                        options={companyRolesValues}
                                    />
                                    <FormDateField
                                        name="current_position_start_date"
                                        label="Start Date"
                                        placeholder="Enter Start Date"
                                        value={get(values, 'current_position_start_date')}
                                        onChange={(e: any) => setFieldValue('current_position_start_date', new Date(e))}
                                        onBlur={handleBlur}
                                    />
                                    <CurrencyField
                                        label="Annual Salary"
                                        name="annual_salary"
                                        placeholder="Annual Salary"
                                        onChange={(value: any) => setFieldValue('current_position_annual_salary', value)}
                                        onBlur={handleBlur}
                                        value={values.current_position_annual_salary}/>
                                    <CurrencyField
                                        label="Target Bonus"
                                        name="target_bonus"
                                        placeholder="Target Bonus"
                                        onChange={(value: any) => setFieldValue('current_position_target_bonus', value)}
                                        onBlur={handleBlur}
                                        value={values.current_position_target_bonus}/>
                                </Col>
                            </Row>
                            <Modal.Footer className='mt-4'>
                                <Button variant="secondary" onClick={onClose}>Close</Button>
                                <Button
                                    variant="primary"
                                    type='submit'
                                    // disabled={!isValid}
                                >Save</Button>
                            </Modal.Footer>
                        </Form>
                    )
                }}
            </Formik>
            </FormContainer>
        </Modal.Body>
    </Modal>
}

export default EditEmploymentRecord;