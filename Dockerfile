FROM node:alpine


RUN apk add git

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD npm start
