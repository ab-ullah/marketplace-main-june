import React, {FunctionComponent} from 'react';
import get from "lodash/get";
import styled from "styled-components";
import Table from "react-bootstrap/Table";
import {IFundWithProfile} from "../../../../interfaces/fundProfile";


const FundInformationTable = styled(Table)`

  tr {
    border-top: none !important;
  }

  tr {
    border-bottom: 1px #ECEFF1 solid;
  }

  td {
    padding-top: 16px;
    padding-bottom: 16px;
    border-top: none;
  }

  td:nth-child(1) {
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #020203;
    border-top: none;
    padding-right: 10px;
  }

  td:nth-child(2) {
    font-family: Quicksand;
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    color: #020203;
    border-top: none;
    padding-left: 10px;
  }

`

interface Mapping {
  label: string | React.ReactNode;
  path?: string
  component?: React.ReactNode
}


interface FundInfoTableProps {
  fund: IFundWithProfile,
  mappings: Mapping[]
}


const FundInfoTable: FunctionComponent<FundInfoTableProps> = ({fund, mappings}) => {

  return <FundInformationTable responsive="md">
    {mappings.map((mapping) => <tr>
        <td>{mapping.label}</td>
        {mapping.path && <td>{get(fund, mapping.path)}</td>}
        {mapping.component && <td>{mapping.component}</td>}
      </tr>
    )}
  </FundInformationTable>
};

export default FundInfoTable;
