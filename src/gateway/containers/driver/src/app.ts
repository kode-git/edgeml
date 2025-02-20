/**
 * This simulator driver is made for the Innovation Project of Sense Reply 2024. The aim of the simulator is to configure 
 * a specific number of inverters and meters with a dynamic frequency and, though a data factory, generate a different 
 * size of data to send at a certain endpoint. The communication protocol used is 
 * HTTP for service-to-service communication.
 * @author Mario Sessa
 * @access private
 * @copyright 2024 
 * @license ISC
 */

import { MeterDataGenerationStrategy } from "./modules/data/ meterDataGenerationStrategy";
import { InverterDataGenerationStrategy } from "./modules/data/inverterDataGenerationStrategy";
import { Device } from "./modules/devices/device";
import { DeviceFactory } from "./modules/factory/deviceFactory";
import { DeviceFrequencyManager } from "./modules/observer/deviceFrequencyManager";
import * as fs from 'fs';


const setup = JSON.parse(fs.readFileSync('setup.json', 'utf-8'));
const numberOfInverters = setup.inverters;
const numberOfMeters = setup.meters;


const inverterStrategy = new InverterDataGenerationStrategy();
const meterStrategy = new MeterDataGenerationStrategy();

const devices: Device[] = [];

for (let i = 1; i <= numberOfInverters; i++) {
  devices.push(DeviceFactory.createDevice('inverter', `PV${i}_${(new Date()).getTime()}`, inverterStrategy));
}

for (let i = 1; i <= numberOfMeters; i++) {
  devices.push(DeviceFactory.createDevice('meter', `PM${i}_${(new Date()).getTime()}`, meterStrategy));
}

const frequencyManager = new DeviceFrequencyManager();
devices.forEach(device => frequencyManager.addDevice(device));

const getRandomFrequency = (): number => {
  const min = 5; // 5 seconds
  const max = 10; // 10 seconds
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


const changeFrequency = () : void => {
  const randomFrequency = getRandomFrequency(); 
  frequencyManager.update(randomFrequency);  
}

const startSendingData = () => {
  setInterval(() => {
    changeFrequency();    
  }, 60 * 1000); 
};

// initialize frequency without interval
changeFrequency();

// Start the data sending
startSendingData();