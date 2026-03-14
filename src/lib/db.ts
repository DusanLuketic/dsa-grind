import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

// Prisma v7 requires a database adapter for SQLite (client engine type)
// PrismaBetterSqlite3 accepts { url } — uses better-sqlite3 under the hood
const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: dbUrl })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
