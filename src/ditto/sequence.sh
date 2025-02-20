compose_file=$( readlink -f "$1")"/docker-compose.yml"
echo "compose_file: $compose_file"

# delete all docker volumes
echo "Remove running containers"
docker rm -f $(docker ps -aq)
sleep 5
echo "Remove volumes"
docker volume rm $(docker volume ls -q)
sleep 5
echo "Run ditto and mosquitto"
docker compose -f $compose_file up -d --wait

DIR="$(dirname "${BASH_SOURCE[0]}")"
echo "DIR $DIR"
cd $DIR
echo "Working directory: $(pwd)"

echo "Create a Ditto Policy"
curl -X PUT 'http://localhost:8080/api/2/policies/org.eclipse.ditto:adaptive_twin_policy' -u 'ditto:ditto' -H 'Content-Type: application/json' --data-binary @json_files/adaptive_twin_policy.json | jq
sleep 5
echo "Create a Ditto Thing"
curl -X PUT 'http://localhost:8080/api/2/things/org.eclipse.ditto:adaptive_twin' -u 'ditto:ditto' -H 'Content-Type: application/json' --data-binary @json_files/adaptive_twin_thing.json | jq
sleep 5
echo "Create a Ditto Connection"
curl -X POST 'http://localhost:8080/api/2/connections' -u 'devops:foobar' -H 'Content-Type: application/json' --data-binary @json_files/adaptive_twin_connection_mqtt.json | jq