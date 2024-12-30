// RateLimiter.ts
import path from "path";
import { Mode } from "../mode/mode";
import { BasicModel } from "../model/basicModel";
import { ModelStrategy } from "../model/Model";
import { OptimizationResult } from "../model/optimizationResult";
import { MessageSender } from "../outbound/messageSender";
import { Logger } from "../utils/logger";
import { PerformanceTracker } from "./performanceTracker";
import * as fs from 'fs';

// performance history file is unique for all the rate limiters
const historyFile : string = path.join('/app/data', 'performance.json');

export class RateLimiter {
  private readonly buffer: string[] = [];
  private readonly performanceTracker: PerformanceTracker;
  private readonly optimizer: ModelStrategy;
  private outboundMessageSize: number;
  private outboundMessagePerSec: number;
  private readonly brokerUrl: string;
  private readonly topic: string;

  constructor(brokerUrl: string, topic: string) {
    this.outboundMessageSize = 2000;
    this.outboundMessagePerSec = 0;
    this.performanceTracker = new PerformanceTracker();
    this.optimizer = new BasicModel();
    this.brokerUrl = brokerUrl;
    this.topic = topic;
  }

  receiveData(data: string): void {
    this.buffer.push(data);
    this.performanceTracker.updateRequestInbound(data);
  }

  startInboundTracking(): void {
    this.performanceTracker.startTracking((requestPerSec : number, BytesPerSec: number) => {
      this.outboundMessageSize = 1000; // Recalculate outbound message size if needed
      Logger.info(`Updated performance: Buffer Size: ${this.buffer.length} | Requests/s: ${requestPerSec.toFixed(2)} | Bytes/s: ${BytesPerSec.toFixed(2)}`);
      RateLimiter.recordUsage(requestPerSec, BytesPerSec, this.buffer.length);
    });
  }

    /**
     * This method save an history file with the record of container RAM and CPU
     * @param requestPerSec is the current requests inbound from the driver at second order (frequency)
     * @param bytesPerSec is the current bytes inbound that the dispatcher have in bytes/s
     * @param bufferSize is the size of the buffer or poll of data that the dispatcher needs to flush off
     */
    static async recordUsage(requestPerSec: number, bytesPerSec: number, bufferSize: number) : Promise<void> {
        const timestamp = new Date().toISOString();
        const usageData = { timestamp, requestPerSec, bytesPerSec, bufferSize };
        try {
          const data = await fs.promises.readFile(historyFile, 'utf8');
          const history = JSON.parse(data) || [];
          history.push(usageData);
          await fs.promises.writeFile(historyFile, JSON.stringify(history, null, 2), 'utf8');
        
        } catch (err: any) {
          
            if (err.code === 'ENOENT') {
            
                await fs.promises.writeFile(historyFile, JSON.stringify([usageData], null, 2), 'utf8');
                Logger.info('Performance history file created');
          
        } else {
            Logger.error('Error handling performance history file: ' + err);
          }
        }
      }


  async getCurrentPerformance(): Promise<[number, number]> {
    return [this.performanceTracker.requestPerSec, this.performanceTracker.BytesPerSec];
  }

  public async update(mode: Mode, ram: number, cpu: number): Promise<void> {
    let optimalValues: OptimizationResult;

    switch (mode) {
      case Mode.Simple:
        optimalValues = this.optimizer.optimize(this.performanceTracker.requestPerSec, this.performanceTracker.BytesPerSec, ram, cpu, this.performanceTracker.BytePerRequest);
        this.outboundMessageSize = optimalValues.S;
        this.outboundMessagePerSec = optimalValues.M;
        break;
      case Mode.Resource:
        // TODO: optimizer per resources (minimize resources)
        break;
      case Mode.Throughput:
        // TODO: Optimize per throughput (maximize throughput)
        break;
      default:
        Logger.error("Unknown mode, no effect defined");
        break;
    }

    await this.startSending();
  }

  private async startSending(): Promise<void> {
    const sendMessageCommand = new MessageSender({
      buffer: this.buffer,
      outboundMessageSize: this.outboundMessageSize,
      messagePerSec: this.outboundMessagePerSec,
      brokerUrl: this.brokerUrl,
      topic: this.topic
    });

    await sendMessageCommand.execute();
  }
}

