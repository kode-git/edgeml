export interface CommandPayload {
    header: any,
    path: string,
    revision: number,
    timestamp: string,
    topic: string,
    value: {
        maxCPU: number,
        modeML: string,
        maxRAM: number
    }
}

