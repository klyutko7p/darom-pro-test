import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const markers = await prisma.yandexMarker.findMany();
        return markers;
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
