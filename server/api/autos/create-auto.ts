import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  auto: AutoRow;
}

export default defineEventHandler(async (event) => {
  try {
    const { auto } = await readBody<IRequestBody>(event);

    await prisma.autoRow.create({
      data: {
        nameOfEquipment: auto.nameOfEquipment,
        state: auto.state,
        autoTypeId: auto.autoTypeId,
        updatedUserId: auto.updatedUserId,
      },
    });
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
