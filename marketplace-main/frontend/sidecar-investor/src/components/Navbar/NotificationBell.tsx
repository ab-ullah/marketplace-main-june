import React, {FunctionComponent} from 'react';
import styled from "styled-components";
import {useAppSelector} from "../../app/hooks";
import {selectNotificationFilters} from "../../pages/InvestorOwnership/selectors";

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

const UnreadImg = styled.img`
  position: absolute;
  top: 15px;
`

const NotificationBell: FunctionComponent = () => {
  const {has_unread_notification} = useAppSelector(selectNotificationFilters);
  const handleClick = () => {
    const titleElement = document.getElementById('notificationsTable')
    titleElement?.scrollIntoView({behavior: 'smooth'})
  }
  return <StyledDiv onClick={handleClick}>
    <img src="/assets/images/notification-bell.svg" width={'16px'} alt=""/>
    {has_unread_notification && <UnreadImg src="/assets/images/unread.svg" width={'16px'} alt=""/>}
  </StyledDiv>
};

export default NotificationBell;
