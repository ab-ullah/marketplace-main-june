import { FunctionComponent, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import {useAuth0} from "@auth0/auth0-react";
import {useAppDispatch} from "../../app/hooks";
import { NavTaskCount } from "./styles";
import { Link } from "react-router-dom";
import { ADMIN_URL_PREFIX } from "../../constants/routes";
import { getTaskCountURL } from "../../api/routes";
import { addTask } from "../../pages/Tasks/tasksSlice";

const MyTasksCount: FunctionComponent = () => {
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<any>([]);
  const {getAccessTokenSilently, isAuthenticated} = useAuth0();
  const dispatch = useAppDispatch()

  const { lastMessage } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    reconnectAttempts: 5,
    reconnectInterval: 3000
  });
  
  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      if(data.count !== notificationCount)
        setNotificationCount(data.count);
      if(data.task)
        dispatch(addTask(data.task))
    }
  }, [dispatch, lastMessage, notificationCount, setNotificationCount]);

  useEffect(() => {
    if(isAuthenticated)
    getAccessTokenSilently().then((token: any) => {
      if(token){
        setSocketUrl(getTaskCountURL(token));
      }
    });
  }, [getAccessTokenSilently, isAuthenticated]);


  return (
    <NavTaskCount>
      <Link to={`/${ADMIN_URL_PREFIX}/tasks/`}>My Tasks </Link>
      <span className={"count"}>{notificationCount}</span>
    </NavTaskCount>
  );
};

export default MyTasksCount;
