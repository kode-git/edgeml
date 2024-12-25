// PerformanceTracker.ts
export class PerformanceTracker {
    private requestInbound: number = 0;
    private requestBytes: number = 0;
    private totalSampling: number = 0;
    private totalRequest: number = 0;
    public BytePerRequest: number = 0;
    public requestPerSec: number = 0;
    public BytesPerSec: number = 0;
    private simpleLock: boolean = false;
    private performanceTracking: NodeJS.Timeout | undefined;
  
    constructor(private readonly interval: number = 1000) {}
  
    startTracking(callback: (requestPerSec: number, BytesPerSec: number) => void): void {
      if (this.performanceTracking) clearInterval(this.performanceTracking);
      this.performanceTracking = setInterval(() => {
        this.simpleLock = true;
        this.requestPerSec = (this.requestInbound + (this.requestPerSec * this.totalSampling)) / (this.totalSampling + 1);
        this.BytesPerSec = (this.requestBytes + (this.BytesPerSec * this.totalSampling)) / (this.totalSampling + 1);
        this.totalSampling += 1;
        callback(this.requestPerSec, this.BytesPerSec); // Notify the rate limiter
        this.resetCounters();
        this.simpleLock = false;
      }, this.interval);
    }
  
    private resetCounters(): void {
      this.requestInbound = 0;
      this.requestBytes = 0;
    }
  
    updateRequestInbound(data: string): void {
      const messageByte = Buffer.byteLength(data, 'utf-8');
      this.requestInbound += 1;
      this.totalRequest += 1;
      this.requestBytes += messageByte;
      this.BytePerRequest = ((this.BytePerRequest * this.totalRequest) + messageByte) / (this.totalRequest + 1);
    }
  
    isLocked(): boolean {
      return this.simpleLock;
    }
  }
  