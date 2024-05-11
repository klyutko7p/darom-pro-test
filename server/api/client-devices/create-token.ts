import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    phoneNumber: string;
    token: string;
}


export default defineEventHandler(async (event) => {
    try {
        const { phoneNumber, token } = await readBody<IRequestBody>(event);

        const clientDevice = await prisma.clientDevicesToken.create({
            data: {
                phoneNumber,
                token,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
