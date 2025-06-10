import React, {ChangeEvent, FunctionComponent, SyntheticEvent, useState} from 'react';
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import SplitButton from "react-bootstrap/SplitButton";
import Form from "react-bootstrap/Form";
import styled from "styled-components";
import _ from "lodash";
import {ISelectOptionNumValue} from "../../interfaces/form";


const StyledDiv = styled.div`
  button {
    background: inherit;
    border: none;
    font-family: Quicksand Bold;
    font-size: 14px;
    padding-left: 0;

    :hover {
      background: inherit;
      border: none;
    }
  }

  a.dropdown-item {
    font-family: Quicksand;
    font-size: 14px;
  }

  .dropdown-menu {
    max-height: 180px;
    overflow: auto;
  }

  label {
    vertical-align: middle;
    padding: 2px;
  }

  div.filter .btn.btn-primary{
    background: inherit;
    letter-spacing: 0.00em;
    padding: 5px 3px;
    margin-left: 0px;
  }
`

interface TableHeaderFilterProps {
  title: string;
  options: ISelectOptionNumValue[];
  selectedValues: (number|string)[];
  setValues: (args0: (number|string)[]) => void;
}


const TableHeaderFilter: FunctionComponent<TableHeaderFilterProps> = ({title, options, selectedValues, setValues}) => {
  const [isShown, setIsShown] = useState(false);

  const onToggleHandler = (isOpen: boolean, metadata: SyntheticEvent) => {
    metadata.stopPropagation()
    if(!metadata.target.hasOwnProperty('checked')){
        setIsShown(isOpen);
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>, value: string | number) => {
    if (e.target.checked) setValues([...selectedValues, value])
    else setValues([...selectedValues.filter(v => v !== value)])
  }
  return <StyledDiv>
    <SplitButton
      show={isShown}
      onToggle={(nextShow, meta) => onToggleHandler(nextShow, meta)}
      as={ButtonGroup}
      key={title}
      id={`dropdown-button-drop-${title}`}
      className='filter'
      size="lg"
      title={title}
      style={{background:'transparent'}}
    >
      {options.map((option, index) => {
        const isChecked = _.includes(selectedValues, option.value);
        return <Dropdown.Item eventKey={index} key={`${title}-${option.value}`}>
          <Form.Check
            type="checkbox"
            label={option.label}
            key={`${title}-${option.value}-${isChecked}`}
            checked={isChecked}
            onChange={(e) => handleChange(e, option.value)}
          />
        </Dropdown.Item>
      })}
    </SplitButton>
  </StyledDiv>
};

export default TableHeaderFilter;