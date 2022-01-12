# syntax=docker/dockerfile:1
FROM node:16-alpine AS client

WORKDIR /app

COPY client .
COPY

RUN npm run build

FROM node:16-alpine AS app

WORKDIR /app

COPY package* .

RUN npm install --only=production

COPY . .
COPY --from=client /app/build ./build

ENV NODE_ENV=production
ENV PORT 3000

EXPOSE $PORT
CMD ["node", "./bin/www"]



