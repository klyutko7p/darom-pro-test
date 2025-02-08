import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  id: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody<IRequestBody>(event);
    const deleteRow = await prisma.chatThread.update({
      where: {
        id: id,
      },
      data: {
        deleted: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
