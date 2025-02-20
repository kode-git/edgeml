import { DataGenerationStrategy } from "../data/dataGenerationStrategy";
import { Device } from "../devices/device";
import { Inverter } from "../devices/inverter";
import { Meter } from "../devices/meter";

export class DeviceFactory {
    static createDevice(deviceType: 'inverter' | 'meter', id: string, strategy: DataGenerationStrategy): Device {
      if (deviceType === 'inverter') {
        return new Inverter(id, strategy);
      } else if (deviceType === 'meter') {
        return new Meter(id, strategy);
      } else {
        throw new Error('Invalid device type');
      }
    }
  }