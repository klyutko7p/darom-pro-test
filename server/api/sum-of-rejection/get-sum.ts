import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const sumOfRejection = await prisma.sumOfRejection.findFirst();
        return sumOfRejection;
    } catch (err) {
        console.error(err);
    }
})