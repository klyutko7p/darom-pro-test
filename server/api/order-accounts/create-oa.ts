import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    name: string;
}


export default defineEventHandler(async (event) => {
    try {
        const { name } = await readBody<IRequestBody>(event);

        const orderAccount = await prisma.orderAccount.create({
            data: {
                name: name,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
