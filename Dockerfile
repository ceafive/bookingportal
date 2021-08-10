# syntax=docker/dockerfile:1
FROM node:current-alpine AS base


# set working directory
WORKDIR /app
#
RUN mkdir ./client
#
# copy required application files
COPY ./client/ ./client/
#
# install all needed node module packages for frontend portal
WORKDIR /app/client
RUN npm install 
#
#
# build application for production
RUN npm run build
# start application in working directory
#WORKDIR /app
#
#CMD [ "node", "./bin/www" ]
#
FROM node:current-alpine
#
# Set environment to production
ENV NODE_ENV=production
#
#
# set working directory
WORKDIR /app
#
# create respective application directories
RUN mkdir ./bin
RUN mkdir ./client
RUN mkdir ./client/build
RUN mkdir ./routes
RUN mkdir ./utils
#
COPY --from=0 /app/client/build ./client/build/
COPY ./bin/ ./bin/
COPY ./routes/ ./routes/
COPY ./utils ./utils/
#
COPY ./app.js .
COPY ./favicon.ico .
COPY ./package.json .
COPY ./package-lock.json .
#
RUN npm install --production
#
EXPOSE 5000
CMD [ "node", "./bin/www" ]