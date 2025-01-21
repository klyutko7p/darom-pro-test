import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  id: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody<IRequestBody>(event);
    const boxData = await prisma.box.findFirst({
      where: {
        id,
      },
    });
    return boxData;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
