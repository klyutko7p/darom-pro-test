import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  equipmentData: IEquipmentRow;
}

export default defineEventHandler(async (event) => {
  try {
    const { equipmentData } = await readBody<IRequestBody>(event);

    const equipment = await prisma.equipmentRow.update({
      where: {
        id: equipmentData.id,
      },
      data: {
        state: equipmentData.state,
        nameOfEquipment: equipmentData.nameOfEquipment,
        pvzId: equipmentData.pvzId,
        updatedUserId: equipmentData.updatedUserId,
      },
    });
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
