export type AgentID = string;

export interface BaseMessage {
    type: string;
}

export interface IDMessage extends BaseMessage {
    type: 'id';
    content: AgentID;
}

export interface CommandMessage extends BaseMessage {
    type: 'command';
    agentId: AgentID;
    command: string;
}

export interface OutputMessage extends BaseMessage {
    type: 'output';
    content: string;
}

export interface AgentControlMessage extends BaseMessage {
    type: 'cd' | 'exec';
    agentId?: AgentID; // 👈 new

    content: string;
}

export interface ErrorMessage extends BaseMessage {
    type: 'error';
    content: string;
}

export interface AgentsMessage extends BaseMessage {
    type: 'agents';
    content: any;
}
export type Message =
    | IDMessage
    | CommandMessage
    | OutputMessage
    | AgentControlMessage
    | AgentsMessage
    | ErrorMessage;

export enum MessageTypes {
    CREATE_CONNECTION = 'CREATE_CONNECTION',
    EXECUTE_COMMAND = 'EXECUTE_COMMAND',
    GET_COMMAND_OUTPUT = 'GET_COMMAND_OUTPUT',
}
export interface CreateConnection {
    type: MessageTypes.CREATE_CONNECTION;
    deviceId: string;
    content: string;
}
export interface ExecuteCommand {
    type: MessageTypes.EXECUTE_COMMAND;
    deviceId: string;
    content: string;
}

export interface GetCommandOutput {
    type: MessageTypes.GET_COMMAND_OUTPUT;
    deviceId: string;
    content: string;
}

export type MessageType = CreateConnection | ExecuteCommand | GetCommandOutput;

export enum AgentStatus {
    OFFLINE = 0,
    SLEEP = 1,
    SHUTDOWN = 2,
    ONLINE = 3,
}
