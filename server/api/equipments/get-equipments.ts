import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const equipments = await prisma.equipmentRow.findMany({
      include: {
        pvz: true,
        updatedUser: true,
        DecommissionedEquipmentRow: true,
      },
      orderBy: [
        {
          pvz: {
            name: "desc",
          },
          nameOfEquipment: "desc",
        },
      ],
    });
    return equipments;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
