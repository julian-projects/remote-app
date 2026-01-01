import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../prisma/generated/client';
import WebSocket, { WebSocketServer } from 'ws';
import {
    AgentID,
    AgentControlMessage,
    CommandMessage,
    IDMessage,
    Message,
    OutputMessage,
    MessageType,
    MessageTypes,
} from './types';

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

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

const PORT = 3000;
const wss = new WebSocketServer({ port: PORT });

console.log(`🧩 Node middleware running on ws://localhost:${PORT}`);

wss.on('connection', async (socket) => {
    socket.on('message', (data) => {
        const message = JSON.parse(data.toString()) as MessageType;

        switch (message.type) {
            case MessageTypes.CREATE_CONNECTION:
                console.log('Received CREATE_CONNECTION message:', message);

                break;

            default:
                console.log('Unknown message type:', message.type);
                break;
        }
    });

    console.log('🔌 Client connected');
});
