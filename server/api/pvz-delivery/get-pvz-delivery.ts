import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const pvz = await prisma.pVZDelivery.findMany();
        return pvz;
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
