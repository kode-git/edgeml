FROM node:22-slim

# Use build_docker.sh to build images

WORKDIR /app

COPY ./src/dispatcher/ ./

RUN npm install && npm install -g tsx

EXPOSE 8090

CMD ["tsx", "app.ts"]