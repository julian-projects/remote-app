import { Device } from './generated/prisma/browser.js';

export { type Device as IDevice } from './generated/prisma/browser.js';

export type IFrontendDevice = Omit<
    Device,
    'diskUsage' | 'diskTotal' | 'memoryUsage' | 'memoryTotal'
> & {
    memoryUsage: string | null;
    memoryTotal: string | null;
    diskUsage: string | null;
    diskTotal: string | null;
    userId: string;
};

export { PrismaClient } from './generated/prisma/client.js';
