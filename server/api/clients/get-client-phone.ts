import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface IRequestBody {
  phoneNumber: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { phoneNumber } = await readBody<IRequestBody>(event);

    const clientData = await prisma.client.findFirst({
      where: {
        phoneNumber: phoneNumber,
      },
    });

    return clientData;
  } catch (error) {
    console.error(error);
    return error;
  }
});
