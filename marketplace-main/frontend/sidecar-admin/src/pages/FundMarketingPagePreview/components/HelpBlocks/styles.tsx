import styled from "styled-components";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

export const ParentDiv = styled.div`
  width: 100%;
  min-height: 232px;
  background: #EBF3FB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
`

export const IconDiv = styled.div`
  margin-bottom: 30px;
  
  img {
    width: 40px;
  }
`

export const LabelDiv = styled.div`
  position: absolute;
  top: 140px;
  text-align: center;
  width: 100%;
  padding: 10px;


  a {
    text-decoration: none;
    font-family: Inter;
    color: #2E86DE;
    font-style: normal;
    font-weight: normal;
    font-size: 24px;
    line-height: 36px;
  }
`

export const BlockCol = styled(Col)`
  padding-left: 0;
  padding-right: 20px;
`

export const WrapperRow = styled(Row)`
  margin: 0;
`

export const ParentCol = styled(Col)`
  padding: 40px 60px;
`