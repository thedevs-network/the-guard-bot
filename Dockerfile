FROM node:alpine

COPY . /app
WORKDIR /app

RUN apk add git && npm install

CMD npm start

