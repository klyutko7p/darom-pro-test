import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  box: Box;
}

export default defineEventHandler(async (event) => {
  try {
    const { box } = await readBody<IRequestBody>(event);
    const boxData = await prisma.box.create({
      data: {
        createdUser: box.createdUser,
        dispatchPVZ: box.dispatchPVZ,
        type: box.type,
      },
    });
    return boxData;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
