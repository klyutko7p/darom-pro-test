import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  pvzData: PVZ;
}

export default defineEventHandler(async (event) => {
  try {
    const { pvzData } = await readBody<IRequestBody>(event);

    const updatePVZ = await prisma.pVZ.update({
      where: {
        id: pvzData.id,
      },
      data: {
        name: pvzData.name,
        address: pvzData.address,
        coordinates: pvzData.coordinates,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
