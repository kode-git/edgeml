import { DataGenerationStrategy } from "./dataGenerationStrategy";

export class MeterDataGenerationStrategy implements DataGenerationStrategy {
    generateData(deviceId: string, frequency: number): string {
      const voltage = (Math.random() * 10) + 220;  // Voltage: 220-230V
      const current = (Math.random() * 50) + 10;   // Current: 10-60A
      const powerConsumption = voltage * current;  // Power Consumption in W
      const energyConsumption = powerConsumption * frequency / 3600; // Energy in kWh
      const powerFactor = Math.random() * 0.3 + 0.7; // Power factor between 0.7 and 1.0
  
      const data = {
        deviceId,
        type: 'meter',
        voltage: voltage.toFixed(2),
        current: current.toFixed(2),
        powerConsumption: powerConsumption.toFixed(2),
        energyConsumption: energyConsumption.toFixed(2),
        powerFactor: powerFactor.toFixed(2),
      };
      return JSON.stringify(data);
    }
  }