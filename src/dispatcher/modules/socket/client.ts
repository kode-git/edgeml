import * as net from "net";
import { Logger } from "../utils/logger";
class SocketClient {

    private readonly host: string
    private readonly port: number;
    private client: net.Socket;

    constructor(host: string = "127.0.0.1", port: number = 65432) {
        this.host = host;
        this.port = port;
        this.client = new net.Socket();
    }

    private createSampleData(): Buffer {
        const data = new Float64Array([0.5, 134.389, 0, 0]); // Example: [cpuUsage, ramUsage, requestPerSec, bytesPerSec]
        return Buffer.from(data.buffer);
    }

    private unpackResponse(data: Buffer): { predictedMps: number; predictedSize: number } {
        const predictedMps = data.readFloatLE(0);
        const predictedSize = data.readFloatLE(4);
        return { predictedMps, predictedSize };
    }

    public start(): void {
        this.client.connect(this.port, this.host, () => {
            Logger.info(`Connected to server at ${this.host}:${this.port}`);
        });

        this.client.on("data", (data) => {
            const { predictedMps, predictedSize } = this.unpackResponse(data);
            Logger.info(`Predicted optimalMessagesPerSec: ${predictedMps}`);
            Logger.info(`Predicted optimalMessageSize: ${predictedSize}`);
        });

        this.client.on("close", () => {
            Logger.info("Connection closed.");
        });

        this.client.on("error", (err) => {
            console.error("Error:", err.message);
        });
    }

    public sendData(data?: Buffer): void {
        const dataToSend = data || this.createSampleData(); 

        if (!this.client.writable) {
            console.warn("Socket is not writable. Attempting to reconnect...");
            this.reconnect(() => {
                Logger.info("Reconnected. Sending data...");
                this.client.write(dataToSend);
            });
        } else {
            this.client.write(dataToSend);
        }
    }

    private reconnect(callback: () => void): void {
        if (this.client) {
            this.client.destroy();
            Logger.info("Destroyed the existing client.");
        }
    
        this.client = new net.Socket();
        this.client.connect(this.port, this.host, () => {
            Logger.info(`Reconnected to server at ${this.host}:${this.port}`);
            callback(); 
        });
    
        this.client.on("data", (data) => {
            const { predictedMps, predictedSize } = this.unpackResponse(data);
            Logger.info(`Predicted optimalMessagesPerSec: ${predictedMps}`);
            Logger.info(`Predicted optimalMessageSize: ${predictedSize}`);
        });
    
        this.client.on("close", () => {
            Logger.info("Connection closed.");
        });
    
        this.client.on("error", (err) => {
            console.error("Error:", err.message);
        });
    }

    public close(): void {
        this.client.end(() => {
            Logger.info("Connection closed by client.");
        });
    }
}

const client = new SocketClient("127.0.0.1", 65432);

Logger.info('Starting client');
client.start();

setInterval(() => {
    client.sendData(); // Sends the default sample data
}, 1000);
