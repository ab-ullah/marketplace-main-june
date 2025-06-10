import styled from "styled-components";

export const PendingReviewDiv = styled.div`
  background: #D5DAE1;
  border: 2px solid #607D8B;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  gap: 16px;
  margin-bottom: 50px;
  
  .left-div {
    display: flex;
  }

  .label {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 36px;
    color: #607D8B;
    margin-right: 8px;
  }

  .value {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 36px;
    color: #607D8B;
  }
  
  .action {
    border: 2px dashed #607D8B;
    border-radius: 100px;
    font-family: 'Quicksand';
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 36px;
    color: #607D8B;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 24px;
    
    img {
      margin-left: 8px;
    }
  }

`



export const ReadyForNextStepDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  gap: 16px;
  background: #10AC84;
  border-radius: 8px;
  margin-bottom: 50px;
  
  .left-div {
    display: flex;
  }

  .label {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 36px;
    color: #FFFFFF;
    margin-right: 8px;
  }

  .value {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 36px;
    color: #FFFFFF;
  }
  
  .action {
    background: #FFFFFF;
    border: 2px solid #FFFFFF;
    border-radius: 100px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 24px;
    box-sizing: border-box;
    font-family: 'Quicksand';
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 36px;
    color: #10AC84;
    cursor: pointer;
    text-decoration: none !important;

    img {
      margin-left: 8px;
    }
  }

`


export const ChangesRequestedDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  gap: 16px;
  background: rgba(255, 133, 45, 0.16);
  border: 2px solid #E37628;
  border-radius: 8px;
  margin-bottom: 50px;
  
  .left-div {
    display: flex;
  }

  .label {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 36px;
    color: #E37628;
    margin-right: 8px;
  }

  .value {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 36px;
    color: #E37628;
  }
  
  .action {
    background: #E37628;
    border: 2px solid #E37628;
    border-radius: 100px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 24px;
    box-sizing: border-box;
    font-family: 'Quicksand';
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 36px;
    color: #FFFFFF;
    cursor: pointer;

    img {
      margin-left: 8px;
    }
  }

`