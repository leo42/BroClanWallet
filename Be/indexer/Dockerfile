FROM node:16

WORKDIR /usr/src/app
 
COPY Be/indexer/package*.json ./ 

RUN npm ci --only=production

COPY  Be/indexer/indexer.js Be/indexer/indexer.js

COPY shared ./shared

CMD [ "node", "Be/indexer/indexer.js" ]