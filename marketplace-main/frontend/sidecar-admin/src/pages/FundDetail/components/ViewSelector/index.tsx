import React, {FunctionComponent} from 'react';
import Select from "react-select";
import {OptionType} from "./interfaces";
import {VIEW_SELECTOR_OPTIONS} from "./constants";


interface ViewSelectorProps {
  onViewChange: (value: OptionType) => void
  viewValue?: OptionType
}


const ViewSelector: FunctionComponent<ViewSelectorProps> = ({onViewChange, viewValue}) => {
  const handleChange = (v: any) => {
    onViewChange(v)
  }

  return <Select
    placeholder={'Select View'}
    onChange={handleChange}
    className="view-selector"
    classNamePrefix="select"
    isSearchable={true}
    value={viewValue}
    name={'viewSelector'}
    options={VIEW_SELECTOR_OPTIONS}
  />
};

export default ViewSelector;
