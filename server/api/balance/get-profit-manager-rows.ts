import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export default defineEventHandler(async (event) => {
    try {
        const rows = await prisma.profitManager.findMany({
            orderBy: {
                issued: 'desc',
            }
        });
        return rows;
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
            return { error: error.message };
        }
    }

});
