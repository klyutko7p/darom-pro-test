import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    name: string;
    address: string;
}


export default defineEventHandler(async (event) => {
    try {
        const { name, address } = await readBody<IRequestBody>(event);

        const pvz = await prisma.pVZDelivery.create({
            data: {
                name: name,
                address: address,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
