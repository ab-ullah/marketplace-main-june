import styled from "styled-components";
import Table from "react-bootstrap/Table";
import Col from "react-bootstrap/Col";

export const FundInformationTable = styled(Table)`

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


export const FundInformationParent = styled.div`
  padding: 40px 60px;
`

export const MainHeading = styled(Col)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 32px;
  line-height: 38px;
  color: #020203;
  margin-top: 60px;
  margin-bottom: 32px;
`

export const SubHeading = styled(Col)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
  margin-bottom: 24px;
`
