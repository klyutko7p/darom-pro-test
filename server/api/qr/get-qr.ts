import { PrismaClient } from "@prisma/client";
interface IRequestBody {
  qrcId: string;
}
const prisma = new PrismaClient();
const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { qrcId } = await readBody<IRequestBody>(event);
  const url = `https://enter.tochka.com/uapi/sbp/v1.0/qr-code/${qrcId}`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${runtimeConfig.tokenQR}`,
  };

  let qrCodeData = await fetch(url, {
    method: "GET",
    headers: headers,
  }).then((response) => response.json());

  return qrCodeData;
});
