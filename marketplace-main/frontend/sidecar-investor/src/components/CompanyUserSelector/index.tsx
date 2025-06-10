import React, {FunctionComponent} from 'react';
import styled from "styled-components";
import Select, {OptionTypeBase} from "react-select";
import {useAppSelector} from "../../app/hooks";
import {selectCompanyUsers, selectConsiderationUsers} from "../../pages/User/selectors";
import {useLocation} from "react-router-dom";

interface CompanyUserSelectorProps {
  onChange: any;
  value: OptionTypeBase | null | undefined;
}

const StyledSelect = styled(Select)`
  .select__control {
    min-width: 250px;
  }
`


const CompanyUserSelector: FunctionComponent<CompanyUserSelectorProps> = ({onChange, value}) => {
  const companyUsers = useAppSelector(selectCompanyUsers)
  const considerationUsers = useAppSelector(selectConsiderationUsers)
  const location = useLocation()
  const isNoticesPage = location.pathname.includes('/notices') || location.pathname.includes('/firms');
  let targetUsers = companyUsers;

  if (isNoticesPage) {
    targetUsers = considerationUsers
  }

  if (!targetUsers || !targetUsers.length) return <></>


  const options = targetUsers.map(companyUser => ({label: companyUser.display_name, value: companyUser.user_id}))
  return <StyledSelect
    placeholder={'View As'}
    onChange={onChange}
    className="basic-single"
    classNamePrefix="select"
    isSearchable={true}
    value={value}
    options={options}
  />
};

export default CompanyUserSelector;
