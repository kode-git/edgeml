import { DataGenerationStrategy } from "./dataGenerationStrategy";

export class InverterDataGenerationStrategy implements DataGenerationStrategy {
    generateData(deviceId: string, frequency: number): string {
      const voltage = (Math.random() * 10) + 220; // Voltage: 220-230V with active flow
      const current = (Math.random() * 10) + 5;   // Current: 5-15A with permanent active lifecycle
      const power = voltage * current;            // Power in Watts
      const energy = power * frequency / 3600;    // Energy in Wh (using frequency for time simulation)
  
      const data = {
        deviceId,
        type: 'inverter',
        voltage: voltage.toFixed(2),
        current: current.toFixed(2),
        power: power.toFixed(2),
        energy: energy.toFixed(2),
      };
      return JSON.stringify(data);
    }
  }