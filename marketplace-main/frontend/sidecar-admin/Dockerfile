# Stage 1 - the build process
FROM 391503469783.dkr.ecr.us-west-2.amazonaws.com/sidecar-base-node:latest  as build-deps
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
copy .env.build ./.env
RUN yarn
COPY . ./
RUN yarn build

# Stage 2 - the production environment
FROM 391503469783.dkr.ecr.us-west-2.amazonaws.com/sidecar-base-nginx:latest
COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
COPY --from=build-deps /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-deps /usr/src/app/run_app.sh /run_app.sh

ENV REACT_APP_API_URL set-me
ENV REACT_APP_WS_URL set-me
ENV REACT_APP_AUTH0_DOMAIN set-me
ENV REACT_APP_AUTH0_CLIENT_ID set-me
ENV REACT_APP_AUTH0_AUDIENCE set-me

RUN if [ $(ls -1 /usr/share/nginx/html/static/js/ | wc -l) -eq 0 ]; then exit 1; fi

EXPOSE 8080
CMD ["/run_app.sh"]