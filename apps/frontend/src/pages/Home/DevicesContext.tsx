import type { IDevice, IFrontendDevice } from '@unity-link/db';
import { Socket } from 'socket.io-client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { useGetDevices } from '@/lib/hooks';

interface DevicesContextType {
    devices: IFrontendDevice[];
    loading: boolean;
    error: Error | null;
    selectedDevice: IDevice | null;
    socket: Socket | null;
    setSelectedDevice: (device: IDevice | null) => void;
}

const DevicesContext = createContext<DevicesContextType | undefined>(undefined);

export function DevicesProvider({ children }: { children: ReactNode }) {
    const [selectedDevice, setSelectedDevice] = useState<IDevice | null>(null);
    const [socket] = useState<Socket | null>(null);
    const { data: devices, isLoading: loading, error } = useGetDevices();

    return (
        <DevicesContext.Provider
            value={{
                devices: devices ?? [],
                loading,
                error,
                socket,
                selectedDevice,
                setSelectedDevice,
            }}
        >
            {children}
        </DevicesContext.Provider>
    );
}

export const useDevicesContext = () => {
    const context = useContext(DevicesContext);
    if (!context) {
        throw new Error(
            'useDevicesContext must be used within DevicesProvider'
        );
    }
    return context;
};
