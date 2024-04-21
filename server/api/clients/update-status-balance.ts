import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  phoneNumber: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { phoneNumber } = await readBody<IRequestBody>(event);

    const clientsData = await prisma.clientReferral.update({
      where: {
        referrer: phoneNumber,
      },
      data: {
        isAccrued: true,
      },
    });
    return clientsData;
  } catch (error) {
    console.error(error);
    return error;
  }
});
