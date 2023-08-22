FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY server ./server
RUN npm ci --silent
CMD ["npm", "run", "-w", "server", "start"]
EXPOSE 3000