import React, {FunctionComponent, useMemo, useState} from "react";
import Form from "react-bootstrap/Form";
import _ from 'lodash';
import styled from "styled-components";

const StyledFormInput = styled(Form.Control)`
  background: #FFFFFF;
  border: 1px solid #D5CBCB;
  box-sizing: border-box;
  border-radius: 8px;
  min-width: 100%;
  padding: 15px;
  font-family: Quicksand;
  font-weight: normal;
  font-size: 16px !important;
`


interface APISyncTextFieldProps {
  name: string;
  placeholder: string;
  onChange: any;
  value: string | number | string[] | undefined;
  isNumber?: boolean;
  isTextArea?: boolean;
  rows?: number;
  disabled?: boolean;
}


const APISyncTextField: FunctionComponent<APISyncTextFieldProps> = (
  {
    name,
    placeholder,
    onChange,
    value,
    isNumber,
    isTextArea,
    rows,
    disabled
  }
) => {
  const [textValue, setTextValue] = useState(value);

  const debouncedOnChange = useMemo(
    () => _.debounce(onChange, 2000)
    , []);


  const localOnChange = (e: any) => {
    setTextValue(e.target.value)
    debouncedOnChange(e.target.value)
  }
  const otherProps = {} as any;
  if (isTextArea) otherProps['as'] = 'textarea'
  if (rows) otherProps['rows'] = rows
  return <>
    <Form.Group controlId="formFilterValue" className={'mb-4 api-synced-input'}>
      <StyledFormInput
        type={isNumber ? 'number' : 'text'}
        name={name}
        placeholder={placeholder}
        onChange={localOnChange}
        value={textValue}
        disabled={disabled}
        {...otherProps}
      />
    </Form.Group>
  </>
}

export default APISyncTextField;