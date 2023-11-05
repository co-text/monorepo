FROM node:20-alpine
COPY dist/esm /app
COPY package.json /app
WORKDIR /app
RUN npm i
CMD [ "node", "server.js" ]