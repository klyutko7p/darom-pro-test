import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  idArray: number[];
  reason: string;
  userId: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { idArray, reason, userId } = await readBody<IRequestBody>(event);

    await prisma.$executeRawUnsafe(
      `
      UPDATE "EquipmentRow"
      SET "deleted" = $1
      WHERE "id" IN (${idArray})
    `,
      new Date()
    );

    const createdRows = await prisma.decommissionedEquipmentRow.createMany({
      data: idArray.map((id) => ({
        reason: reason,
        decommissionDate: new Date(),
        decommissionedUserId: userId,
        equipmentRowId: id,
      })),
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
    return { error: "An unknown error occurred." };
  }
});
