import json
from pprint import pprint

import paho.mqtt.subscribe as subscribe

def on_message_print(client, userdata, message):
    try:
        print("topic:")
        print(message.topic)
        pprint(type(message.payload))
        print("body:")
        decoded_payload = message.payload.decode('utf-8')
        pprint(json.loads(decoded_payload), indent=2)
        userdata["message_count"] += 1
    except Exception as e:
        print("Errore nella print del messaggio")
        print(e)

subscribe.callback(on_message_print,
                   ["source/adaptive_twin/#", "adaptive_twin/#"],
                   port=1883,
                   userdata={"message_count": 0},
                   client_id="script_subscribe")
