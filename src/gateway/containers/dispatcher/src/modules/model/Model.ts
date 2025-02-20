import { OptimizationResult } from "./optimizationResult";

export interface ModelStrategy {
    /**
     * This interface is the core optimization function to define the optimal value with different objectives (optimal problem template must be used)
     * @param R is the Request rate of for input burst operations
     * @param B is the byte rate of the input burst operation
     * @param RAM is the current ram usage
     * @param CPU is the current cpu usage
     * @param MP is the memory per request (mean) according to the received payload in string form (the processing format)
     * @returns OptimizationResult object with optimal values for message size and rate (throughput to assume) 
    */
    optimize(R: number, B: number, RAM: number, CPU: number, MP: number) : OptimizationResult
}