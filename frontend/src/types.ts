export type DeviceID = string;

export interface WSMessage {
    type: string;
    content?: string;
    agentId?: string;
}
