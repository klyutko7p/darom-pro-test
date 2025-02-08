// server/api/chat/message/[threadId].ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const threadId = parseInt(event.context.params.threadId as string);
  if (event.req.method === "POST") {
    const { sender, content } = await readBody<{
      sender: string;
      content: string;
    }>(event);
    if (!sender || !content) {
      throw createError({
        statusCode: 400,
        statusMessage: "Отсутствуют необходимые данные",
      });
    }
    const message = await prisma.chatMessage.create({
      data: {
        sender,
        content,
        thread: { connect: { id: threadId } },
      },
    });
    return message;
  }
  throw createError({ statusCode: 405, statusMessage: "Метод не разрешён" });
});
