import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {store} from './app/store';
import {Provider} from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import * as Sentry from '@sentry/react';
import {Integrations} from '@sentry/tracing';
import Auth0ProviderWithHistory from "./auth/auth0-provider-with-history";
import GlobalCSS from './assets/styles/global';

if (process.env.REACT_APP_ENVIRONMENT && process.env.REACT_APP_ENVIRONMENT !== 'local') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_ENVIRONMENT,
    release: process.env.REACT_APP_RELEASE,
    integrations: [new Integrations.BrowserTracing()],
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <GlobalCSS />
      <Router>
        <Auth0ProviderWithHistory>
          <App/>
        </Auth0ProviderWithHistory>
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
