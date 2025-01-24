import { PrismaClient } from "@prisma/client";
interface IRequestBody {
  link: string;
}
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const { link } = await readBody<IRequestBody>(event);
    const requestData = {
      url: "https://www.ozon.ru/api/entrypoint-api.bx/page/json/v2?url=/product/" + link,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };

    const response = await fetch(
      "https://telegram-bot-oz-f14d7a525ec1.herokuapp.com/post_endpoint",
      options
    );
    const data = await response.json();

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
