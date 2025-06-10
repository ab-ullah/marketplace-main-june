import {INotification} from "../../../../interfaces/investorOwnership";
import React from "react";
import CapitalCallModal from "../../../CapitalCall/components/CapitalCallDetail/CapitalCallDetailsModal";

export const getNotificationUrl = (notification: INotification) => {
  // if (notification.capital_call) return <CapitalCallModal uuid={notification.capital_call.uuid}/>
  return <></>
}