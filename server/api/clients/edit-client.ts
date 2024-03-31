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
    if (client.accessPassword) {
      const hashPassword = await bcrypt.hash(client.accessPassword, saltRounds);

      if (
        client.oldPassword &&
        client.oldPassword === hashPassword &&
        flag === "NON-PASS"
      ) {
        const updateClient = await prisma.client.update({
          where: {
            id: client.id,
          },
          data: {
            fio: client.fio,
            phoneNumber: client.phoneNumber,
            password: client.password,
          },
        });
      } else {
        const newPassword = await bcrypt.hash(client.password, saltRounds);
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
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
