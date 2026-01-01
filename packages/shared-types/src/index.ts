import { IDevice } from '@unity-link/db';

export interface ServerToClientEvents extends IDeviceSettings {
    registerDevice: (data: IDevice) => void;
    deviceRegistered: ({ devices }: { devices: any }) => void;
    sup: () => void;
}
export interface ClientToServerEvents {
    hello: () => void;
    registerDevice: (data: IDevice) => void;
}

export interface IDeviceSettings {
    shutdownDevice: (id: string) => void;
    restartDevice: (id: string) => void;
    disconnectDevice: (id: string) => void;
    formatDevice: (id: string) => void;
}
