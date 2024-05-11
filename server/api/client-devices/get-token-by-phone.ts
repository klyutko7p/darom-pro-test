import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  phoneNumber: string;
}

export default defineEventHandler(async (event) => {
  const { phoneNumber } = await readBody<IRequestBody>(event);

  try {
    const clientDevices = await prisma.clientDevicesToken.findMany({
      where: {
        phoneNumber,
      },
    });
    return clientDevices;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
