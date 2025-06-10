import React, { ChangeEvent, FunctionComponent } from 'react';
import { isToolTipText } from "../../../components/ToolTip/interfaces";
import { CustomSelectTypeData } from "../../../interfaces/workflows";
import CommentWrapper from '../../../components/CommentWrapper';
import ToolTip from '../../../components/ToolTip';
import { FieldComponent } from '../interfaces';
import { InnerFieldContainer, RadioButton, RadioInner, RadioInput } from '../styles';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { ErrorMessage } from 'formik';
import { useField } from '../hooks';
import { useParams } from 'react-router-dom';
import { useGetApplicationStatusQuery } from '../../../api/rtkQuery/fundsApi';
import {isApplicationPage} from "../../../utils/routes";

interface RadioSelectProps extends FieldComponent {
}

const RadioSelect: FunctionComponent<RadioSelectProps> = ({ comments, question, customOnBlur, isInspectletSensitive, disabled }) => {
  const { externalId } = useParams<{ externalId: string }>();
  const { data: applicationStatus } = useGetApplicationStatusQuery(externalId);
  const { field, helpers, isFocused } = useField(question.id, question.type);
  const { options } = question.data as CustomSelectTypeData;
  const { helpText, label } = question;
  const isApplicationLocked = applicationStatus?.is_locked || (applicationStatus?.application_view_editing_disabled && isApplicationPage())

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (question.disabled) return;
    if (customOnBlur) {
      customOnBlur(e)
    }
    helpers.setValue(e.target.id);
  }

  const onClick = (value: string | number) => {
    helpers.setValue(value);
  }

  return <InnerFieldContainer>
    <Row className={'mt-2'}>
      <Col md={4} className='field-label'>
        {label}
        {isToolTipText(helpText) && <ToolTip {...helpText} />}
      </Col>
      {(typeof helpText === "string") && <Col md={8} className='field-help-text'>
        <span>{helpText}</span>
      </Col>}
      <Col md={8} className={isInspectletSensitive ? 'inspectlet-sensitive' : ''}>
        <Row>
          {options.map(option => {
            const isChecked = option.value == field.value; // eslint-disable-line eqeqeq
            return <RadioButton
              key={option.value}
              checked={isChecked}
              onClick={() => !isApplicationLocked && onClick(option.value)}
            >
              <input
                type="radio"
                value={option.value}
                id={option.value.toString()}
                name={question.id}
                checked={isChecked}
                onChange={handleChange}
                onClick={() => !isApplicationLocked && onClick(option.value)}
              ></input>
              <RadioInput checked={isChecked}>
                <RadioInner checked={isChecked} />
              </RadioInput>
              <label>{option.label}</label>
            </RadioButton>
          })}
        </Row>
        {!isFocused && <ErrorMessage name={question.id} component='div' />}
      </Col>
    </Row>
    {comments?.map(comment => <CommentWrapper key={comment.id} comment={comment} />)}
  </InnerFieldContainer>
}

RadioSelect.defaultProps = {
  isInspectletSensitive: true
}

export default RadioSelect;