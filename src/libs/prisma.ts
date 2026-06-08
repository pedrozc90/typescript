import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { settings } from "../../settings/index.ts";

const adapter = new PrismaPg({
    connectionString: settings.databaseUrl
});

export const prisma = new PrismaClient({
    adapter
});
