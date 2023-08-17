FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY ./client/package*.json ./client/
COPY ./server/package*.json ./server/
RUN npm ci --silent
COPY . .
RUN npm run build

# production environment
FROM nginx:stable
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000