import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  idArray: number[];
  flag: string;
  userId: number;
}

const stateMap: Record<string, string> = {
  OK: "Исправное",
  RP: "Требуется ремонт",
  FT: "Неисправное",
};

export default defineEventHandler(async (event) => {
  try {
    const { idArray, flag, userId } = await readBody<IRequestBody>(event);

    const newState = stateMap[flag];
    if (newState) {
      const updatedRows = await prisma.equipmentRow.updateMany({
        where: {
          id: {
            in: idArray,
          },
        },
        data: {
          state: newState,
          updatedUserId: userId,
        },
      });

      return { success: true };
    } else {
      throw new Error("Invalid flag value provided.");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
    return { error: "An unknown error occurred." };
  }
});
