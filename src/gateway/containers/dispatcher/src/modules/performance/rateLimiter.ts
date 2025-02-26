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
import { SocketClient } from "../socket/client";

// performance history file is unique for all the rate limiters

const historyFile: string = path.join('/app/data', 'performance.json');

export class RateLimiter {
  private readonly buffer: string[] = [];
  private readonly performanceTracker: PerformanceTracker;
  private readonly optimizer: ModelStrategy;
  private outboundMessageSize: number;
  private outboundMessagePerSec: number;
  private readonly brokerUrl: string;
  private readonly telemetryTopic: string;
  private readonly metricTopic: string;
  private readonly clientResource: SocketClient;
  private readonly clientThroughput: SocketClient;

  constructor(brokerUrl: string, telemetryTopic: string, metricTopic: string) {
    this.outboundMessageSize = 2000;
    this.outboundMessagePerSec = 0;
    this.performanceTracker = new PerformanceTracker();
    this.optimizer = new BasicModel();
    this.brokerUrl = brokerUrl;
    this.telemetryTopic = telemetryTopic;
    this.metricTopic = metricTopic;
    this.clientResource = new SocketClient("localhost", 65414);
    this.clientThroughput = new SocketClient("localhost", 65415);
    this.clientResource.start();
    this.clientThroughput.start();
  }

  receiveData(data: string): void {
    this.buffer.push(data);
    this.performanceTracker.updateRequestInbound(data);
  }

  startInboundTracking(): void {
    this.performanceTracker.startTracking((requestPerSec: number, BytesPerSec: number) => {
      this.outboundMessageSize = 1000; // Recalculate outbound message size if needed
      Logger.info(`Updated performance: Buffer Size: ${this.buffer.length} | Requests/s: ${requestPerSec.toFixed(2)} | Bytes/s: ${BytesPerSec.toFixed(2)}`);
      // RateLimiter.recordUsage(requestPerSec, BytesPerSec, this.buffer.length);
    });
  }

  /**
   * This method save an history file with the record of container RAM and CPU
   * @param requestPerSec is the current requests inbound from the driver at second order (frequency)
   * @param bytesPerSec is the current bytes inbound that the dispatcher have in bytes/s
   * @param bufferSize is the size of the buffer or poll of data that the dispatcher needs to flush off
   */

  static async recordUsage(requestPerSec: number, bytesPerSec: number, bufferSize: number): Promise<void> {
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
    let data: Float64Array<ArrayBuffer>
    let buffer: Buffer

    switch (mode) {
      case Mode.Simple:
        optimalValues = this.optimizer.optimize(this.performanceTracker.requestPerSec, this.performanceTracker.BytesPerSec, ram, cpu, this.performanceTracker.BytePerRequest);
        this.outboundMessageSize = optimalValues.S;
        this.outboundMessagePerSec = optimalValues.M;
        break;
      case Mode.Resource:
        data = new Float64Array([cpu, ram, this.performanceTracker.requestPerSec, this.performanceTracker.BytesPerSec]); // [cpuUsage, ramUsage, requestPerSec, bytesPerSec]
        buffer = Buffer.from(data.buffer)
        this.clientResource.sendData(buffer)
        break;
      case Mode.Throughput:
        data = new Float64Array([cpu, ram, this.performanceTracker.requestPerSec, this.performanceTracker.BytesPerSec]); // [cpuUsage, ramUsage, requestPerSec, bytesPerSec]
        buffer = Buffer.from(data.buffer)
        this.clientThroughput.sendData(buffer)
        break;
      default:
        Logger.error("Unknown mode, no effect defined");
        break;
    }

    await this.startSending(cpu, ram);
  }

  private async startSending(cpu: number, ram: number): Promise<void> {
    const sendMessageCommand = new MessageSender({
      buffer: this.buffer,
      outboundMessageSize: this.outboundMessageSize,
      messagePerSec: this.outboundMessagePerSec,
      brokerUrl: this.brokerUrl,
      topic: this.telemetryTopic
    });

    await sendMessageCommand.execute();
    sendMessageCommand.publish(this.metricTopic, {
      topic: "org.eclipse.ditto/adaptive_twin/things/twin/commands/modify",
      headers: {},
      path: "/features/deviceResources/properties",
      value: {
        currentCPU: cpu,
        currentRAM: ram,
        throughput: this.calculateThroughput(this.outboundMessagePerSec, this.outboundMessageSize)
      }
    })

  }

  calculateThroughput(messagePerSec: number, messageSize: number): number {
    return messagePerSec * messageSize // total bytes / amount of time (1s), the throughput is defined at seconds level
  }
}

