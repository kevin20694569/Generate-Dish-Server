FROM node:22.5
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./
COPY src ./src
COPY util ./util
RUN npm install
RUN npm run build
EXPOSE 80

CMD ["node", "./dist/bin/www"]