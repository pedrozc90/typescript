import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client.ts";
import { settings } from "../settings/index.ts";

const adapter = new PrismaPg({ connectionString: settings.db.url });
export const prisma = new PrismaClient({ adapter });
