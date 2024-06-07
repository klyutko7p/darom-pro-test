import { PrismaClient } from "@prisma/client";
import * as msgpack from '@msgpack/msgpack';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {

    const rows = await prisma.ourRansom.findMany({
      select: {
        cell: true,
        dispatchPVZ: true,
        issued: true,
        fromName: true,
        deleted: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const packed = msgpack.encode(rows);
    return packed;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
