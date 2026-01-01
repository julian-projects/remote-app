import { faker } from '@faker-js/faker';

// Enums mirrored from prisma schema for clarity
type DiskType = 'ssd' | 'hdd' | 'nvme';
type BatteryStatus = 'charging' | 'discharging' | 'full';
type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor';
type AgentStatus = 'running' | 'stopped' | 'error';
type DeviceStatus = 'offline' | 'online' | 'lost_connection';

// Helper random pick
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate a realistic uptime (ms) between 1 hour and 7 days
const randomUptime = () =>
    BigInt(faker.number.int({ min: 3_600_000, max: 7 * 24 * 3_600_000 }));

// Convert bytes helpers
const gb = (n: number) => BigInt(n * 1024 * 1024 * 1024);
const mb = (n: number) => BigInt(n * 1024 * 1024);

export interface FakeDeviceInput {
    id?: string; // allow overriding id
    naturalId?: string; // allow overriding naturalId
    status?: DeviceStatus;
}

export const createFakeDevice = (
    overrides: FakeDeviceInput = {}
): Record<string, any> => {
    const id = overrides.id ?? faker.string.uuid();
    const hostname =
        faker.internet
            .username()
            .replace(/[^a-zA-Z0-9_-]/g, '')
            .toLowerCase() + '-host';
    const username = faker.internet.username();
    const naturalId = overrides.naturalId ?? `${username}@${hostname}`;

    const boot = faker.date.recent({ days: 7 });
    const lastSeen = new Date();
    const uptimeMs = Number(lastSeen.getTime() - boot.getTime());

    const totalMemGB = faker.number.int({ min: 8, max: 64 });
    const usedMemGB = faker.number.int({ min: 2, max: totalMemGB - 1 });
    const totalDiskGB = faker.number.int({ min: 128, max: 2000 });
    const usedDiskGB = faker.number.int({ min: 10, max: totalDiskGB - 5 });

    const device = {
        id,
        naturalId,
        serialNumber: faker.string.alphanumeric(12).toUpperCase(),
        macAddress: faker.internet.mac(),

        // System Information
        platform: pick(['Linux', 'Windows', 'macOS']),
        osVersion: pick([
            'Ubuntu 22.04.3 LTS',
            'Windows 11 23H2',
            'macOS 15.0 Sequoia',
        ]),
        osBuild: faker.string.alphanumeric(10),
        architecture: pick(['x86_64', 'arm64']),
        model: pick([
            'ThinkPad X1 Carbon',
            'MacBook Pro 16"',
            'Dell XPS 13',
            'Framework 13',
        ]),
        manufacturer: pick(['Lenovo', 'Apple', 'Dell', 'Framework']),
        deviceType: pick(['Laptop', 'Desktop', 'Server']),
        biosVersion: `v${faker.number.int({
            min: 1,
            max: 3,
        })}.${faker.number.int({ min: 0, max: 99 })}`,
        kernelVersion: pick([
            '6.8.0-31-generic',
            '5.15.0-89-generic',
            'Darwin 24.0.0',
        ]),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: pick(['en_US.UTF-8', 'en_GB.UTF-8', 'de_DE.UTF-8']),

        // Hardware Specifications (static)
        cpuModel: pick([
            'Intel Core i7-1365U',
            'AMD Ryzen 7 7840U',
            'Apple M3 Pro',
        ]),
        cpuCores: pick([4, 6, 8, 10, 12]),
        cpuThreads: pick([8, 12, 16, 20]),
        cpuFrequency: faker.number.int({ min: 2200, max: 5400 }),
        memoryTotal: gb(totalMemGB),
        diskTotal: gb(totalDiskGB),
        diskType: pick(['nvme', 'ssd', 'hdd']) as DiskType,
        gpuModel: pick([
            'Intel Iris Xe',
            'NVIDIA RTX 4070',
            'AMD Radeon 780M',
            'Apple M3',
        ]),
        gpuMemory: mb(pick([2048, 4096, 8192, 12288])),
        screenResolution: pick(['1920x1080', '2560x1600', '3840x2160']),
        hasCamera: faker.datatype.boolean(),
        hasMicrophone: true,
        hasBluetooth: faker.datatype.boolean(),
        hasWifi: true,

        // User Information
        username,
        user: username,
        userFullName: faker.person.fullName(),
        userEmail: faker.internet.email(),
        isAdmin: faker.datatype.boolean(),
        loggedInUsers: faker.number.int({ min: 1, max: 3 }),

        // Agent Information
        agentVersion: `${faker.number.int({
            min: 1,
            max: 3,
        })}.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({
            min: 0,
            max: 9,
        })}`,
        agentAutoStart: faker.datatype.boolean(),
        agentStatus: pick(['running', 'stopped', 'error']) as AgentStatus,

        // Security & Compliance
        antivirusInstalled: faker.datatype.boolean(),
        antivirusName: pick(['ClamAV', 'Windows Defender', 'Falcon', 'None']),
        antivirusUpToDate: faker.datatype.boolean(),
        diskEncrypted: faker.datatype.boolean(),
        screenLockEnabled: faker.datatype.boolean(),
        firewallEnabled: faker.datatype.boolean(),
        lastSecurityUpdate: faker.date.recent({ days: 14 }),

        // Network Information (real-time)
        hostname,
        publicIp: faker.internet.ipv4(),
        localIp: `192.168.1.${faker.number.int({ min: 2, max: 250 })}`,
        networkSpeed: faker.number.float({
            min: 100,
            max: 1200,
            fractionDigits: 1,
        }),
        wifiSsid: pick(['Office-5G', 'CorpNet', 'Guest-WiFi']),
        wifiSignalStrength: faker.number.float({
            min: 40,
            max: 100,
            fractionDigits: 1,
        }),
        ethernetConnected: faker.datatype.boolean(),
        networkBytesIn: BigInt(
            faker.number.int({ min: 10_000_000, max: 9_000_000_000 })
        ),
        networkBytesOut: BigInt(
            faker.number.int({ min: 10_000_000, max: 9_000_000_000 })
        ),

        // Hardware Usage (real-time)
        cpuUsage: faker.number.float({ min: 1, max: 95, fractionDigits: 1 }),
        memoryUsage: gb(usedMemGB),
        diskUsage: gb(usedDiskGB),
        batteryLevel: faker.number.float({
            min: 5,
            max: 100,
            fractionDigits: 1,
        }),
        batteryStatus: pick([
            'charging',
            'discharging',
            'full',
        ]) as BatteryStatus,
        temperatureCpu: faker.number.float({
            min: 30,
            max: 85,
            fractionDigits: 1,
        }),
        temperatureGpu: faker.number.float({
            min: 30,
            max: 80,
            fractionDigits: 1,
        }),

        // Connection Status (real-time)
        isOnline: true,
        status: overrides.status ?? 'online',
        lastSeen,
        uptime: BigInt(uptimeMs),
        bootTime: boot,
        lastReboot: boot,
        connectionQuality: pick([
            'excellent',
            'good',
            'fair',
        ]) as ConnectionQuality,

        // Performance Metrics (real-time)
        avgCpuUsage24h: faker.number.float({
            min: 10,
            max: 70,
            fractionDigits: 1,
        }),
        avgMemoryUsage24h: faker.number.float({
            min: 20,
            max: 80,
            fractionDigits: 1,
        }),
        processCount: faker.number.int({ min: 80, max: 420 }),

        // Additional Info
        notes: faker.lorem.sentence(),
        tags: [
            pick(['dev', 'qa', 'prod', 'lab']),
            pick(['linux', 'windows', 'mac']),
            'agent',
        ],
        location: pick(['NYC Office', 'Remote - EU', 'Data Center 1']),
        department: pick(['Engineering', 'QA', 'Operations', 'Security']),

        // Timestamps
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: lastSeen,
    };

    return device;
};

export const createFakeDevices = (
    count: number,
    overrides: FakeDeviceInput = {}
) => Array.from({ length: count }, () => createFakeDevice(overrides));

// Example usage helper (not executed automatically)
// import { PrismaClient } from '@unity-link/db';
// const prisma = new PrismaClient();
// async function seed() {
//   const devices = createFakeDevices(10);
//   for (const d of devices) {
//     await prisma.device.upsert({
//       where: { naturalId: d.naturalId },
//       update: d,
//       create: d,
//     });
//   }
// }
// seed();
