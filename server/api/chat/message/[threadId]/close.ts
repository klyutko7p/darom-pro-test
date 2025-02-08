// server/api/chat/thread/[threadId]/close.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const threadId = parseInt(event.context.params.threadId as string);
  if (event.req.method === "POST") {
    // Обновляем статус вопроса на CLOSED
    const thread = await prisma.chatThread.update({
      where: { id: threadId },
      data: { status: "CLOSED" },
    });
    return thread;
  } else {
    throw createError({ statusCode: 405, statusMessage: "Метод не разрешён" });
  }
});
