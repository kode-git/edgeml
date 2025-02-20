import logging
import time
from pprint import pprint
from uuid import uuid4

import paho.mqtt.client as mqtt
import json

TOPIC = "source/adaptive_twin/org.eclipse.ditto:adaptive_twin"
PAYLOAD_JSON_FILE = 'json_files/mqtt_message_payload.json'

# Define callback functions if needed
def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code.is_failure:
        print(f"Failed to connect: {reason_code}. loop_forever() will retry connection")
    else:
        # we should always subscribe from on_connect callback to be sure
        # our subscribed is persisted across reconnections.
        client.subscribe("$SYS/#")

def on_publish(client, userdata, mid, reason_code, properties):
    # reason_code and properties will only be present in MQTTv5. It's always unset in MQTTv3
    try:
        userdata.remove(mid)
    except KeyError:
        print("on_publish() is called with a mid not present in unacked_publish")
        print("This is due to an unavoidable race-condition:")
        print("* publish() return the mid of the message sent.")
        print("* mid from publish() is added to unacked_publish by the main thread")
        print("* on_publish() is called by the loop_start thread")
        print("While unlikely (because on_publish() will be called after a network round-trip),")
        print(" this is a race-condition that COULD happen")
        print("")
        print("The best solution to avoid race-condition is using the msg_info from publish()")
        print("We could also try using a list of acknowledged mid rather than removing from pending list,")
        print("but remember that mid could be re-used !")

logging.basicConfig(level=logging.DEBUG)
unacked_publish = set()
mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="org.eclipse.ditto:adaptive_twin")
mqttc.on_publish = on_publish
mqttc.on_connect = on_connect
mqttc.enable_logger()

mqttc.user_data_set(unacked_publish)
mqttc.connect('localhost', 1883)
mqttc.loop_start()

with open('%s' % PAYLOAD_JSON_FILE, 'r') as fp:
    payload = json.load(fp)
    payload['headers']['corralation-id'] = uuid4().hex
    pprint(payload, indent=2)

msg_info = mqttc.publish(TOPIC, json.dumps(payload), qos=0)
unacked_publish.add(msg_info.mid)

# Wait for all message to be published
while len(unacked_publish):
    time.sleep(0.1)

# Due to race-condition described above, the following way to wait for all publish is safer
msg_info.wait_for_publish()

mqttc.disconnect()
mqttc.loop_stop()
