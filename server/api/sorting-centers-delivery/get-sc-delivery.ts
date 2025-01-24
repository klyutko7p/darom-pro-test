import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const sortingCenters = await prisma.sortingCenterDelivery.findMany();
        return sortingCenters;
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
