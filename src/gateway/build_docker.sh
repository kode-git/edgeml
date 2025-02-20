
# Sync local development with dockerized version
cp -r src/driver/ containers/driver/src
cp -r  src/dispatcher/ containers/dispatcher/src
cp -r src/model/src containers/model/

docker-compose up --build

