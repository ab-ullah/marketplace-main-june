import React, { ChangeEvent, FunctionComponent } from 'react';
import classNames from "classnames";
import { CustomSelectTypeData } from "../../../interfaces/workflows";
import { FieldComponent } from '../interfaces';
import { InnerFieldContainer, CheckboxWrapper,ThemeCheckboxSection } from '../styles';
import Form from 'react-bootstrap/Form';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { ErrorMessage } from 'formik';
import { useField } from '../hooks'


interface CheckboxSelectProps extends FieldComponent {
}

const Checkbox: FunctionComponent<CheckboxSelectProps> = ({ question, customOnBlur, isInspectletSensitive, disabled }) => {
    const { field, helpers, handleBlur, handleFocus, isFocused } = useField(question.id, question.type);
    const { options } = question.data as CustomSelectTypeData;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if(question.disabled || disabled) return;
        if(field.value !== "") helpers.setValue("");
        else helpers.setValue(e.target.id);
    }

    const wrapOnBlur = (e: ChangeEvent<HTMLInputElement>) => {
        if(customOnBlur){
            customOnBlur(e)
        }
        return handleBlur(e)
    }

    return <InnerFieldContainer>
        <Row className={'mt-2'}>
            <Col md={4} className='field-label'>
                {question.label}
            </Col>
            {question.helpText && <Col md={8} className='field-help-text'>
                <span>{question.helpText}</span>
            </Col>}
            <Col md={8} className={isInspectletSensitive ? 'inspectlet-sensitive':''}>
                <Row>
                    <CheckboxWrapper>
                        {options.map(option => {
                            const isChecked = option.value == field.value; // eslint-disable-line eqeqeq
                            return <ThemeCheckboxSection
                                key={option.label}
                                inline
                                className={classNames({ 'selectedRadio': isChecked })}
                                onBlur={wrapOnBlur}
                                onFocus={handleFocus}
                            >
                                <Form.Check.Input
                                    id={option.value as string}
                                    name={question.id}
                                    type={'checkbox'}
                                    checked={isChecked}
                                    onChange={handleChange}
                                    disabled={Boolean(disabled)}
                                />
                                <Form.Check.Label htmlFor={option.value as string}>
                                    {option.label}
                                </Form.Check.Label>
                            </ThemeCheckboxSection>
                        })}
                    </CheckboxWrapper>
                </Row>
                {!isFocused && <ErrorMessage className={"text-danger"} name={question.id} component='div' />}
            </Col>
        </Row>
    </InnerFieldContainer>
}

Checkbox.defaultProps = {
    isInspectletSensitive: true
}

export default Checkbox;