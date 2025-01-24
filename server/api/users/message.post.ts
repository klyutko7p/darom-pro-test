import { initializeApp, deleteApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface IRequestBody {
  title: string;
  message: string;
  username: string;
}

export default defineEventHandler(async (event) => {
  const { title, message, username } = await readBody<IRequestBody>(event);

  const app = initializeApp();
  const messaging = getMessaging(app);
  let tokensArray: string[] = [];

  try {
    const employeeDevices = await prisma.employeeDevicesToken.findMany({
      where: {
        username,
      },
    });
    tokensArray = employeeDevices.map((device) => device.token);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }

  await messaging.sendEachForMulticast({
    tokens: tokensArray,
    notification: {
      title: title,
      body: message,
    },
  });

  messaging.sendToTopic("topic", { notification: {} });
  deleteApp(app);
});
