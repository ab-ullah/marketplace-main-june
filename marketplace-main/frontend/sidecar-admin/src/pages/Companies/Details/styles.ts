import styled from "styled-components";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";


export const Wrapper = styled(Container)`
  background: #ffffff;
  min-height: calc(100vh - 460px);
  margin-top: 76px;
  padding-left: 56px;

  h4 {
    font-family: Inter;
    font-style: normal;
    font-weight: bold;
    font-size: 40px;
    line-height: 60px;
    margin-left: 54px;
    margin-top: 50px;
    margin-bottom: 40px;
  }
  
  table {
    td {
      font-weight: 700;
    }
  }
  
  .task-type-heading {
    font-family: Inter;
    font-style: normal;
    font-weight: 400;
    font-size: 32px;
    line-height: 38px;
    margin-bottom: 37px;
  }
  
  .sub-heading {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 48px;
    color: #020203;
  }
  
  .table-container {
    //padding: 37px 56px 0 56px;
    min-height: calc(100vh - 100px)
  }
  
  .content-container {
    padding: 48px 56px;
  }

  //.add-doc-container .col, .company-info, .task-type-heading {
  //  margin: 24px 16px;
  //}

  .company-info {
    margin-bottom: 40px;
  }
`;

export const AddDocumentButton = styled(Col)`
  display: flex;
  flex-direction: row;
  align-items: center;
  align-content: flex-end;
  justify-content: flex-end;

  .add-document-button {
    cursor: pointer;
    background: #610094;
    border: 1px solid #F5F5F5;
    border-radius: 70px;
   
    padding: 10px 32px 10px 28px;
    max-width: 300px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .button-text {
      font-family: 'Quicksand';
      font-style: normal;
      font-weight: 700;
      font-size: 18px;
      line-height: 24px;
      color: #ffffff;
    }
    
    svg {
      fill: #ffffff;
    }
  }
`

export const AddNoticesButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
  margin-top: 1rem;
`