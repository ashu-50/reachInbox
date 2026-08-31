FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN npm ci

RUN npx prisma generate

RUN npm run build

EXPOSE 10000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]