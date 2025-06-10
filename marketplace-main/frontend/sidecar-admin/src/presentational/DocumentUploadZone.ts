import styled from "styled-components";

export const DocumentUploadContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-style: dashed;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
  margin-top: 40px;
  background: #ffffff;
  border-color: #C1CEE9;
  
  p {
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #2E86DE !important;
  }
  
  .select-button {
    background: #FFFFFF;
    border: 1px dashed #C1CEE9;
    box-sizing: border-box;
    border-radius: 10px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 20px;
    color: #2E86DE;
    padding: 8px 18px;
    display: inline-block !important;
    
    :hover {
      background: #FFFFFF;
      border: 1px dashed #C1CEE9;
      color: #2E86DE;
    }
  }
`;