import { useMutation, useQuery } from '@tanstack/react-query';

export const getDevices = async () => {
    const response = await fetch('http://localhost:8080/api/devices');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

export const useGetDevices = () => {
    return useQuery<any[]>({
        queryKey: ['devices'],
        queryFn: getDevices,
    });
};

export const getDevice = async (id: string) => {
    const response = await fetch(`http://localhost:8080/api/devices/${id}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};
export const useGetDevice = (id: string) => {
    return useQuery<any>({
        queryKey: ['device', id],
        queryFn: () => getDevice(id),
    });
};

export const postShutdown = async (id: string) => {
    const response = await fetch(
        `http://localhost:8080/api/settings/shutdown/${id}`,
        { method: 'POST' }
    );
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};
export const usePostShutdown = (id: string) => {
    return useMutation<void>({
        mutationFn: () => postShutdown(id),
    });
};

export const postRestart = async (id: string) => {
    const response = await fetch(
        `http://localhost:8080/api/settings/restart/${id}`,
        { method: 'POST' }
    );
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};
export const usePostRestart = (id: string) => {
    return useMutation<void>({
        mutationFn: () => postRestart(id),
    });
};

export const postDisconnect = async (id: string) => {
    const response = await fetch(
        `http://localhost:8080/api/settings/disconnect/${id}`,
        { method: 'POST' }
    );
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};
export const usePostDisconnect = (id: string) => {
    return useMutation<void>({
        mutationFn: () => postDisconnect(id),
    });
};

export const postFormat = async (id: string) => {
    const response = await fetch(
        `http://localhost:8080/api/settings/format/${id}`,
        { method: 'POST' }
    );
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};
export const usePostFormat = (id: string) => {
    return useMutation<void>({
        mutationFn: () => postFormat(id),
    });
};
