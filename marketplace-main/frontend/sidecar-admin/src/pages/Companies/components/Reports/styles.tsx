import styled from "styled-components";

export const SelectorDiv = styled.div`
  .select__control {
    border: 1px solid #D5DAE1;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    padding: 10px 14px;
  }

  .select__indicator-separator {
    display: none;
  }
  
  .select__menu {
    z-index: 20000;
  }
`

export const Filters = styled.div`
  display: flex;
  margin-bottom: 32px;
  
  .label {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #020203;
    margin-bottom: 8px;

  }
  .vehicle-selector {
    width: 40%;
    margin-right: 150px;
  }
  
  .year-selector {
    width: 150px;
  }
  
  `

export const TableHeading = styled.div`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 48px;
  margin-bottom: 16px;
  margin-top: 40px;
  `

export const DownloadButton = styled.div`
  background: #FFFFFF;
  border: 2px solid #3B3661;
  border-radius: 70px;
  padding: 10px 32px 10px 28px;
  font-family: 'Quicksand';
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  color: #3B3661;
  cursor: pointer;
  
  img {
    margin-right: 8px;
  }

`