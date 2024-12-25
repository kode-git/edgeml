export interface Observer {
    update(cpuUsage: number, ramUsage: number): void;
}