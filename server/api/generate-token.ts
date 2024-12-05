import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface IRequestBody {
  user: any;
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
    const { user } = await readBody<IRequestBody>(event);
    const token = generateToken(user);
    return { data: { user, token } };
  } catch (error) {
    console.error("Ошибка во время входа в систему:", error);
    return { error: "Ошибка во время входа в систему" };
  }
});
