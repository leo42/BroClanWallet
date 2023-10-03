FROM node:latest

WORKDIR /usr/src/app
 
COPY  . .

RUN npm ci --only=production




CMD [ "node", "imageGenerator.js" ]