// Use PrismaClient exported from @unity-link/db (generated client path)
import { PrismaClient } from '@unity-link/db';
import { createFakeDevices } from './fake-device';

let prisma: PrismaClient;
try {
    prisma = new PrismaClient();
} catch (e) {
    console.error(
        '\nPrismaClient initialization failed. Ensure generation was run:'
    );
    console.error('  cd packages/db && npx prisma generate');
    throw e;
}

interface SeedOptions {
    count: number;
    overwrite: boolean; // if true clears table first
}

function parseArgs(): SeedOptions {
    const args = process.argv.slice(2);
    let count = Number(process.env.SEED_DEVICE_COUNT || 1);
    let overwrite = false;
    for (const a of args) {
        if (a.startsWith('--count=')) count = Number(a.split('=')[1]);
        if (a === '--overwrite' || a === '--reset') overwrite = true;
    }
    if (!Number.isFinite(count) || count <= 0) count = 10;
    return { count, overwrite };
}

async function seed() {
    const { count, overwrite } = parseArgs();
    console.log(
        `Seeding ${count} device(s)${overwrite ? ' (overwrite mode)' : ''}...`
    );

    if (overwrite) {
        // Truncate devices table
        await prisma.$executeRawUnsafe('DELETE FROM "devices"');
        console.log('Cleared existing devices.');
    }

    const devices = createFakeDevices(count);

    for (const d of devices) {
        await prisma.device.upsert({
            where: { naturalId: d.naturalId },
            update: d as any,
            create: d as any,
        });
        console.log(`Upserted device ${d.naturalId}`);
    }
}

seed()
    .catch((err) => {
        console.error('Seed error:', err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('Seed complete.');
    });

// Run examples:
// yarn seed                -> seeds 10 devices
// yarn seed --count=25     -> seeds 25 devices
// SEED_DEVICE_COUNT=5 yarn seed -> seeds 5 devices via env
// yarn seed --overwrite    -> deletes all devices then seeds 10
