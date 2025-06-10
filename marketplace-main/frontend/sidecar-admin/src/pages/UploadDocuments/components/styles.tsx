import styled from "styled-components";
import Form from "react-bootstrap/Form";

export const DropZoneContainer = styled.div`
  .MuiDropzoneArea-root {
    min-height: 270px;
  }
  
  .MuiTypography-h5 {
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 28px;
    line-height: 32px;
    color: #CBCBCE;
    margin-top: 50px
  }
  
  .MuiDropzonePreviewList-imageContainer {
    max-width: 200px;
    padding: 32px;
  }
`

export const SubmitButtonDiv = styled.div`
  width: 100%;
  text-align: center;

  button {
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 14px;
    padding: 5px 15px;
    background: #03145E;
    border-radius: 20px;
    color: #FFFFFF;
  }
`

export const StyledFormLabel = styled(Form.Label)`
  font-family: Quicksand;
  font-style: normal;
  font-weight: 500;
  font-size: 22px;
  line-height: 32px;
  color: #2E2E3A;
`