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
}
export interface CreateConnection {
    type: MessageTypes.CREATE_CONNECTION;
    agent_id: string;
    content: string;
}

export type MessageType = CreateConnection;
