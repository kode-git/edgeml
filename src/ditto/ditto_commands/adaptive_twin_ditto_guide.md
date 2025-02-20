# Istruzioni
1. `docker compose up -d --wait`
2. Prima di tutto, creiamo la policy:
`curl -X PUT 'http://localhost:8080/api/2/policies/org.eclipse.ditto:adaptive_twin_policy' -u 'ditto:ditto' -H 'Content-Type: application/json' --data-binary @json_files/adaptive_twin_policy.json | jq`
3. Ora che la policy è stata creata, possiamo creare il Digital Twin (Thing):
`curl -X PUT 'http://localhost:8080/api/2/things/org.eclipse.ditto:adaptive_twin' -u 'ditto:ditto' -H 'Content-Type: application/json' --data-binary @json_files/adaptive_twin_thing.json | jq`
4. Creiamo una connessione MQTT in Ditto:
`curl -X POST 'http://localhost:8080/api/2/connections' -u 'devops:foobar' -H 'Content-Type: application/json' --data-binary @json_files/adaptive_twin_connection_mqtt.json | jq`
5. Installiamo le dipendenze python
`pip install -r ditto_commands/requirements.txt`
6. Il device si può sottoscrivere al topic MQTT 'adaptive_twin/org.eclipse.ditto:adaptive_twin/+' per ricevere aggiornamenti sul cambio di stato delle property di Ditto (quindi da comandi che arrivano da Grafana). Può usare lo script: 'mqtt-simple-subscribe.py'
7. Simuliamo un dato in arrivo dal device che cambia lo stato in Ditto:
   - [HTTPS] (**funziona**) `curl -X PUT 'http://localhost:8080/api/2/things/org.eclipse.ditto:adaptive_twin/features/deviceResources/properties' -u 'ditto:ditto' -H 'Content-Type: application/json' --data-binary @json_files/change-payload.json | jq`
   - [MQTT] (**funziona**) cambia value alla property mandando un messaggio sul topic "source/adaptive_twin/org.eclipse.ditto:adaptive_twin" `python3 ditto_commands/client-mqtt-ditto.py`

# Istruzioni per fare GET
- Puoi vedere lo stato corrente sulla Ditto UI: http://localhost:8080/ui/?filter=
- Per recuperare tutte le thing:
`curl -u ditto:ditto -X GET 'http://localhost:8080/api/2/search/things' | jq`
- Per recuperare una policy:
`curl -X GET 'http://localhost:8080/api/2/policies/org.eclipse.ditto:adaptive_twin_policy' -u 'ditto:ditto' | jq`
- Per recuperare una thing:
`curl -X GET 'http://localhost:8080/api/2/things/org.eclipse.ditto:adaptive_twin' -u 'ditto:ditto' | jq`