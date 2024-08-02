import { initializeApp, deleteApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface IRequestBody {
  title: string;
  message: string;
  phoneNumber: string;
}

export default defineEventHandler(async (event) => {
  const { title, message, phoneNumber } = await readBody<IRequestBody>(event);

  if (typeof navigator.serviceWorker !== "undefined") {
    const app = initializeApp();
    const messaging = getMessaging(app);
    let tokensArray: string[] = [];

    try {
      const clientDevices = await prisma.clientDevicesToken.findMany({
        where: {
          phoneNumber,
        },
      });
      tokensArray = clientDevices.map((device) => device.token);
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
  } else {
    console.warn("Service Worker is not supported in this browser.");
  }
});
