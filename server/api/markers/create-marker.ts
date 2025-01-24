import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  coordinates: number[];
  type: string;
  username: string;
  notation: string
}

export default defineEventHandler(async (event) => {
  try {
    const { coordinates, type, username, notation } = await readBody<IRequestBody>(event);

    const markerCreate = await prisma.yandexMarker.create({
      data: {
        coordinates: coordinates,
        type: type,
        createdUser: username,
        notation: notation,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
