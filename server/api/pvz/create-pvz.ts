import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  pvzData: PVZ;
}

export default defineEventHandler(async (event) => {
  try {
    const { pvzData } = await readBody<IRequestBody>(event);
    const pvz = await prisma.pVZ.create({
      data: {
        name: pvzData.name,
        address: pvzData.address,
        coordinates: pvzData.coordinates,
      },
    });
    return pvz;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
