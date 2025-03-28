import CryptoJS from "crypto-js";
import { PrismaClient } from "@prisma/client";
interface IRequestBody {
  phoneNumber: string;
  code: string;
}
const prisma = new PrismaClient();
const key = "T%t2m&v@9fN!PcK";

export default defineEventHandler(async (event) => {
  try {
    const { phoneNumber, code } = await readBody<IRequestBody>(event);
    const bytes = CryptoJS.AES.decrypt(code, key);
    const decryptedCode = bytes.toString(CryptoJS.enc.Utf8);
    const formattedPhoneNumber = phoneNumber.replace("+", "");

    const postData = {
      apiKey: "3KjSBEFaleNnuZTp7IRU0Lu9EhuYaAlmCvUZrkPN85JyYF8AhcMhBucaQ87G",
      sms: [
        {
          channel: "char",
          phone: formattedPhoneNumber,
          text: `Код подтверждения: ${decryptedCode} trackbis.ru`,
          sender: "VIRTA",
        },
      ],
    };

    fetch("https://new.smsgorod.ru/apiSms/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        return data;
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        return error;
      });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
