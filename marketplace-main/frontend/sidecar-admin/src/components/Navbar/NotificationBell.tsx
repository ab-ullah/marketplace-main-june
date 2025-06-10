import React, {FunctionComponent} from 'react';
import styled from "styled-components";

const StyledDiv = styled.div`
  margin-right: 20px;
  background: #C4C4C4;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  text-align: center;
  padding-top: 2px;
  cursor: pointer;
`
const NotificationBell: FunctionComponent = () => {
  const handleClick = () => {
    const titleElement = document.getElementById('notificationsTable')
    titleElement?.scrollIntoView({behavior: 'smooth'})
  }
  return <StyledDiv onClick={handleClick}>
    <img src="/assets/images/notification-bell.svg" width={'16px'} alt=""/>
  </StyledDiv>
};

export default NotificationBell;
