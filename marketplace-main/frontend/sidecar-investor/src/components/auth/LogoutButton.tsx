import React from "react";
import {useAuth0} from "@auth0/auth0-react";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

const LogoutButton = () => {
  const {logout} = useAuth0();
  return (
    <ExitToAppIcon
      onClick={() =>
        logout({
          returnTo: window.location.origin,
        })
      }
    />
  );
};

export default LogoutButton;