import mqtt, { MqttClient } from 'mqtt';
import { Logger } from '../utils/logger';
import { IMqttConfig } from './mqttConfig';


class MqttClientWrapper {
    private readonly client: MqttClient;
    private readonly config: IMqttConfig;
    private messageCallback?: (topic: string, message: string) => void;

    constructor(config: IMqttConfig) {
        this.config = config;
        this.client = mqtt.connect(this.config.brokerUrl, {
            port: this.config.port,
            clientId: this.config.clientId,
        });
    }

    public connect(onConnectCallback: () => void) {
        this.client.on('connect', () => {
            Logger.info('Connected to MQTT broker');
            onConnectCallback();
        });
    }

    public subscribe(topic: string, onMessageCallback: (topic: string, message: string) => void) {
        this.messageCallback = onMessageCallback;
        this.client.subscribe(topic, (err) => {
            if (err) {
                Logger.error(`Failed to subscribe to topic ${topic}: ${err.message}`);
            } else {
                Logger.info(`Subscribed to topic: ${topic}`);
            }
        });

        this.client.on('message', (topic, message) => {
            const messagePayload = message.toString();
            if (this.messageCallback) {
                this.messageCallback(topic, messagePayload);
            }
        });
    }

    public disconnect() {
        this.client.end();
        Logger.info('Disconnected from MQTT broker');
    }
}

export class MqttConsumer {
    private readonly mqttClientWrapper: MqttClientWrapper;
    private readonly config: IMqttConfig;

    constructor(config: IMqttConfig) {
        this.config = config;
        this.mqttClientWrapper = new MqttClientWrapper(config);
    }

    public start(externalCallback: (topic: string, message: string) => void) {
        this.mqttClientWrapper.connect(() => {
            this.mqttClientWrapper.subscribe(this.config.topic, externalCallback);
        });
    }

    public stop() {
        this.mqttClientWrapper.disconnect();
    }
}
