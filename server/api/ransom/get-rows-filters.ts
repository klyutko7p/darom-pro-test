import { PrismaClient } from "@prisma/client";
import * as msgpack from "@msgpack/msgpack";

const prisma = new PrismaClient();

interface IRequestBody {
  selectedCell: string[];
  selectedFromName: string[];
  selectedDispatchPVZ: string[];
  selectedOrderPVZ: string[];
  selectedOrderAccount: string[];
  selectedNotation: string[];
  selectedAdditionally: string[];
  selectedPriceSite: string[];
  startDate: Date | string;
  endDate: Date | string;
  startDate2: Date | string;
  endDate2: Date | string;
  startDate3: Date | string;
  endDate3: Date | string;
  startDate4: Date | string;
  endDate4: Date | string;
}

export default defineEventHandler(async (event) => {
  try {
    const {
      selectedCell,
      selectedFromName,
      selectedDispatchPVZ,
      selectedOrderPVZ,
      selectedOrderAccount,
      selectedNotation,
      selectedAdditionally,
      selectedPriceSite,
      startDate,
      endDate,
      startDate2,
      endDate2,
      startDate3,
      endDate3,
      startDate4,
      endDate4,
    } = await readBody<IRequestBody>(event);

    let query = `SELECT "additionally", "amountFromClient1", "clientLink1", "cell", "createdUser", "created_at", "deleted", "id", "deliveredKGT", "deliveredPVZ", "deliveredSC", "dispatchPVZ", "orderPVZ", "fromName", "issued", "notation", "orderAccount", "percentClient", "prepayment", "priceSite", "productLink", "profit1","updatedUser", "updated_at" FROM "OurRansom" WHERE 1=1`;
    const params: any[] = [];

    if (selectedCell.length > 0) {
      query += ` AND "cell" = ANY($${params.length + 1})`;
      params.push(selectedCell);
    }
    if (selectedFromName.length > 0) {
      query += ` AND "fromName" = ANY($${params.length + 1})`;
      params.push(selectedFromName);
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

    if (startDate) {
      query += ` AND "issued" >= CAST($${params.length + 1} AS timestamp)`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND "issued" <= CAST($${params.length + 1} AS timestamp)`;
      params.push(endDate);
    }

    if (startDate2) {
      query += ` AND "deliveredSC" >= CAST($${params.length + 1} AS timestamp)`;
      params.push(startDate2);
    }

    if (endDate2) {
      query += ` AND "deliveredSC" <= CAST($${params.length + 1} AS timestamp)`;
      params.push(endDate2);
    }

    if (startDate3) {
      query += ` AND "created_at" >= CAST($${params.length + 1} AS timestamp)`;
      params.push(startDate3);
    }

    if (endDate3) {
      query += ` AND "created_at" <= CAST($${params.length + 1} AS timestamp)`;
      params.push(endDate3);
    }

    if (startDate4) {
      query += ` AND "deliveredPVZ" >= CAST($${
        params.length + 1
      } AS timestamp)`;
      params.push(startDate4);
    }

    if (endDate4) {
      query += ` AND "deliveredPVZ" <= CAST($${
        params.length + 1
      } AS timestamp)`;
      params.push(endDate4);
    }

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
