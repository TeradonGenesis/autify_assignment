# Step 1: Use an official Node.js runtime as the base image
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY .env.sample .env
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "start", "--"]