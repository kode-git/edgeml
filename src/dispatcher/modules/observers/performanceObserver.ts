import { Logger } from "../utils/logger";
import { Observer } from "./observer";
import * as fs from 'fs';
import * as path from 'path';

const historyFile = path.join('/app/data', 'record.json');

export class PerformanceMonitorObserver implements Observer {

    async update(cpuUsage: number, ramUsage: number): Promise<void> {
        let maxRam, maxCpu : number;

        maxRam = process.env.MAX_RAM ? parseInt(process.env.MAX_RAM) : 85
        maxCpu = process.env.MAX_CPU ? parseInt(process.env.MAX_CPU) : 85

        if (Number.isNaN(maxCpu)) {
            Logger.warn("Input max CPU is not a valid number, set to default value")
            maxCpu = 85
        }

        if(Number.isNaN(maxRam)) {
            Logger.warn("Input max RAM is not a valid number, set to default value")
            maxCpu = 85
        }

        if (cpuUsage > maxCpu) {
            Logger.warn(`high cpu usage detected: ${cpuUsage}%`);
        }
        if (ramUsage > maxRam) {
            Logger.warn(`high ram usage detected: ${ramUsage.toFixed(2)} mb`);
        }
        await this.recordUsage(cpuUsage, ramUsage);
    }
        
    /**
     * This method save an history file with the record of container RAM and CPU
     * @param cpuUsage is the current CPU sample in %
     * @param ramUsage is the current RAM sample in MB
     */
    async recordUsage(cpuUsage: number, ramUsage: number) {
        const timestamp = new Date().toISOString();
        const usageData = { timestamp, cpuUsage, ramUsage };
        try {
          const data = await fs.promises.readFile(historyFile, 'utf8');
          const history = JSON.parse(data) || [];
          history.push(usageData);
          await fs.promises.writeFile(historyFile, JSON.stringify(history, null, 2), 'utf8');
       
        } catch (err: any) {
          
            if (err.code === 'ENOENT') {
            
                await fs.promises.writeFile(historyFile, JSON.stringify([usageData], null, 2), 'utf8');
                Logger.info('History file created');
          
        } else {
            Logger.error('Error handling history file: ' + err);
          }
        }
      }
      
    
}