import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const PrismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof PrismaClientSingleton>;
}

const db = globalThis.prisma ?? PrismaClientSingleton();
export default db;

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
