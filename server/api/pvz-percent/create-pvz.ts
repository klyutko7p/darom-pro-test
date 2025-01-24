import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  pvzPercent: IPVZPercent;
}

export default defineEventHandler(async (event) => {
  try {
    const { pvzPercent } = await readBody<IRequestBody>(event);
    const pvz = await prisma.pVZPercent.create({
      data: {
        pvzId: pvzPercent.pvzId,
        wb: pvzPercent.wb,
        ozon: pvzPercent.ozon,
        ym: pvzPercent.ym,
        flag: pvzPercent.flag,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
