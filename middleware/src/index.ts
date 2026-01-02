import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../prisma/generated/client';
import WebSocket, { WebSocketServer } from 'ws';
import { MessageType, MessageTypes, AgentStatus } from './types';

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// 🔄 Map deviceId to active WebSocket connections
const agentConnections = new Map<string, WebSocket>();
// 🔄 Map deviceId to requesting browser sockets (for response routing)
const browserRequests = new Map<string, WebSocket>();

// const PORT = 3000;
// const wss = new WebSocketServer({ port: PORT });

// console.log(`🧩 Node middleware running on ws://localhost:${PORT}`);

// // 🔄 active connections: WebSocket -> deviceId
// const connectionDeviceMap = new Map<WebSocket, AgentID>();

// function sendTo(socket: WebSocket, msg: Message) {
//   socket.send(JSON.stringify(msg));
// }

// // Broadcast to all browsers except the sender
// function broadcast(socket: WebSocket, msg: Message) {
//   const json = JSON.stringify(msg);
//   wss.clients.forEach((client) => {
//     if (client !== socket && client.readyState === WebSocket.OPEN) {
//       client.send(json);
//     }
//   });
// }
// async function broadcastAgents() {
//   const allAgents = await prisma.agent.findMany();

//   const msg = JSON.stringify({
//     type: 'agents',
//     content: allAgents,
//   });

//   wss.clients.forEach((c) => {
//     const deviceId = connectionDeviceMap.get(c);
//     // Only send agents list to browser clients (no deviceId = browser)
//     if (!deviceId && c.readyState === WebSocket.OPEN) {
//       c.send(msg);
//     }
//   });
// }

// async function registerAgent(socket: WebSocket, id: AgentID) {
//   connectionDeviceMap.set(socket, id);

//   await prisma.agent.upsert({
//     where: { deviceId: id },
//     update: { status: 3, lastSeen: new Date() },
//     create: { deviceId: id, status: 3 },
//   });

//   console.log('🧠 Agent registered:', id);

//   await broadcastAgents();
// }

// async function relayCommandToAgent(msg: CommandMessage) {
//   const agent = await prisma.agent.findUnique({
//     where: { deviceId: msg.agentId },
//   });

//   if (!agent || agent.status !== 3) {
//     console.log('❌ Agent offline or unknown:', msg.agentId);
//     return;
//   }

//   // find active socket for this device
//   const targetSocket = [...connectionDeviceMap.entries()].find(
//     ([_, id]) => id === msg.agentId,
//   )?.[0];

//   if (!targetSocket) {
//     console.log('❌ Unable to get active socket for:', msg.agentId);
//     return;
//   }

//   const isCD = msg.command.startsWith('cd ');

//   const controlMsg: AgentControlMessage = {
//     type: isCD ? 'cd' : 'exec',
//     agentId: msg.agentId, // 👈 required!
//     content: isCD ? msg.command.slice(3) : msg.command,
//   };

//   sendTo(targetSocket, controlMsg);
// }

// async function handleDisconnect(socket: WebSocket) {
//   const deviceId = connectionDeviceMap.get(socket);
//   if (!deviceId) return;

//   connectionDeviceMap.delete(socket);

//   console.log('⚠️ Agent disconnected:', deviceId);

//   await prisma.agent.updateMany({
//     where: { deviceId },
//     data: { status: 0, lastSeen: new Date() },
//   });

//   await broadcastAgents();
// }

// wss.on('connection', async (socket) => {
//   console.log('🔌 Client connected');
//   await broadcastAgents();

// socket.on('message', async (data) => {
//   let msg: Message;

//   try {
//     msg = JSON.parse(data.toString());
//   } catch {
//     console.warn('⚠️ Invalid JSON');
//     return;
//   }
//   console.log('msg', msg);

//   switch (msg.type) {
//     case 'id':
//       const id = (msg as IDMessage).content;
//       await registerAgent(socket, id);
//       sendTo(socket, { type: 'id', agentId: id }); // 👈 confirm target
//       break;

//     case 'command':
//       await relayCommandToAgent(msg as CommandMessage);
//       break;
//     case 'output':
//       broadcast(socket, msg as OutputMessage);
//       break;
//     case 'error':
//       console.warn('Agent error:', msg.content);
//       break;

//     default:
//       console.warn('❓ Unknown message type:', msg.type);
//   }
// });

// socket.on('close', () => handleDisconnect(socket));
// });

//   socket.send(
//     JSON.stringify({
//       type: 'greeting',
//       content: 'Hello from server!',
//     }),
//   );
// socket.send(
//     JSON.stringify({
//         type: 'EXECUTE_COMMAND',
//         content: 'pwd',
//     }),
// );

