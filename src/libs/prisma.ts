import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../prisma/generated/client.ts";
import { settings } from "../settings";

const adapter = new PrismaPg({ connectionString: settings.db.url });
export const prisma = new PrismaClient({ adapter });
