FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci --silent
EXPOSE 3000