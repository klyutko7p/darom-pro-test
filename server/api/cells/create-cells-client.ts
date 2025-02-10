import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  pvzName: string;
  quantity: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { pvzName, quantity } = await readBody<IRequestBody>(event);

    const numberMatch = pvzName.match(/\d+/);
    let letterPrefix = "";

    if (numberMatch) {
      const pvzNumber = parseInt(numberMatch[0], 10);
      // Массив букв русского алфавита (без буквы Ё)
      const russianAlphabet = [
        "А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "Й",
        "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У",
        "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э",
        "Ю", "Я"
      ];

      // Если номер находится в допустимом диапазоне – используем соответствующую букву
      if (pvzNumber >= 1 && pvzNumber <= russianAlphabet.length) {
        letterPrefix = russianAlphabet[pvzNumber - 1];
      }
    }

    let startingIndex = 1;

    if (letterPrefix) {
      // Если используется префикс, ищем существующие ячейки с таким префиксом
      const existingCells = await prisma.cell.findMany({
        where: {
          PVZ: pvzName,
          name: {
            startsWith: letterPrefix
          }
        },
        select: { name: true }
      });

      const numbers = existingCells
        .map(cell => {
          const numStr = cell.name.replace(letterPrefix, "");
          return parseInt(numStr, 10);
        })
        .filter(n => !isNaN(n));

      if (numbers.length > 0) {
        startingIndex = Math.max(...numbers) + 1;
      }
    } else {
      // Если префикса нет, ищем все ячейки для данного ПВЗ
      const existingCells = await prisma.cell.findMany({
        where: { PVZ: pvzName },
        select: { name: true }
      });

      // Пытаемся разобрать имя ячейки как число
      const numbers = existingCells
        .map(cell => parseInt(cell.name, 10))
        .filter(n => !isNaN(n));

      if (numbers.length > 0) {
        startingIndex = Math.max(...numbers) + 1;
      }
    }

    const cells = Array.from({ length: quantity }, (_, i) => ({
      name: letterPrefix ? `${letterPrefix}${startingIndex + i}` : `${startingIndex + i}`,
      status: "Свободно",
      fromName: null,
      PVZ: pvzName,
    }));

    const result = await prisma.cellClient.createMany({
      data: cells,
    });

    return { created: result.count }; 
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
