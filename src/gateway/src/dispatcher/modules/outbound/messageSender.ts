// SendMessageCommand.ts
import mqtt from 'mqtt';
import { MessageSenderParams } from './messageSenderParams';
import { MetricPayload } from './metricsPayload';
import { Logger } from '../utils/logger';


export class MessageSender {
  private readonly client: mqtt.MqttClient;

  constructor(private readonly params: MessageSenderParams) {
    this.client = mqtt.connect(params.brokerUrl);
  }

  publish(topic : string, message : MetricPayload) {
    this.client.publish(topic, JSON.stringify(message), (err : any) => {
      if(err) Logger.error(`Error during send metrics: ${err}`);
    });
  }

  async execute(): Promise<void> {
    const { buffer, outboundMessageSize, messagePerSec, topic } = this.params;
    const batches = this.createBatches(buffer, outboundMessageSize, messagePerSec);

    // Send messages in parallel
    await Promise.all(
      batches.map(batch => {
        return new Promise((resolve, reject) => {
          this.client.publish(topic, JSON.stringify(batch), (err : any) => {
            if (err) reject(err);
            resolve(`Batch sent: ${batch}`);
          });
        });
      })
    );
  }

  private createBatches(buffer: string[], outboundMessageSize: number, messagePerSec: number): string[][] {
    const batches: string[][] = [];
    let currentBatch: string[] = [];
    let currentBatchSize = 0;

    while (buffer.length > 0 && batches.length < messagePerSec) {
      const item = buffer.shift()!;
      const itemSize = Buffer.byteLength(item, 'utf-8');
      
      if (currentBatchSize + itemSize <= outboundMessageSize) {
        currentBatch.push(item);
        currentBatchSize += itemSize;
      } else {
        batches.push(currentBatch);
        currentBatch = [item];
        currentBatchSize = itemSize;
      }
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch); // Add any remaining batch
    }

    return batches;
  }
}
