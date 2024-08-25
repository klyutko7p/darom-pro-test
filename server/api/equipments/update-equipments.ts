import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  rows: IEquipmentRow[];
}

export default defineEventHandler(async (event) => {
  try {
    let { rows } = await readBody<IRequestBody>(event);

    for (const equipment of rows) {
      const updatedRow = await prisma.equipmentRow.update({
        where: { id: equipment.id },
        data: {
          nameOfEquipment: equipment.nameOfEquipment,
        },
      });
    }
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
