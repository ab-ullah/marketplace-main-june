import React from "react";
import styled, { css } from "styled-components";

const Container = styled.div`
  padding: 16px 0px;
`;

const Title = styled.h3`
  font-size: 1rem;
  margin-bottom: 16px;
  color: #000;
`;

const OptionContainer = styled.label<{ isSelected: boolean }>`
  display: flex;
  gap:12px;
  padding: 12px 16px 12px 16px;
  border: 1px solid #dee2e6; // Default border color
  border-radius: 8px;
  margin-bottom: 8px; // Spacing between options
  transition: border-color 0.15s ease-in-out;
  cursor: pointer;

  ${({ isSelected }) =>
    isSelected &&
    css`
      border-color: #610094; // Border color when option is selected
      background-color: #e7f1ff; // Light background color when option is selected
    `}
`;

const RadioDescription = styled.span`
  font-size: 0.875rem;
  color: #6c757d;
  display: block;
  margin-top: 5px;
`;

const InputRadio = styled.input`
  margin-right: 10px;
  accent-color: #610094;
  width: auto !important;
  cursor: pointer;

  &:checked {
    // Style for the checked state
  }
`;

type Option = {
  value: any;
  label: string;
  description?: string;
};

type CustomRadioGroupProps = {
  title: string;
  name: string;
  options: Option[];
  value: any;
  onChange: (value: string) => void;
  error?: string
};

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({
  title,
  name,
  options,
  value,
  onChange,
  error
}) => {

  const handleRadioChange = (opt: any) => {
    onChange(opt);
  };

  return (
    <Container>
      <Title>{title}</Title>
      {options.map((option) => (
        <OptionContainer
          key={option.value}
          isSelected={value?.value === option?.value}
        >
          <InputRadio
            type="radio"
            name={name}
            value={option?.value}
            checked={value?.value === option?.value}
            onChange={() => handleRadioChange(option)}
          />
          <div>
            {option.label}
            {option.description && (
              <RadioDescription>{option.description}</RadioDescription>
            )}
          </div>
        </OptionContainer>
      ))}
      {error && <p className="text-danger">{error}</p>}
    </Container>
  );
};

export default CustomRadioGroup;
