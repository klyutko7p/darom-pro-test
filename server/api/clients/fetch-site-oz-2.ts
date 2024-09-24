import { PrismaClient } from "@prisma/client";
interface IRequestBody {
  link: string;
}
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const { link } = await readBody<IRequestBody>(event);
    const requestData = {
      url: link,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };

    const response = await fetch(
      "https://oz-fetch-8cfe204b464a.herokuapp.com/post_endpoint",
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
