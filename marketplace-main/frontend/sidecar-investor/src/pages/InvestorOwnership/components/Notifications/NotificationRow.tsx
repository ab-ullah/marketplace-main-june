import React, {FunctionComponent} from 'react';
import {INotification} from "../../../../interfaces/investorOwnership";
import DocumentsLinks from "./DocumentLinks";
import UnReadTag from "./UnreadTag";
import API from "../../../../api";
import {useAppDispatch} from "../../../../app/hooks";
import {markNotificationAsRead} from "../../investorOwnershipSlice";
import {fetchUnreadNotificationCount} from "../../../User/thunks";
import {standardizeDate} from "../../../../utils/dateFormatting";
import ApplicationLink from './ApplicationLink';


interface NotificationRowProps {
  notification: INotification,
  hideDueDate?: boolean;
}


const NotificationRow: FunctionComponent<NotificationRowProps> = ({notification, hideDueDate}) => {
  const dispatch = useAppDispatch();

  const markAsRead = async () => {
    if (notification.is_read) return;
    const payload = {is_read: true}
    await API.updateNotification(notification.id, payload)
    dispatch(fetchUnreadNotificationCount());
    dispatch(markNotificationAsRead(notification.id));
  }

  const onRowClick = () => {
    if (notification.is_read) return;
    if (!notification.details) return;
    markAsRead()
  }

  return <tr key={`${notification.id}-row`} onClick={onRowClick}>
    <td>{!notification.is_read && <UnReadTag/>}</td>
    <td>{standardizeDate(notification.created_at)}</td>
    <td>{notification.notification_type}</td>
    <td>{notification.fund_name}</td>
    {!hideDueDate && <td>{standardizeDate(notification.due_date)}</td>}
    {notification.details ? (<td>{notification.details}</td>) : (notification.application ? <td onClick={markAsRead}><ApplicationLink fundExtenalId={notification.fund_external_id}/></td>:
    <td onClick={markAsRead}><DocumentsLinks notification={notification}/></td>)}
  </tr>

};

export default NotificationRow;
