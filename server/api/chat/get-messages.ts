import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const messages = await prisma.chatThread.findMany({
      include: {
        messages: true,
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });
    return messages;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
