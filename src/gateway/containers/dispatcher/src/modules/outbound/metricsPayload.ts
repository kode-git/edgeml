
export interface MetricPayload {
  topic: string,
  headers: {},
  path: string,
  value: {
    currentRAM: number,
    currentCPU: number,
    throughput: number
  }
}

