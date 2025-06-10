import React, {FunctionComponent, useState} from 'react';
import {Toast} from "react-bootstrap";
import announcementIcon from "../../assets/images/announcement.svg";
import styled from "styled-components";
import crossImage from "../../assets/images/close.svg"

const StyledImageDiv = styled.div`
  min-height: 40px;
  min-width: 40px;
  background: #FFF;
  text-align: center;
  vertical-align: middle;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
`

const NoDataText = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  color: #815804;
  display: flex;
  align-items: center;
  justify-content: center;
`

const StyledToast = styled(Toast)`
  width: 100%;
  margin: 0;
  padding-left: 40px;
  padding-right: 45px;
  background-color: #FDCE6F !important;

  @media screen and (max-width: 767px) {
    padding: 5px;
  }

  .toast-header {
    min-height: 80px;
    background-color: #FDCE6F;
  }
  
  .btn-close {
    background: transparent url(${crossImage}) no-repeat center center;
    background-size:     cover;
    min-width: 23px;
    min-height: 23px;
  }
`

const NoDataToast: FunctionComponent = () => {
  const [show, setShow] = useState<boolean>(true)

  return <StyledToast className="d-inline-block" bg={'warning'} key={'no-data-toast'} show={show} onClose={() => setShow(false)}>
    <Toast.Header>
      <StyledImageDiv>
        <img src={announcementIcon} className="rounded" alt=""/>
      </StyledImageDiv>
      <NoDataText className="me-auto">Most investment related data will be populated after quarterly NAV reporting</NoDataText>
    </Toast.Header>
  </StyledToast>
};

export default NoDataToast;
