import styled from "styled-components";
import Modal from "react-bootstrap/Modal";

export const LogoContainer = styled.img`
  height: 240px;
  width: 240px;
  background: #FFF;
  object-fit: contain;
  padding: 8px;
`;

export const TableContainer = styled.div`
  height: 550px;

  .table-container {
    min-height: 450px !important;
    height: 450px !important;
  }

  .rs-table-cell-header {
    .rs-table-cell-content {
      font-family: 'Quicksand';
      font-style: normal;
      font-weight: 700;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0.02em;
      color: #ffffff;
    }
  }

  .rs-table-cell {
    .rs-table-cell-content {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .rs-table-cell-wrap {
      font-family: 'Quicksand';
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.02em;
      color: #020203;
    }
  }
`;

export const ReportsTable = styled.div`
  .table-container {
    min-height: 100px !important;
  }
  
  .rs-table-cell-header {
    .rs-table-cell-content {
      font-family: 'Quicksand';
      font-style: normal;
      font-weight: 700;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0.02em;
      color: #ffffff;
    }
  }

  .rs-table-cell {
    .rs-table-cell-content {
      display: flex;
      justify-content: left;
      align-items: center;
    }

    .rs-table-cell-wrap {
      font-family: 'Quicksand';
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.02em;
      color: #020203;
    }
  }

`


export const DocTitle = styled.div`
  font-family: 'Quicksand';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.02em;
  text-decoration-line: underline;
  color: #3A8DDF;
  cursor: pointer;
`;

export const DeleteIconWrapper = styled.div`
  svg {
    //fill: #F00;
    cursor: pointer;
  }
`;

export const DocumentUploadWrapper = styled.div`
  .container {
    padding: 0 !important;
  }
  
  .upload-container {
    margin-top: 8px !important;
  }
`

export const CheckboxWrapper = styled.div`
  .form-check-input:checked {
    background-color: #610094 !important;
    border: 1px solid #610094  !important;;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;;
    border-radius: 4px !important;;
  }
  `

export const DocumentFormDiv = styled.div`
  .text-label {
    font-family: 'Quicksand';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #020203;
    margin-bottom: 8px;
  }

  .text-input {
    border: 1px solid #D5DAE1;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 24px;
    height: 46px;
  }

  .field-label {
    font-family: 'Quicksand';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #020203;

  }

  .form-check {
    margin-top: 24px;
  }

  .gp-selector {
    margin-top: 24px;

    .select__control {
      border: 1px solid #D5DAE1;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      padding: 6px 14px;
    }

    .select__indicator-separator {
      display: none;
    }
  }
`

export const InfoForm = styled.div`
  .text-label {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #020203;
    margin-bottom: 8px;
  }

  .text-input {
    border: 1px solid #D5DAE1;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 24px;
    max-width: 480px;
    height: 46px;
  }

  .logo-upload {
    .hidden {
      display: none;
    }

    label {
      cursor: pointer;
      display: flex;
      align-items: center;
      background: #E4EAF6;
      padding: 10px 32px 10px 28px;
      color: #4A47A3;
      font-family: 'Quicksand';
      font-style: normal;
      font-weight: 700;
      font-size: 14px;
      line-height: 24px;

      border: 2px solid #4A47A3;
      border-radius: 70px;
      max-width: 180px;
      justify-content: space-between;

      img {
        width: 18px;
        height: 18px;
      }
    }
  }
  
  .logo-col {
    max-width: 400px;
  }
  
  .form-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .form-control:disabled {
    background-color: #ffffff !important; 
  }
`

export const ProgramDocumentDiv = styled.div`
  .heading {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 48px;
    color: #020203;
    margin-bottom: 8px;

  }
  
  .subtitle {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: #607D8B;
    margin-bottom: 24px;
  }
  
  `

export const StyledModal = styled(Modal)`
  .modal-header {
    padding: 24px !important;
  }

  .modal-body {
    padding: 24px !important;
  }

`