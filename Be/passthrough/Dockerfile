FROM node:16

WORKDIR /usr/src/app
 
COPY package*.json ./ 

RUN npm ci --only=production

RUN npm install cbor

COPY  ./passtrough.js ./

EXPOSE 3002

CMD [ "node", "passtrough.js" ]