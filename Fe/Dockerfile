FROM node:latest as builder
WORKDIR /usr/src/app


COPY . .

RUN cd npm ci --only=production 

RUN cd shared/wallets && npm ci --only=production

RUN cd Fe && npm run build

FROM nginx:latest

COPY --from=builder /usr/src/app/Fe/build/public/ /usr/share/nginx/html

# Expose port 80 so that it can be accessed from outside the container
EXPOSE 80

# Start the Nginx server when the container starts
CMD ["nginx", "-g", "daemon off;"]
