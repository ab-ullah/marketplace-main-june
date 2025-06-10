#!/bin/sh
find /usr/share/nginx/html/static/js/ -type f -exec sed -i -e "s,XX_REACT_APP_API_URL_XX,${REACT_APP_API_URL},g" {} \;
find /usr/share/nginx/html/static/js/ -type f -exec sed -i -e "s,XX_REACT_APP_AUTH0_DOMAIN_XX,${REACT_APP_AUTH0_DOMAIN},g" {} \;
find /usr/share/nginx/html/static/js/ -type f -exec sed -i -e "s,XX_REACT_APP_AUTH0_CLIENT_ID_XX,${REACT_APP_AUTH0_CLIENT_ID},g" {} \;
find /usr/share/nginx/html/static/js/ -type f -exec sed -i -e "s,XX_REACT_APP_AUTH0_AUDIENCE_XX,${REACT_APP_AUTH0_AUDIENCE},g" {} \;
find /usr/share/nginx/html/static/js/ -type f -exec sed -i -e "s,XX_REACT_APP_ENVIRONMENT_XX,${REACT_APP_ENVIRONMENT},g" {} \;
find /usr/share/nginx/html/static/js/ -type f -exec sed -i -e "s,XX_REACT_APP_SENTRY_DSN_XX,${REACT_APP_SENTRY_DSN},g" {} \;
find /usr/share/nginx/html/static/js/ -type f -exec sed -i -e "s,XX_REACT_APP_RELEASE_XX,${REACT_APP_RELEASE},g" {} \;
find /usr/share/nginx/html/static/js/ -type f -exec sed -i -e "s,XX_REACT_APP_WS_URL_XX,${REACT_APP_WS_URL},g" {} \;

nginx -g 'daemon off;'