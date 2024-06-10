import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    username: string;
}


export default defineEventHandler(async (event) => {
    try {
        const { username } = await readBody<IRequestBody>(event);

        const deleteUser = await prisma.user.delete({
            where: {
                username: username,
            },
        })

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }
});
