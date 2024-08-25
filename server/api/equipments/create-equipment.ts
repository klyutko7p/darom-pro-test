import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  equipment: IEquipmentRow;
}

export default defineEventHandler(async (event) => {
  try {
    const { equipment } = await readBody<IRequestBody>(event);

    await prisma.equipmentRow.create({
      data: {
        state: equipment.state,
        nameOfEquipment: equipment.nameOfEquipment,
        pvzId: equipment.pvzId,
        updatedUserId: equipment.updatedUserId,
      },
    });
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
