FROM node:latest as builder
WORKDIR /usr/src/app

COPY Fe/package*.json ./

RUN npm ci --only=production 

RUN npm install typescript --save-dev

COPY . .

RUN cd Fe && npm run build



FROM nginx:latest

COPY --from=builder /usr/src/app/Fe/build/public/ /usr/share/nginx/html

# Expose port 80 so that it can be accessed from outside the container
EXPOSE 80

# Start the Nginx server when the container starts
CMD ["nginx", "-g", "daemon off;"]
