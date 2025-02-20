import { Observer } from "../observers/observer";
import { Logger } from "../utils/logger";
import * as osu from "node-os-utils";

export class SystemUsageTracker {
    private intervalId: NodeJS.Timeout | null = null;
    private readonly interval: number;
    private readonly observers: Observer[] = [];

    constructor(interval: number = 1000) {
        this.interval = interval;
    }

    public addObserver(observer: Observer): void {
        this.observers.push(observer);
    }

    public removeObserver(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index >= 0) {
            this.observers.splice(index, 1);
        }
    }

    private notifyObservers(cpuUsage: number, ramUsage: number): void {
        for (const observer of this.observers) {
            observer.update(cpuUsage, ramUsage);
        }
    }

    public startTracking(): void {
        if (this.intervalId) {
            Logger.info('tracking is already started.');
            return;
        }

        this.intervalId = setInterval(async () => {
            const cpuUsage = await this.getCpuUsage();
            const ramUsage = await this.getRamUsage();
            this.notifyObservers(cpuUsage, ramUsage);
        }, this.interval);
    }

    public stopTracking(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            Logger.info('tracking stopped.');
        } else {
            Logger.warn('no tracking is running.');
        }
    }



    async getCpuUsage(): Promise<number> {
        return await osu.cpu.usage()
    }


    async getRamUsage(): Promise<number> {
        let info : osu.MemInfo= await osu.mem.info()
        return (info.totalMemMb - info.freeMemMb) / 10; // discepancy for inner MB and MiB converting 
    }
}