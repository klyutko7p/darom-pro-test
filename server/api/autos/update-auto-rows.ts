import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  idArray: number[];
  autoTypeId: number;
  userId: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { idArray, autoTypeId, userId } = await readBody<IRequestBody>(event);

    const updatedRows = await prisma.autoRow.updateMany({
      where: {
        id: {
          in: idArray,
        },
      },
      data: {
        autoTypeId,
        updatedUserId: userId,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
    return { error: "An unknown error occurred." };
  }
});
