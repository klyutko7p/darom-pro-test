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
      "https://www.ozon.ru/api/entrypoint-api.bx/page/json/v2?url=%2Fproduct%2F" +
      productId[4];

    let queryJson = await fetch('https://api.ozon.ru/composer-api.bx/page/json/v2?url=/product/rog-cetra-true-wireless-igry-besprovodnaya-belye-naushniki-bluetooth-907393197').then((response) => response.json());
    return queryJson;
    // return queryJson.seo.script[0].innerHTML;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
