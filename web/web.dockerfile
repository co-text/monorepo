FROM nginx:1.24-alpine-slim
COPY dist/bundle/ /app
COPY nginx.conf /etc/nginx/conf.d/