function isJSON(str: string) {
    if (typeof str !== 'string') return false;
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

// 🤖 AGENT SERVER (port 3001) - agents connect here
const AGENT_PORT = 3000;
const agentServer = new WebSocketServer({ port: AGENT_PORT });

console.log(`🤖 Agent server running on ws://localhost:${AGENT_PORT}`);

agentServer.on('connection', async (socket) => {
    let connectedDeviceId: string | null = null;

    socket.on('message', async (data) => {
        if (!isJSON(data.toString())) {
            console.log('⚠️ Invalid JSON from agent');
            return;
        }
        const message = JSON.parse(data.toString()) as MessageType;
        console.log('[AGENT]', message);

        switch (message.type) {
            case MessageTypes.CREATE_CONNECTION:
                // Register this agent socket
                agentConnections.set(message.deviceId, socket);
                connectedDeviceId = message.deviceId;

                await prisma.agent.upsert({
                    where: { deviceId: message.deviceId },
                    update: {
                        status: AgentStatus.ONLINE,
                        lastSeen: new Date(),
                    },
                    create: {
                        deviceId: message.deviceId,
                    },
                });

                console.log('✅ Agent registered:', message.deviceId);
                break;

            case MessageTypes.GET_COMMAND_OUTPUT:
                console.log(
                    '📥 Received output from agent:',
                    message.deviceId,
                    message.content,
                );
                // Route output to the specific browser that requested it
                const requesterSocket = browserRequests.get(message.deviceId);
                if (
                    requesterSocket &&
                    requesterSocket.readyState === WebSocket.OPEN
                ) {
                    requesterSocket.send(
                        JSON.stringify({
                            type: 'COMMAND_OUTPUT',
                            deviceId: message.deviceId,
                            content: message.content,
                        }),
                    );
                    console.log(
                        '✅ Output routed to browser for device:',
                        message.deviceId,
                    );
                } else {
                    console.log(
                        '⚠️ No browser waiting for output from device:',
                        message.deviceId,
                    );
                }
                break;
            case MessageTypes.STOP_SCREENSHOTS:
                console.log(
                    '📥 Received stop screenshots from agent:',
                    message.deviceId,
                );
                break;
            case MessageTypes.GET_SCREENSHOTS:
                console.log(
                    '📥 Received screenshots from agent:',
                    message.deviceId,
                );
            default:
                console.log(
                    'Unknown message type from agent:',
                    (message as any).type,
                );
                break;
        }
    });

    socket.on('close', async () => {
        if (connectedDeviceId) {
            console.log('⚠️ Agent disconnected:', connectedDeviceId);
            agentConnections.delete(connectedDeviceId);

            await prisma.agent.updateMany({
                where: { deviceId: connectedDeviceId },
                data: { status: AgentStatus.OFFLINE, lastSeen: new Date() },
            });
        }
    });

    console.log('🔌 Agent connected');
});

// 🌐 BROWSER SERVER (port 3000) - browsers/UI connect here
const BROWSER_PORT = 3001;
const browserServer = new WebSocketServer({ port: BROWSER_PORT });

console.log(`🌐 Browser server running on ws://localhost:${BROWSER_PORT}`);

browserServer.on('connection', async (socket) => {
    socket.on('message', async (data) => {
        if (!isJSON(data.toString())) {
            console.log('⚠️ Invalid JSON from browser');
            return;
        }
        const message = JSON.parse(data.toString()) as MessageType;
        console.log('[BROWSER]', message);

        switch (message.type) {
            case MessageTypes.EXECUTE_COMMAND: {
                console.log(
                    '📤 Browser requesting command for agent:',
                    message.deviceId,
                );

                // Find the agent's socket
                const agentSocket = agentConnections.get(message.deviceId);

                if (!agentSocket || agentSocket.readyState !== WebSocket.OPEN) {
                    console.log('❌ Agent not connected:', message.deviceId);
                    socket.send(
                        JSON.stringify({
                            type: 'ERROR',
                            content: `Agent ${message.deviceId} is not connected`,
                        }),
                    );
                    break;
                }

                // Track which browser requested this command (for routing response)
                browserRequests.set(message.deviceId, socket);

                // Send command to the agent
                agentSocket.send(
                    JSON.stringify({
                        type: 'EXECUTE_COMMAND',
                        deviceId: message.deviceId,
                        content: message.content,
                    }),
                );
                console.log('✅ Command sent to agent');

                break;
            }
            case MessageTypes.SEND_SCREENSHOTS: {
                // Find the agent's socket
                const agentSocket = agentConnections.get(message.deviceId);

                if (!agentSocket || agentSocket.readyState !== WebSocket.OPEN) {
                    console.log('❌ Agent not connected:', message.deviceId);
                    socket.send(
                        JSON.stringify({
                            type: 'ERROR',
                            content: `Agent ${message.deviceId} is not connected`,
                        }),
                    );
                    break;
                }

                // Track which browser requested this command (for routing response)
                browserRequests.set(message.deviceId, socket);

                // Send command to the agent
                agentSocket.send(
                    JSON.stringify({
                        type: 'SEND_SCREENSHOTS',
                        deviceId: message.deviceId,
                        content: '',
                    }),
                );
                console.log('✅ Command sent to agent');
                break;
            }
            default:
                console.log(
                    'Unknown message type from browser:',
                    (message as any).type,
                );
                break;
        }
    });

    socket.on('close', () => {
        // Clean up any pending requests from this browser
        for (const [deviceId, browserSocket] of browserRequests.entries()) {
            if (browserSocket === socket) {
                browserRequests.delete(deviceId);
                console.log(
                    '🔌 Browser disconnected, cleaned up request for device:',
                    deviceId,
                );
            }
        }
    });

    console.log('🔌 Browser connected');
});
