FROM node:latest

WORKDIR /usr/src/app
 
COPY Be/passthrough/package*.json ./ 

RUN npm ci --only=production

RUN npm install cbor

COPY Be/passthrough/passtrough.js ./

EXPOSE 3002

CMD [ "node", "passtrough.js" ]