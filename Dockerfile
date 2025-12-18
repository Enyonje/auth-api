FROM node:18-slim

WORKDIR /usr/src/app

# Install only required system deps
RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "start"]
