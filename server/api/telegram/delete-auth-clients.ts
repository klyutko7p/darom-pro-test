import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const clients = await prisma.telegramAuthClients.deleteMany();
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
