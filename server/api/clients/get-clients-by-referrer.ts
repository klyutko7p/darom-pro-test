import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  phoneNumber: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { phoneNumber } = await readBody<IRequestBody>(event);

    const clientsData = await prisma.clientReferral.findMany({
      where: {
        referred: phoneNumber,
      },
    });
    return clientsData;
  } catch (error) {
    console.error(error);
    return error;
  }
});
