import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
const prisma = new PrismaClient();

const saltRounds = 10;

interface IRequestBody {
  phoneNumber: string;
  newPassword: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { phoneNumber, newPassword } = await readBody<IRequestBody>(event);

    const hashPassword = await bcrypt.hash(newPassword, saltRounds);

    const updateClient = await prisma.client.update({
      where: {
        phoneNumber,
      },
      data: {
        password: hashPassword,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred" };
  }
});
