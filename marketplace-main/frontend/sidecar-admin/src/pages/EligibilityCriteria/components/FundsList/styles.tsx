import styled from "styled-components";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

export const FundListContainer = styled(Container)`
  padding: 30px 50px 80px 50px;
`

export const FundsHeading = styled(Col)`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 60px;
  color: #020203;
`

export const ChooseFundHeading = styled(Col)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
  margin: 15px 0 32px 0;
`

export const FundsListContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`

export const FundBlockDiv = styled.div`
  padding: 20px;
  background: #FFFFFF;
  width: 200px;
  margin-right: 1%;
  margin-top: 3% ;
  cursor: pointer;
  
  .fund-name {
    margin-top: 22px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 24px;
    color: #020203;
  }
`