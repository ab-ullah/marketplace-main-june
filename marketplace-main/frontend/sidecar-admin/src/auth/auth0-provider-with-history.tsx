import React from "react";
import {useHistory} from "react-router-dom";
import {Auth0Provider} from "@auth0/auth0-react";
import {AppState} from "@auth0/auth0-react/src/auth0-provider";

interface Auth0ProviderOptions {
  children: React.ReactElement;
}

const Auth0ProviderWithHistory = ({children}: Auth0ProviderOptions) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

  const history = useHistory();

  const onRedirectCallback = (appState: AppState) => {
    history.push(appState?.returnTo || window.location.pathname);
  };

  if (!(domain && clientId)) return <></>

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
      useCookiesForTransactions={true}
      audience={audience}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;