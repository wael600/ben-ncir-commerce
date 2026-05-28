import { PrismaClient } from "@/app/generated/prisma/index.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const PrismaClientSingleton = () => {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof PrismaClientSingleton>;
}

const db = globalThis.prisma ?? PrismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;