import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  idArray: number[];
  pvzId: number;
  userId: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { idArray, pvzId, userId } = await readBody<IRequestBody>(event);

    const updatedRows = await prisma.equipmentRow.updateMany({
      where: {
        id: {
          in: idArray,
        },
      },
      data: {
        pvzId,
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
