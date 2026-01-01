import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@unity-link/db';
import bytes from 'bytes';
import { WebSocketServer } from 'ws';

declare global {
    interface BigInt {
        toJSON(): string;
    }
}

BigInt.prototype.toJSON = function () {
    return this.toString();
};

const app = express();

app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

app.get('/health', (_req, res) => res.status(200).send('OK'));

app.get('/devices', async (_req, res) => {
    const devices = await prisma.device.findMany();
    const updatedDevices = devices.map((info) => {
        let updatedInfo = {
            ...info,
            diskUsage: bytes(Number(info.diskUsage) ?? 0),
            diskTotal: bytes(Number(info.diskTotal) ?? 0),
            memoryTotal: bytes(Number(info.memoryTotal) ?? 0),
            memoryUsage: bytes(Number(info.memoryUsage) ?? 0),
        };
        return updatedInfo;
    });
    res.send(updatedDevices);
});

app.get('/devices/:id', async (req, res) => {
    const device = await prisma.device.findFirst({
        where: { id: req.params.id },
    });
    if (!device) {
        return res.status(404).send({ error: 'Device not found' });
    }
    let updatedDevice = {
        ...device,
        diskUsage: bytes(Number(device.diskUsage) ?? 0),
        diskTotal: bytes(Number(device.diskTotal) ?? 0),
        memoryTotal: bytes(Number(device.memoryTotal) ?? 0),
        memoryUsage: bytes(Number(device.memoryUsage) ?? 0),
    };
    res.send(updatedDevice);
});

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (msg) => {
        try {
            const message = JSON.parse(msg.toString());
            console.log('Received event:', message.event);

            // Handle different event types
            switch (message.event) {
                case 'register':
                    console.log('Device registration:', message.data);
                    // TODO: Save device info to database
                    ws.send(
                        JSON.stringify({
                            event: 'register_response',
                            data: {
                                status: 'success',
                                message: 'Device registered',
                            },
                        })
                    );
                    break;

                case 'heartbeat':
                    console.log('Heartbeat received');
                    break;

                default:
                    console.log('Unknown event:', message.event, message.data);
            }
        } catch (err) {
            console.log('Received non-JSON message:', msg.toString());
        }
    });

    ws.send(
        JSON.stringify({
            event: 'welcome',
            data: { message: 'Connected to server' },
        })
    );
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Backend running on :${PORT}`));
