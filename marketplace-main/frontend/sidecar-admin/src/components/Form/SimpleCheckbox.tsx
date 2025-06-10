// Import necessary libraries
import React from "react";
import Form from "react-bootstrap/Form";
import styled from "styled-components";

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const CheckboxLabel = styled.label`
  margin-left: 10px;
  margin-bottom:5px;
`;

const CheckBox = styled(Form.Check)`
  input {
    padding: 7px;
    border: 1px solid grey;
    margin-top: 1px;
    cursor: pointer;
  }

  .form-check-input:checked {
    background-color: #610094 !important;
    border-color: #610094;
}
`;

interface SimpleCheckboxProps {
  label: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}

const SimpleCheckbox: React.FC<SimpleCheckboxProps> = ({
  label,
  isChecked,
  onChange,
}) => {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <CheckboxContainer>
      <CheckBox
        type="checkbox"
        id={`checkbox-${label}`}
        checked={isChecked}
        onChange={handleCheckboxChange}
      />
      <CheckboxLabel htmlFor={`checkbox-${label}`}>{label}</CheckboxLabel>
    </CheckboxContainer>
  );
};

export default SimpleCheckbox;
