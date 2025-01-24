import { PrismaClient } from "@prisma/client";
interface IRequestBody {
  link: string;
}
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const { link } = await readBody<IRequestBody>(event);
    fetch(link)
    .then(response => response.text())
    .then(html => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
  
      const element = tempDiv.querySelector('.js');
  
      return element
    })
    .catch(error => console.error('Ошибка при запросе:', error));
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
