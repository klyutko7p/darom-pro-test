import { PrismaClient } from "@prisma/client";
import * as msgpack from "@msgpack/msgpack";

const prisma = new PrismaClient();

interface IRequestBody {
  fieldName: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { fieldName } = await readBody<IRequestBody>(event);

    const query = `SELECT DISTINCT "${fieldName}" FROM "OurRansom"`;
    const rowsData = await prisma.$queryRawUnsafe(query);
    const values = rowsData.map((record: any) => record[fieldName]);

    const packed = msgpack.encode(values);
    return packed;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
