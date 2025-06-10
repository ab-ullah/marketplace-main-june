import React, { ChangeEvent, FunctionComponent } from 'react';
import { isToolTipText } from "../../../components/ToolTip/interfaces";
import { DateTypeData } from '../../../interfaces/workflows';
import { FieldComponent } from '../interfaces';
import ToolTip from '../../../components/ToolTip';
import { useField } from '../hooks'
import { ErrorMessage } from 'formik';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from 'react-bootstrap/Form';
import { InnerFieldContainer } from '../styles'
import moment from "moment";
import {OptionTypeBase} from "react-select";
import styled from 'styled-components';

interface DateInputProps extends FieldComponent {
}
const DateInput: FunctionComponent<DateInputProps> = ({ question, customOnBlur, isInspectletSensitive, disabled }) => {
    const { field, helpers, handleBlur, handleFocus, isFocused } = useField(question.id, question.type);
    const { min, max, afterToday } = question.data as DateTypeData;
    const minDate = min ?? afterToday ? moment().add(1, 'days').format('YYYY-MM-DD') : undefined;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (customOnBlur) {
            customOnBlur(e)
        }
        helpers.setValue(e.target.value);
    }

    const wrapOnBlur = (e: OptionTypeBase) => {
        if (customOnBlur) {
            customOnBlur(e)
        }
        handleBlur(e)
    }

    return <InnerFieldContainer>
        <Row className={'mt-2'}>
            <Col md={4} className='field-label'>
                {question.label}
                {isToolTipText(question.helpText) && <ToolTip {...question.helpText} />}
            </Col>
            {(typeof question.helpText === "string") && <Col md={8} className='field-help-text'>
                <span>{question.helpText}</span>
            </Col>}
            <Col md={8}>
                <Form.Control
                    type="date"
                    name={question.id}
                    className={isInspectletSensitive ? 'inspectlet-sensitive': ''}
                    min={minDate}
                    max={max}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={wrapOnBlur}
                    value={field.value}
                    disabled={Boolean(disabled)}

                />
                {!isFocused && <ErrorMessage className="text-danger" name={question.id} component='div' />}
            </Col>
        </Row>
    </InnerFieldContainer>
}

DateInput.defaultProps = {
    isInspectletSensitive: true
}

export default DateInput;