import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../prisma/generated/client';
import WebSocket, { WebSocketServer } from 'ws';
import { MessageType, MessageTypes, AgentStatus } from './types';
import express from 'express';
import cors from 'cors';

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// 🔄 Map deviceId to active WebSocket connections
const agentConnections = new Map<string, WebSocket>();
// 🔄 Map deviceId to requesting browser sockets (for response routing)
const browserRequests = new Map<string, WebSocket>();

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
                        status: AgentStatus.ONLINE,

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

// 🌐 HTTP SERVER (port 8080) - REST API for browser
const HTTP_PORT = 8080;
const app = express();

app.use(cors());
app.use(express.json());

// GET /api/devices - Get list of all agents with their status
app.get('/api/devices', async (req, res) => {
    try {
        const agents = await prisma.agent.findMany({
            select: {
                deviceId: true,
                status: true,
                lastSeen: true,
            },
        });

        res.json(agents);
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});

// GET /api/devices/:deviceId - Get a specific agent's details
app.get('/api/devices/:deviceId', async (req, res) => {
    try {
        const agent = await prisma.agent.findUnique({
            where: { deviceId: req.params.deviceId },
            select: {
                deviceId: true,
                status: true,
                lastSeen: true,
            },
        });

        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json(agent);
    } catch (error) {
        console.error('Error fetching device:', error);
        res.status(500).json({ error: 'Failed to fetch device' });
    }
});

app.listen(HTTP_PORT, () => {
    console.log(`🌐 HTTP API running on http://localhost:${HTTP_PORT}`);
});
