FROM node:latest as builder
WORKDIR /usr/src/app


COPY . .

RUN  npm ci 

RUN  npm run build

FROM nginx:latest

COPY --from=builder /usr/src/app/build/public/ /usr/share/nginx/html

# Expose port 80 so that it can be accessed from outside the container
EXPOSE 80

# Start the Nginx server when the container starts
CMD ["nginx", "-g", "daemon off;"]
