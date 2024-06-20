FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./
COPY src ./src
COPY .gitignore ./
COPY Dockerfile ./
RUN npm install
RUN npm run build
EXPOSE 4000

CMD ["node", "./dist/bin/www"]