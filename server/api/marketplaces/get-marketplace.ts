import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const marketplaces = await prisma.marketplace.findMany();
        return marketplaces;
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
