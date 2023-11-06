FROM nginx:1.24-alpine-slim
COPY dist/bundle /app
COPY assets /app/assets
COPY nginx.conf /etc/nginx/conf.d/default.conf


