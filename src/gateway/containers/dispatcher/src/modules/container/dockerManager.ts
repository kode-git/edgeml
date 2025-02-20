
import * as fs from 'fs';
import Docker from 'dockerode';
import { Logger } from '../utils/logger';
import { exec } from 'child_process';

function getHostname(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec('cat /etc/hostname', (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to execute command: ${error.message}`));
          return;
        }
        if (stderr) {
          reject(new Error(`stderr: ${stderr}`));
          return;
        }
        resolve(stdout.trim()); // Remove any extra newlines or spaces
      });
    });
  }

export class DockerManager {

    private readonly docker : Docker;
    private containerId : string;

    constructor(){
        this.docker = new Docker();
        this.containerId = "";
    }


    public async initialize() : Promise<void>{
        this.containerId =  await getHostname()
        console.log(this.containerId);
    }


    async getCPUUsage(): Promise<number> {
        try {
            
            const container = this.docker.getContainer(this.containerId);
            const stats = await container.stats({ stream: false });
        
            const cpuUsage = stats.cpu_stats.cpu_usage.total_usage;
            const systemUsage = stats.cpu_stats.system_cpu_usage;
            const previousCpuUsage = stats.precpu_stats.cpu_usage.total_usage;
            const previousSystemUsage = stats.precpu_stats.system_cpu_usage;
        
            const cpuDelta = cpuUsage - previousCpuUsage;
            const systemDelta = systemUsage - previousSystemUsage;
        
            const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;
            
            return cpuPercent;
        } catch (error) {
            Logger.error('Error fetching CPU usage: ' + error);
            throw new Error('Unable to retrieve CPU usage');
        }
      }

    async getRAMUsage(): Promise<number> {
        try {

            const container = this.docker.getContainer(this.containerId);
            const stats = await container.stats({ stream: false });
        
            const memoryUsage = stats.memory_stats.usage;
            const memoryLimit = stats.memory_stats.limit;
        
            const usedMemoryMB = memoryUsage / (1024 * 1024);  // Convert bytes to MB
            const totalMemoryMB = memoryLimit / (1024 * 1024); // Convert bytes to MB
            
            const memoryPercentage = (usedMemoryMB / totalMemoryMB) * 100;
        
            return memoryPercentage; 
        } catch (error) {
          Logger.error('Error fetching RAM usage: ' + error);
          throw new Error('Unable to retrieve RAM usage');
        }
      }


}