import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const saltRounds = 10;

interface IRequestBody {
  client: Client;
}

export default defineEventHandler(async (event) => {
  try {
    const { client } = await readBody<IRequestBody>(event);
    const hashPassword = await bcrypt.hash(client.password, saltRounds);

    const clientData = await prisma.client.create({
      data: {
        phoneNumber: client.phoneNumber,
        password: hashPassword,
        fio: client.fio,
        role: "CLIENT",
        isPersonalDataProcessingPolicyAgreed:
          client.isPersonalDataProcessingPolicyAgreed,
        isPrivacyPolicyAgreed: client.isPrivacyPolicyAgreed,
      },
    });
  } catch (error) {
    console.error(error);
    return error;
  }
});
