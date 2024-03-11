import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    row: IBalance;
}

export default defineEventHandler(async (event) => {
    try {
        const { row } = await readBody<IRequestBody>(event);

        const updateRow = await prisma.advanceReport.update({
            where: {
                id: row.id,
            },
            data: {
                received: new Date(),
            },
        });

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }
});

