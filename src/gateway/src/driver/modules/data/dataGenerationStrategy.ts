export interface DataGenerationStrategy {
    generateData(deviceId: string, frequency: number): string;
  }
