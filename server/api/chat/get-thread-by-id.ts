import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  id: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody<IRequestBody>(event);
    const row = await prisma.chatThread.findFirst({
      include: {
        messages: true,
      },
      where: {
        id: id,
      },
    });

    return row;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
