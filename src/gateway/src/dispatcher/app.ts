/**
 * This dispatcher is made for the Innovation Project of Sense Reply 2024. The aim of this module
 * is to receive data from the driver and propagate to MQTT IoT Core broker with a specific throughput given by the 
 * input ML model. According to the mode and ML inference. It can adjust the throughput to optimize
 * resources for edge cost optimization or cloud cost optimization. 
 * @author Mario Sessa
 * @access private
 * @copyright 2024 
 * @license ISC
 */

import express, { Request, Response } from 'express';
import { RateLimiter } from './modules/performance/rateLimiter';
import { Logger } from './modules/utils/logger';
import { SystemUsageTracker } from './modules/performance/systemUsageTracker';
import { LoggingObserver } from './modules/observers/loggingObserver';
import { PerformanceMonitorObserver } from './modules/observers/performanceObserver';
import { Mode } from './modules/mode/mode';
import { IMqttConfig } from './modules/commands/mqttConfig';
import { MqttConsumer } from './modules/commands/commandsConsumer';
import { CommandPayload } from './modules/commands/commandPayload';


const app = express();

app.use(express.json());

// environment variables
const BROKER_URL = process.env.BROKER_URL ? process.env.BROKER_URL + "" : "mqtt:mosquitto:1883"
const TELEMETRY_TOPIC = process.env.TELEMETRY_TOPIC ? process.env.TELEMETRY + "" : "data"
const METRIC_TOPIC = process.env.METRIC_TOPIC ? process.env.METRIC + "" : "source/adaptive_twin/org.eclipse.ditto:adaptive_twin"
const COMMANDS_TOPIC = process.env.COMMANDS_TOPIC ? process.env.COMMANDS + "" : "adaptive_twin/org.eclipse.ditto:adaptive_twin/events"


// configuration for internal command client
const config: IMqttConfig = {
  brokerUrl: BROKER_URL,
  port: 1883,
  topic: COMMANDS_TOPIC,
};

let mqttConsumer: MqttConsumer;


const trackerFrequency: number = 1 * 1000;
// configuration for delimiter is inside the class definition
const rateLimiter = new RateLimiter(BROKER_URL, TELEMETRY_TOPIC, METRIC_TOPIC);

let optimizeInterval: NodeJS.Timeout;
let MODE: Mode = Mode.Throughput; // current mode, default value is simple

// Data inbound
app.post('/', (req: Request, res: Response) => {
  const receivedData = JSON.parse(req.body.message);
  rateLimiter.receiveData(receivedData);
  res.json({ status: 200 });
});

app.listen(8090, () => {
  Logger.info('Server is running on http://localhost:8090');

  const tracker = new SystemUsageTracker(trackerFrequency);

  const logger = new LoggingObserver();
  const performanceMonitor = new PerformanceMonitorObserver();

  tracker.addObserver(logger);
  tracker.addObserver(performanceMonitor);

  tracker.startTracking();

  rateLimiter.startInboundTracking();

  optimizeInterval = setInterval(async () => {
    let ram: number = await tracker.getRamUsage()
    let cpu: number = await tracker.getCpuUsage()
    rateLimiter.update(MODE, ram, cpu)
  }, 1000 * 10) // Optimization over time in 10 seconds



  mqttConsumer = new MqttConsumer(config);

  mqttConsumer.start((topic: string, message: string) => {
    try {
      let data: CommandPayload = JSON.parse(message);
      process.env.MAX_RAM = data.value.properties.maxRAM + "";
      process.env.MAX_CPU = data.value.properties.maxCPU + "";
      switch (data.value.properties.modeML) {
        case "resource":
          MODE = Mode.Resource; break;
        case "throughput":
          MODE = Mode.Throughput; break;
        default:
          MODE = Mode.Simple
      }

      Logger.debug("Setup Mode: " + MODE)

    } catch (e) {
      Logger.error("Error during consumed command message, not valid.")
    }

  });



});
