FROM node:18-slim

WORKDIR /usr/src/app

# Install OpenSSL 1.1 for Prisma compatibility
RUN apt-get update && apt-get install -y openssl libssl1.1 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
RUN npx prisma generate

CMD ["npm", "run", "start:prod"]