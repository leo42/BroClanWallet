FROM node:latest

WORKDIR /usr/src/app
 
COPY  ./Be/imageGenerator .

RUN npm ci --only=production


CMD [ "node", "imageGenerator.js" ]