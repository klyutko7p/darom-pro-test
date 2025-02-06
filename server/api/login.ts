import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const config = useRuntimeConfig();
const secretKey = config.jwtSecretKey;

interface IRequestBody {
  username: string;
  password: string;
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
    const { username, password } = await readBody<IRequestBody>(event);

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return { error: "Пользователь не найден" };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    const tokenFourssan = jwt.sign({ userId: user.id, role: user.role }, secretKey, {
      expiresIn: "1d",
    });

    setCookie(event, "tokenFourssan", tokenFourssan, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 1, // 1 день
    });

    if (passwordMatch) {
      const token = generateToken(user);
      return { data: { user, token } };
    } else {
      return { error: "Неверный пароль" };
    }
  } catch (error) {
    console.error("Ошибка во время входа в систему:", error);
    return { error: "Ошибка во время входа в систему" };
  }
});
