FROM node:16 as builder
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production 

RUN npm install typescript --save-dev

COPY . .

RUN npm run build


FROM node:16

WORKDIR /usr/src/app
 
COPY package*.json ./ 

RUN npm ci --only=production

COPY --from=builder /usr/src/app/build ./

EXPOSE 3001

CMD [ "node", "server.js" ]
