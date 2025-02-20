import { Device } from "./device";

export class Meter extends Device {
  
    generateData(frequency: number): string {
      return this.strategy.generateData(this.id, frequency);
    }
  }