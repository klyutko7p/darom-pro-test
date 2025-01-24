import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  auto: AutoRow;
}

export default defineEventHandler(async (event) => {
  try {
    const { auto } = await readBody<IRequestBody>(event);

    const equipment = await prisma.autoRow.update({
      where: {
        id: auto.id,
      },
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
