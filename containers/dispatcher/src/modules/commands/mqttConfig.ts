export interface IMqttConfig {
    brokerUrl: string;
    port: number;
    topic: string;
    clientId?: string;
}