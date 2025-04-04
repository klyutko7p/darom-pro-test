import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const cells = await prisma.cellClient.findMany({
            orderBy: [
                {
                    PVZ: 'asc',
                },
                {
                    id: 'asc'
                },
            ],
        });
        return cells;
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
