FROM node:20-alpine
WORKDIR /app
COPY package.json /app
RUN npm i
COPY dist/esm /app
CMD [ "node", "server.js" ]