import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    username: string;
    token: string;
}


export default defineEventHandler(async (event) => {
    try {
        const { username, token } = await readBody<IRequestBody>(event);

        const clientDevice = await prisma.employeeDevicesToken.create({
            data: {
                username,
                token,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
