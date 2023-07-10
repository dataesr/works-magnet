FROM node:18-alpine
WORKDIR /app

COPY server ./
RUN npm ci --silent
EXPOSE 3000