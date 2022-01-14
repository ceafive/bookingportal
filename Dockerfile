# syntax=docker/dockerfile:1
FROM node:16-alpine AS builder
WORKDIR /app
COPY client/package* .
RUN npx browserslist@latest --update-db && npm install
COPY client .
RUN  npm run build


# Prod runner
FROM node:16-alpine AS runner
WORKDIR /app
COPY package* .
RUN npm install --only=production
COPY . .
RUN rm -Rf /app/client
COPY --from=builder /app/build ./build
ENV NODE_ENV=production
ENV PORT 3000

EXPOSE $PORT
CMD ["node", "./bin/www"]



