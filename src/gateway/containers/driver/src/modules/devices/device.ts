import { DataGenerationStrategy } from "../data/dataGenerationStrategy";

export abstract class Device {
    constructor(protected id: string, protected strategy: DataGenerationStrategy) {}
  
    // Generate data using the strategy
    abstract generateData(frequency: number): string;
  }