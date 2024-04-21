import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  referrerPhone: string;
  referredPhone: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { referrerPhone, referredPhone } = await readBody<IRequestBody>(
      event
    );

    const clientData = await prisma.clientReferral.create({
      data: {
        referred: referredPhone,
        referrer: referrerPhone,
      },
    });
  } catch (error) {
    console.error(error);
    return error;
  }
});
