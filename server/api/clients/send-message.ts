import { PrismaClient } from "@prisma/client";
interface IRequestBody {
  phoneNumber: number;
}
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const { phoneNumber } = await readBody<IRequestBody>(event);

    const postData = {
      apiKey: "4nFBfMgZtcGIaNerL9olzNTpC7yz9aZHwkaVlMd3rOrVr095Lruha7avjQMo",
      sms: [
        {
          channel: "char",
          phone: "79517089158",
          text: "KOD: 21252",
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
