FROM node:latest

WORKDIR /usr/src/app
 
COPY package.json ./ 

RUN npm ci --only=production

copy ./config.json ./
COPY  ./imageGenerator.js ./

CMD [ "node", "imageGenerator.js" ]