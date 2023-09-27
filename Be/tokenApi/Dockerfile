FROM node:16

WORKDIR /usr/src/app
 
COPY package*.json ./ 

RUN npm ci --only=production

COPY  ./tokenApi.js ./

CMD [ "node", "tokenApi.js" ]