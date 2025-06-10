import React, { FunctionComponent } from "react";
import Form from "react-bootstrap/Form";
import { ErrorMessage, useField } from "formik";
import Row from "react-bootstrap/Row";
import Select, { OptionTypeBase } from "react-select";
import styled from "styled-components";

interface FormSelectorFieldProps {
  label: string;
  name: string;
  placeholder: string;
  onChange: any;
  onBlur?: any;
  isDisabled?: boolean;
  value: OptionTypeBase | readonly OptionTypeBase[] | null | undefined;
  selectorOptions: OptionTypeBase[];
  error?: any;
  isMulti?: boolean;
  currentSortOption:String;
  toggleSortOption:any
}

const StyledSelect = styled(Select)`
  .select__control {
    background-color: white;
    border: 1px solid #d5cbcb;
    height: 48px;
    padding: 0px 16px 0px;
    .select__value-container {
      .select__placeholder {
        color: #020203;
        font-weight: 500;
      }
    }
    .select__indicator-separator {
      display: none;
    }
    &.select__control--is-disabled {
      background-color: #e9ecef;
      .select__single-value {
        color: #020203;
      }
    }
  }
  .select__menu {
    z-index: 4;
  }
  .select__menu-portal {
    z-index: 5;
  }
`;

const LabelCol = styled.p`
  line-height: 21px;
  font-size: 17px !important;
  font-weight: 700 !important;
  padding: 10px;
  width:fit-content;
  margin:0px;
`;

const SortOptionButton =styled.button`
width: fit-content;
    margin: 0;
    border: 1px solid #d5cbcb;
    height:48px;
    background:white;
`
const SelectorField: FunctionComponent<FormSelectorFieldProps> = ({
  label,
  name,
  placeholder,
  onChange,
  value,
  selectorOptions,
  onBlur,
  isDisabled,
  error,
  isMulti,
  currentSortOption,
  toggleSortOption,
}) => {
  let field;
  try {
    const fieldInfo = useField(name);
    field = fieldInfo[0];
  } catch (e) {
    field = false;
  }

  const isAscending=currentSortOption==='asc'
  return (
    <Row style={{marginBottom:'20px'}}>
      <LabelCol>{label}</LabelCol>
      <Form.Group controlId="rows" style={{ width: "260px" }}>
        <StyledSelect
          className="basic-single"
          classNamePrefix="select"
          isSearchable={true}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          name={name}
          options={selectorOptions}
          onBlur={onBlur}
          isDisabled={isDisabled}
          menuPosition="fixed"
          isMulti={isMulti}
        />
        {field && (
          <ErrorMessage className="text-danger" name={name} component="div" />
        )}
        {error && <p className="text-danger">{error}</p>}
      </Form.Group>
      <SortOptionButton onClick={()=>toggleSortOption(isAscending? 'desc':'asc')}>
        {isAscending ? '⬇' : '⬆'}
      </SortOptionButton>
    </Row>
  );
};
export default  SelectorField ;
