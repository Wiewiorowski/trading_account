
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .

EXPOSE 3000

# Run the server directly with ts-node (no nodemon needed inside the container)
CMD ["node", "-r", "ts-node/register", "src/index.ts"]
