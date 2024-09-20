import { PrismaClient } from "@prisma/client";
interface IRequestBody {
  amount: number;
  notation: string;
}
const prisma = new PrismaClient();
const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { amount, notation } = await readBody<IRequestBody>(event);
  const url = `https://enter.tochka.com/uapi/sbp/v1.0/qr-code/merchant/${runtimeConfig.merchantId}/${runtimeConfig.accountId}`;

  const payload = {
    Data: {
      paymentPurpose: notation,
      qrcType: "01",
      sourceName: `Darom.pro`,
      imageParams: {
        width: 200,
        height: 200,
        mediaType: "image/png",
      },
      redirectUrl: "https://darom.pro/",
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
