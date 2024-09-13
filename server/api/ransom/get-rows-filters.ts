import { PrismaClient } from "@prisma/client";
import * as msgpack from "@msgpack/msgpack";

const prisma = new PrismaClient();

interface IRequestBody {
  selectedCell: string[];
  selectedFromName: string[];
  selectedProductName: string[];
  selectedDispatchPVZ: string[];
  selectedOrderPVZ: string[];
  selectedOrderAccount: string[];
  selectedNotation: string[];
  selectedAdditionally: string[];
  selectedPriceSite: string[];
}

export default defineEventHandler(async (event) => {
  try {
    const {
      selectedCell,
      selectedFromName,
      selectedProductName,
      selectedDispatchPVZ,
      selectedOrderPVZ,
      selectedOrderAccount,
      selectedNotation,
      selectedAdditionally,
      selectedPriceSite,
    } = await readBody<IRequestBody>(event);

    let query = `SELECT * FROM "OurRansom" WHERE 1=1`;
    const params: any[] = [];

    // Добавляем условия только для непустых массивов
    if (selectedCell.length > 0) {
      query += ` AND "cell" = ANY($${params.length + 1})`;
      params.push(selectedCell);
    }
    if (selectedFromName.length > 0) {
      query += ` AND "fromName" = ANY($${params.length + 1})`;
      params.push(selectedFromName);
    }
    if (selectedProductName.length > 0) {
      query += ` AND "productName" = ANY($${params.length + 1})`;
      params.push(selectedProductName);
    }
    if (selectedDispatchPVZ.length > 0) {
      query += ` AND "dispatchPVZ" = ANY($${params.length + 1})`;
      params.push(selectedDispatchPVZ);
    }
    if (selectedOrderPVZ.length > 0) {
      query += ` AND "orderPVZ" = ANY($${params.length + 1})`;
      params.push(selectedOrderPVZ);
    }
    if (selectedOrderAccount.length > 0) {
      query += ` AND "orderAccount" = ANY($${params.length + 1})`;
      params.push(selectedOrderAccount);
    }
    if (selectedNotation.length > 0) {
      query += ` AND "notation" = ANY($${params.length + 1})`;
      params.push(selectedNotation);
    }
    if (selectedAdditionally.length > 0) {
      query += ` AND "additionally" = ANY($${params.length + 1})`;
      params.push(selectedAdditionally);
    }
    if (selectedPriceSite.length > 0) {
      query += ` AND "priceSite" = ANY($${params.length + 1})`;
      params.push(selectedPriceSite);
    }

    // Выполнение запроса с параметрами
    const records = await prisma.$queryRawUnsafe(query, ...params);

    const packed = msgpack.encode(records);
    return packed;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
  }
});
