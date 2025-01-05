import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  rows: IPVZPercent[];
}

export default defineEventHandler(async (event) => {
  try {
    let { rows } = await readBody<IRequestBody>(event);

    for (const row of rows) {
      const updatedRow = await prisma.pVZPercent.update({
        where: { id: row.id },
        data: {
          wb: row.wb,
          ozon: row.ozon,
          ym: row.ym,
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
