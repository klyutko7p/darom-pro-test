import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  username: string;
}

export default defineEventHandler(async (event) => {
  const { username } = await readBody<IRequestBody>(event);

  try {
    const clientDevices = await prisma.employeeDevicesToken.findMany({
      where: {
        username,
      },
    });
    return clientDevices;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
