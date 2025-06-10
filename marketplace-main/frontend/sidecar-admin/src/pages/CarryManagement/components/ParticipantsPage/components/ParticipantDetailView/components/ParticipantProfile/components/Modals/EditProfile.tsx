import {Formik, Form, FieldArray} from 'formik';
import React, {FC} from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import TextInput from '../../../../../../../../../EligibilityCriteriaPreview/components/Form/TextInput';
import {get, pick} from 'lodash';
import { standardizeDateForApi } from '../../../../../../../../../../utils/dateFormatting';
import { FormContainer } from '../../styles';
import * as Yup from "yup";

const EditProfile: FC<any> = ({
    record,
    show,
    onClose,
    onEditProfile
}) => {

    const onSubmit = (values: any) => {
        const payload: any = pick(values, [
            'first_name',
            'user_first_name',
            'last_name',
            'user_last_name',
            'carry_participants'
        ])
        payload.user_first_name = values.first_name;
        payload.user_last_name = values.last_name;
        onEditProfile(payload)
    }

    return <Modal show={show} size="lg" onHide={onClose}>
        <Modal.Header>Edit Profile</Modal.Header>
        <Modal.Body>
            <FormContainer>
            <Formik
                initialValues={{
                    ...record,
                    carry_participants: get(record, 'user_carry_participants', []).map((userCarryParticipant: any) => get(userCarryParticipant, 'carry_participant')),
                }}
                validationSchema={Yup.object({
                    first_name: Yup.string().required("Required"),
                    last_name: Yup.string().required("Required"),
                })}
                enableReinitialize={true}
                onSubmit={onSubmit}
            >
                {({
                    values,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isValid,
                }) => {
                    return (
                        <Form onSubmit={(data: any) => {
                            handleSubmit(data)
                        }}>
                            <h6 style={
                                {fontWeight: "bold"}
                            }>User</h6>
                            <Row>
                                <Col md="12">
                                    <TextInput
                                        name={'first_name'}
                                        label={'First Name'}
                                        placeholder={'Name'}
                                        value={values.first_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <TextInput
                                        name={'last_name'}
                                        label={'Last Name'}
                                        placeholder={'Name'}
                                        value={values.last_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <FieldArray name="carry_participants">
                                        {({ insert, remove, push }) => {
                                            return <>
                                                {values && values.carry_participants && values.carry_participants.length > 0 &&
                                                    values.carry_participants.map((carryParticipant: { entity_type: string; first_name: string; last_name: string; entity_name: string}, index: number) => {
                                                        return <>
                                                            <h6 style={
                                                                {fontWeight: "bold"}
                                                            } className='mt-4'>Carry Participant</h6>
                                                            <Row>
                                                                <Col md="12">
                                                                    {carryParticipant.entity_type == "Individual" && <>
                                                                        <TextInput
                                                                            name={`carry_participants.${index}.first_name`}
                                                                            label={'First Name'}
                                                                            placeholder={'First Name'}
                                                                            value={carryParticipant.first_name}
                                                                            onChange={handleChange}
                                                                            onBlur={handleBlur}
                                                                        />
                                                                        <TextInput
                                                                            name={`carry_participants.${index}.last_name`}
                                                                            label={'Last Name'}
                                                                            placeholder={'Last Name'}
                                                                            value={carryParticipant.last_name}
                                                                            onChange={handleChange}
                                                                            onBlur={handleBlur}
                                                                        />
                                                                    </>}
                                                                    {carryParticipant.entity_type != "Individual" && <>
                                                                        <TextInput
                                                                            name={`carry_participants.${index}.entity_name`}
                                                                            label={'Entity Name'}
                                                                            placeholder={'Entity Name'}
                                                                            value={carryParticipant.entity_name}
                                                                            onChange={handleChange}
                                                                            onBlur={handleBlur}
                                                                        />
                                                                    </>}
                                                                </Col>
                                                            </Row>
                                                        </>
                                                    })}
                                            </>
                                        }}
                                    </FieldArray>
                                </Col>
                            </Row>
                            <Modal.Footer className='mt-4'>
                                <Button variant="secondary" onClick={onClose}>Close</Button>
                                <Button
                                    variant="primary"
                                    type='submit'
                                    disabled={!isValid}
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

export default EditProfile;