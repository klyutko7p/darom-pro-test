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
      "https://api.ozon.ru/composer-api.bx/page/json/v2?url=/product/" +
      productId[4];

    let queryJson = await fetch(apiUrl).then((response) => response.json());
    return queryJson;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
