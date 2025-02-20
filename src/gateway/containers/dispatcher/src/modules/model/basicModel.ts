import { ModelStrategy } from "./Model";
import { OptimizationResult } from "./optimizationResult";


export class BasicModel implements ModelStrategy{

    // check the interface for the documentation
    optimize(R: number, B: number, RAM: number, CPU: number, MP: number): OptimizationResult {

        const cpuPerMessage = 0.0001;
      
        RAM *= 1024 * 1024;

        const S = Math.floor(B / R);  
    
        const maxMessagesByMemory = Math.floor(RAM / (S * MP));
      
        const maxMessagesByCPU = Math.floor(CPU / cpuPerMessage);
      
        const M = Math.min(maxMessagesByMemory, maxMessagesByCPU);
      
        return {
          M: M,
          S: S
        };
    }

}

  
  // Example usage:
  const R: number = 138;  // Request per second (mean)
  const B: number = 18000;  // Bytes per second (mean)
  const RAM: number = 1347;  // Available RAM (in MB)
  const CPU: number = 4;  // Available CPU units
  const MP: number = 34 // memory per request (in bytes)
  
  const result = new BasicModel().optimize(R, B, RAM, CPU, MP);
  
  console.log(`Optimal Number of Messages per Second: ${result.M}`);
  console.log(`Optimal Message Size (in bytes): ${result.S}`);
  