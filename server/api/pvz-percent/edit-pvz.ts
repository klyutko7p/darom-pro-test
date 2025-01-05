import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  pvz: IPVZPercent;
}

export default defineEventHandler(async (event) => {
  try {
    const { pvz } = await readBody<IRequestBody>(event);

    const updatePVZ = await prisma.pVZPercent.update({
      where: {
        id: pvz.id,
      },
      data: {
        wb: pvz.wb,
        ozon: pvz.ozon,
        ym: pvz.ym,
        flag: pvz.flag,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
