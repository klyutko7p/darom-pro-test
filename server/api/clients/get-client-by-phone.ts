import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface IRequestBody {
  phoneNumber: string;
}

function generateToken(user: User): string {
  const payload = {
    username: user.username,
    role: user.role,
  };

  const secretKey = process.env.JWT_SECRET_KEY || "defaultSecretKey";
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
}

export default defineEventHandler(async (event) => {
  try {
    const { phoneNumber } = await readBody<IRequestBody>(event);

    const clientData = await prisma.client.findFirst({
      where: {
        phoneNumber,
      },
    });

    const token = generateToken(clientData);
    
    return { data: { clientData, token } };
  } catch (error) {
    console.error(error);
    return error;
  }
});
