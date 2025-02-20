import { Device } from "../devices/device";
import { NetworkLayer } from "../network/networkLayer";
import { Logger } from "../utils/logger";
import { FrequencyObserver } from "./frequencyObserver";

export class DeviceFrequencyManager implements FrequencyObserver {
    private frequency: number = 0;
    private readonly devices: Device[] = [];
    private interval: NodeJS.Timeout | undefined;
  
    addDevice(device: Device): void {
      this.devices.push(device);
    }

    update(frequency: number): void {
      this.frequency = frequency;
      Logger.info(`frequency updated to: ${frequency} seconds`);
      if(this.interval) clearInterval(this.interval);
      this.interval = setInterval(() => this.sendDataToDevices(), frequency * 1000);
    }
  
    private sendDataToDevices(): void {
      this.devices.forEach((device) => {
        const data = device.generateData(this.frequency);
        NetworkLayer.send(JSON.stringify(data))
      });
    }
  }