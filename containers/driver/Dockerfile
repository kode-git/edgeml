FROM node:22-slim

# Use build_docker.sh to build images
WORKDIR /app

COPY ./src/driver/ ./

RUN npm install && npm install -g tsx typescript

CMD ["tsx", "app.ts"]