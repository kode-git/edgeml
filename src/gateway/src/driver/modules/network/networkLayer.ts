import * as fs from 'fs';
import axios, { AxiosResponse } from 'axios';
import { Logger } from '../utils/logger';

interface SetupConfig {
    hostname : string
    path : string
    port : number
}
const setup : SetupConfig = JSON.parse(fs.readFileSync('network.json', 'utf-8'));

const url : string = 'http://' + setup.hostname + ':' + setup.port + '/' + setup.path

export class NetworkLayer {
    static async send(data: string): Promise<void> {
        const payload = {
            message: data
            };
        
        // Logger.info('sending request to ' + url)

        axios.post(url, payload ).then(response => {
        }).catch(err => { Logger.error(err) });

    }
}