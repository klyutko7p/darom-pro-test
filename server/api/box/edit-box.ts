import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  box: Box;
}

export default defineEventHandler(async (event) => {
  try {
    const { box } = await readBody<IRequestBody>(event);

    const updateBox = await prisma.box.update({
      where: {
        id: box.id,
      },
      data: {
        createdUser: box.createdUser,
        dispatchPVZ: box.dispatchPVZ,
        type: box.type,
        delivered: box.delivered ? new Date(box.delivered) : null,
        sorted: box.sorted ? new Date(box.sorted) : null,
        idRows: box.idRows,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
