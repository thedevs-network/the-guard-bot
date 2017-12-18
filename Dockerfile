FROM node:alpine

COPY . /app
WORKDIR /app

RUN npm install

CMD npm start

