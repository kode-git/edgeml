import { Device } from "./device";

export class Inverter extends Device {
  
    generateData(frequency: number): string {
      return this.strategy.generateData(this.id, frequency);
    }
  }