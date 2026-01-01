import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    engine: "classic",
    datasource: {
        url: "postgresql://rebecca:123456789@localhost:5432/unity_link?schema=public",
    },
});
