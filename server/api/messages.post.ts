import { credential } from "firebase-admin";
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

  const app = initializeApp();
  const messaging = getMessaging(app);
  let tokensArray: string[] = []

  try {
    const clientDevices = await prisma.clientDevicesToken.findMany({
      where: {
        phoneNumber,
      },
    });
    tokensArray = clientDevices.map(device => device.token);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
  
  await messaging.sendEachForMulticast({
    tokens: tokensArray,
    notification:  {
      title: title,
      body: message,
    }
  })

  // await messaging.send({
  //   token:
  //     "fV7H_C-9TUxl7EgjCVQPNJ:APA91bHXp3mEnYxj4PLLNE57NQi7Sl5ZnpII-_HCkc7wQjtT2B4E6cSUz1O2XB6A9dixxUz4bqJInTWpQj7IYlufl4sSTz7DIjLhxBDtzXOyPzk4Vqco7-RC8-yXz138q2daeTA9-Sp9",
    // notification: {
    //   title: title,
    //   body: message,
    // },
  // });

  messaging.sendToTopic("topic", { notification: {} });
  deleteApp(app);
});
