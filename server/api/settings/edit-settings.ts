import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  settings: any;
}

export default defineEventHandler(async (event) => {
  try {
    const { settings } = await readBody<IRequestBody>(event);

    await prisma.mainSetting.update({
      where: {
        id: settings.id,
      },
      data: {
        mainNumber: settings.mainNumber,
        title: settings.title,
        address: settings.address,
        // tg: settings.tg,
        // vk: settings.vk,
        // tgContact: settings.tgContact,
        // whatsappContact: settings.whatsappContact,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
