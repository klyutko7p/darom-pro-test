import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  pvzName: string;
  quantity: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { pvzName, quantity } = await readBody<IRequestBody>(event);

    // Определяем стартовый индекс для имен ячеек,
    // чтобы не создавать дубликаты уже существующих записей.
    let startingIndex = 1;

    // Получаем все существующие ячейки для данного PVZ,
    // выбираем только поле name.
    const existingCells = await prisma.cell.findMany({
      where: { PVZ: pvzName },
      select: { name: true },
    });

    // Извлекаем числовую часть из имени ячейки (предполагаем, что имя — числовая строка)
    const numbers = existingCells
      .map((cell) => parseInt(cell.name, 10))
      .filter((num) => !isNaN(num));

    if (numbers.length > 0) {
      startingIndex = Math.max(...numbers) + 1;
    }

    // Генерируем массив ячеек.
    // Каждая ячейка получает имя как порядковый номер (строка),
    // начиная с startingIndex.
    const cells = Array.from({ length: quantity }, (_, i) => ({
      name: (startingIndex + i).toString(),
      status: "Свободно",
      fromName: null,
      PVZ: pvzName,
    }));

    // Массово создаём ячейки в базе данных
    const result = await prisma.cell.createMany({
      data: cells,
    });

    return { created: result.count };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
