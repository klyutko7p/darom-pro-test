// server/api/chat/thread.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  if (event.req.method === "POST") {
    const { sender, content, name } = await readBody<{
      sender: string;
      content: string;
      name: string;
    }>(event);
    if (!sender || !content) {
      throw createError({
        statusCode: 400,
        statusMessage: "Отсутствуют необходимые данные",
      });
    }

    // const adminMessage = "Здравствуйте, Вы можете спросить любой интересующий Вас вопрос! Мы всегда на связи"

    // Создаём тему с двумя сообщениями: сначала сообщение от админа, затем сообщение пользователя
    const thread = await prisma.chatThread.create({
      data: {
        subject: content,
        name,
        messages: {
          create: [
            // { sender: "admin", content: adminMessage },
            { sender, content },
          ],
        },
      },
      include: { messages: true },
    });
    return thread;
  }
  throw createError({ statusCode: 405, statusMessage: "Метод не разрешён" });
});
