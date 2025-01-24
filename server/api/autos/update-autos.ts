import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  rows: AutoRow[];
}

export default defineEventHandler(async (event) => {
  try {
    let { rows } = await readBody<IRequestBody>(event);

    for (const auto of rows) {
      const updatedRow = await prisma.autoRow.update({
        where: { id: auto.id },
        data: {
          nameOfEquipment: auto.nameOfEquipment,
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
