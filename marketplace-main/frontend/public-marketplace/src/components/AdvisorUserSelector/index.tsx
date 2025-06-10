import React, {FunctionComponent} from 'react';
import styled from "styled-components";
import Select, {OptionTypeBase} from "react-select";
import {useAppSelector} from "../../app/hooks";
import {selectAdvisorUsers} from "../../pages/User/selectors";

interface AdvisorUserSelectorProps {
  onChange: any;
  value: OptionTypeBase | null | undefined;
}

const StyledSelect = styled(Select)`
  .select__control {
    min-width: 250px;
  }
`


const AdvisorUserSelector: FunctionComponent<AdvisorUserSelectorProps> = ({onChange, value}) => {
  const advisorUsers = useAppSelector(selectAdvisorUsers)
  if (!advisorUsers || !advisorUsers.length) return <></>


  const options = advisorUsers.map(advisorUser => ({label: advisorUser.display_name, value: advisorUser.user_id}))
  return <StyledSelect
    placeholder={'Client View'}
    onChange={onChange}
    className="basic-single"
    classNamePrefix="select"
    isSearchable={true}
    value={value}
    options={options}
    isClearable={true}
  />
};

export default AdvisorUserSelector;
