import { PrismaClient } from "@prisma/client";
interface IRequestBody {
  link: string;
}
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const { link } = await readBody<IRequestBody>(event);
    let productId = link.split("/");

    let apiUrl =
      "https://www.ozon.ru/api/entrypoint-api.bx/page/json/v2?url=/product/" +
      1528937241;

    let queryJson = await fetch(apiUrl, {
      method: "GET",
    })
      .then((response) => response.json())
      .catch((error) => console.error("Error:", error));

    return queryJson;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
