import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  id: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody<IRequestBody>(event);

    const deleteDecommissionedEquipmentRow =
      await prisma.decommissionedEquipmentRow.delete({
        where: {
          id: id,
        },
      });
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
