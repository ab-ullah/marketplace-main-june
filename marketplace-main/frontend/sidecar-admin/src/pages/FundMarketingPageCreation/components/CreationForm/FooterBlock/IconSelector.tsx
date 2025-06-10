import React, {FunctionComponent, useState} from 'react';
import {useAppSelector} from "../../../../../app/hooks";
import {selectIcons} from "../../../selectors";
import Select from "react-select";
import styled from "styled-components";

const StyledIconSelector = styled.div`
  width: 50%;

  .select__control {
    padding: 5px 16px;
    border-radius: 4px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 14px;
    color: #2E2E3A;
    border: 1px solid #D5CBCB;
  }

  .select__value-container {
    padding: 0;
  }

  .select__menu {
    padding: 14px 16px;
    border-radius: 4px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 14px;
    color: #2E2E3A;
  }

  .select__option--is-selected {
    background: #deebff;
  }


`

interface IconSelectorProps {
  initialValue: number | null | undefined;
  handleUpdate: (name: string, value: string | number) => void
}


const IconSelector: FunctionComponent<IconSelectorProps> = ({initialValue, handleUpdate}) => {
  const [selectedIcon, setSelectedIcon] = useState<number | null | undefined>(initialValue)
  const icons = useAppSelector(selectIcons)

  const iconOptions = icons.map(icon => ({
    label: <img src={icon.icon} width={20} alt="option-icon"/>,
    value: icon.id
  }))

  const onChange = (option: any) => {
    handleUpdate('icon', option.value)
    setSelectedIcon(option.value)
  }

  const selectedOption = iconOptions.find(option => option.value === selectedIcon)

  return <StyledIconSelector>
    <Select
      onChange={onChange}
      className="basic-single"
      classNamePrefix="select"
      value={selectedOption}
      name={'icon'}
      // @ts-ignore
      options={iconOptions}
    />
  </StyledIconSelector>

};

export default IconSelector;
