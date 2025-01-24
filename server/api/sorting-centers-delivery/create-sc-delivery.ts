import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    name: string;
    address: string;
}


export default defineEventHandler(async (event) => {
    try {
        const { name } = await readBody<IRequestBody>(event);

        const sortingCenter = await prisma.sortingCenterDelivery.create({
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
