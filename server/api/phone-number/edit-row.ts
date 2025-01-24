import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    row: IPhoneNumber;
}

export default defineEventHandler(async (event) => {
    try {
        const { row } = await readBody<IRequestBody>(event);
        const updateRow = await prisma.phoneNumber.update({
            where: {
                id: row.id,
            },
            data: {
                id: row.id,
                number: row.number,
                address: row.address,
            },
        })
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
