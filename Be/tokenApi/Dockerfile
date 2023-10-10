FROM node:16

WORKDIR /usr/src/app
 
COPY ./Be/tokenApi/package*.json ./ 

RUN npm ci --only=production

COPY  ./Be/tokenApi/tokenApi.js ./

CMD [ "node", "tokenApi.js" ]