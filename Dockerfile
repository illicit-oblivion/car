FROM node:16.10.0 as build
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
# ENV REACT_APP_HOST_IP_ADDRESS localhost

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL $REACT_APP_API_URL

COPY package.json /app/package.json
RUN yarn install
COPY . /app

RUN yarn build
FROM nginx:1.16.0-alpine
COPY --from=build /app/build /usr/share/nginx/html

COPY ["docker-configs/default.conf", "/etc/nginx/conf.d/default.conf"]

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
