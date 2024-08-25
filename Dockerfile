FROM node
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./
COPY src ./src
COPY util ./util
RUN npm install
RUN npm run build
EXPOSE 8080

CMD ["node", "./dist/bin/www"]