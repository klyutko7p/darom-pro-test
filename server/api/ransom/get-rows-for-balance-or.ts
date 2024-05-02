import { PrismaClient } from "@prisma/client";
import jsonpack from "jsonpack"

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const rows = await prisma.ourRansom.findMany({
      select: {
        dispatchPVZ: true,
        prepayment: true,
        additionally: true,
        deliveredKGT: true,
        amountFromClient1: true,
        issued: true,
        priceSite: true,
        deleted: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    const packedData = jsonpack.pack(rows);
    return packedData;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
