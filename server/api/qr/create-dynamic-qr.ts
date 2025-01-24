import { PrismaClient } from "@prisma/client";
interface IRequestBody {
  amount: number;
  notation: string;
}
const prisma = new PrismaClient();
const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { amount, notation } = await readBody<IRequestBody>(event);
  const url = `https://enter.tochka.com/uapi/acquiring/v1.0/payments`;

  const payload = {
    Data: {
      customerCode: "300604366",
      amount: amount,
      purpose: notation,
      redirectUrl: "https://darom.pro/",
      paymentMode: ["sbp"],
    },
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${runtimeConfig.tokenQR}`,
  };

  let qrCodeData = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  }).then((response) => response.json());

  return qrCodeData;
});
