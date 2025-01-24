import { PrismaClient, Role } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const saltRounds = 10;


interface IRequestBody {
  username: string;
  password: string;
  role: Role;
}


export default defineEventHandler(async (event) => {
  try {
    const { username, password, role = "ADMIN" } = await readBody<IRequestBody>(event);
    const hashPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        username: username,
        password: hashPassword,
        role: role
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }

});
