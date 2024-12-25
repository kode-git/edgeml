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


const app = express();

app.use(express.json());

const trackerFrequency : number = 1 * 1000;
const rateLimiter = new RateLimiter("mqtt:test.mosquitto.org:8883", "#");

let optimizeInterval : NodeJS.Timeout; 

app.post('/', (req: Request, res: Response) => {
  const receivedData = JSON.parse(req.body.message);  


  rateLimiter.receiveData(receivedData);
  
  res.json({ status : 200 });
});

app.listen(8080, () => {
    Logger.info('Server is running on http://localhost:8080');

    const tracker = new SystemUsageTracker(trackerFrequency); 
    
    const logger = new LoggingObserver();
    const performanceMonitor = new PerformanceMonitorObserver();

    tracker.addObserver(logger);
    tracker.addObserver(performanceMonitor);

    tracker.startTracking();

    rateLimiter.startInboundTracking();

    optimizeInterval = setInterval(async () => {
      let ram : number = await tracker.getRamUsage()
      let cpu : number = await tracker.getCpuUsage()
      rateLimiter.update(Mode.Simple, ram, cpu)
    }, 1000 * 10) // Optimization over time in 10 seconds

});
