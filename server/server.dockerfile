FROM node:20-slim
WORKDIR /app
COPY package.json /app
RUN yarn
COPY dist/esm /app
CMD [ "node", "server.js" ]