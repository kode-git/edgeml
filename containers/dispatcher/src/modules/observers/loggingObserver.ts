import { Logger } from "../utils/logger";
import { Observer } from "./observer";

export class LoggingObserver implements Observer {
    update(cpuUsage: number, ramUsage: number): void {
        Logger.info(`Logged - CPU Usage: ${cpuUsage}% | RAM Usage: ${ramUsage.toFixed(2)} MB`);
    }
}