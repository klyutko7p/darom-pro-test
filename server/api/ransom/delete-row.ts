import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    id: number;
    flag: string;
}


export default defineEventHandler(async (event) => {
    try {
        const { id, flag } = await readBody<IRequestBody>(event);

        if (flag === 'OurRansom') {
            const deleteRow = await prisma.ourRansom.update({
                where: {
                    id: id,
                },
                data: {
                    deleted: new Date(),
                }
            })
        } else if (flag === 'ClientRansom') {
            const deleteRow = await prisma.clientRansom.update({
                where: {
                    id: id,
                },
                data: {
                    deleted: new Date(),
                }
            })
        } else if (flag === 'Delivery') {
            const deleteRow = await prisma.delivery.update({
                where: {
                    id: id,
                },
                data: {
                    deleted: new Date(),
                }
            })
        }

       
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
