import { Logger } from "../utils/logger";
import { Observer } from "./observer";
import * as fs from 'fs';
import * as path from 'path';

const historyFile = path.join('/app/data', 'record.json');

export class PerformanceMonitorObserver implements Observer {

    async update(cpuUsage: number, ramUsage: number): Promise<void> {
        if (cpuUsage > 80) {
            Logger.warn(`high cpu usage detected: ${cpuUsage}%`);
        }
        if (ramUsage > 2000) {
            Logger.warn(`high ram usage detected: ${ramUsage.toFixed(2)} mb`);
        }
    }
        
    /**
     * This method save an history file with the record of container RAM and CPU
     * @deprecated since v1.0.1
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