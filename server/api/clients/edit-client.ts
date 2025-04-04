import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
const prisma = new PrismaClient();

const saltRounds = 10;

interface IRequestBody {
  client: Client;
  flag: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { client, flag } = await readBody<IRequestBody>(event);
    if (client.accessPassword && client.oldPassword) {
      const result = await new Promise((resolve, reject) => {
        bcrypt.compare(
          client.accessPassword,
          client.oldPassword,
          async (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            }
            if (result) {
              console.error("Пароли совпадают");
              resolve("Пароли совпадают");
              if (flag === "NON-PASS") {
                const updateClient = await prisma.client.update({
                  where: {
                    id: client.id,
                  },
                  data: {
                    fio: client.fio,
                    phoneNumber: client.phoneNumber,
                  },
                });
              } else {
                const newPassword = await bcrypt.hash(
                  client.password,
                  saltRounds
                );
                const updateClient = await prisma.client.update({
                  where: {
                    id: client.id,
                  },
                  data: {
                    fio: client.fio,
                    phoneNumber: client.phoneNumber,
                    password: newPassword,
                  },
                });
              }
            } else {
              console.error("Введённый прошлый пароль не совпадает!");
              resolve("Введённый прошлый пароль не совпадает!");
            }
          }
        );
      });
      return result;
    } else {
      return "Произошла ошибка";
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
