import { PrismaClient } from '@prisma/client';

let prismaClient: PrismaClient;

export const getPrismaClient = () => {
  if (prismaClient) {
    return prismaClient;
  }

  prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['query', 'info', 'warn', 'error'],
  });

  return prismaClient;
};

export const cleanupPrismaClient = async () => {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = undefined;
  }
};
