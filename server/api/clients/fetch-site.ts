import { PrismaClient } from "@prisma/client";
interface IRequestBody {
  link: string;
}
const prisma = new PrismaClient();

function getBasketNumber(input: string) {
  let vol = parseInt(input);
  let host;
  if (vol >= 0 && vol <= 143) {
    host = "01";
  } else if (vol >= 144 && vol <= 287) {
    host = "02";
  } else if (vol >= 288 && vol <= 431) {
    host = "03";
  } else if (vol >= 432 && vol <= 719) {
    host = "04";
  } else if (vol >= 720 && vol <= 1007) {
    host = "05";
  } else if (vol >= 1008 && vol <= 1061) {
    host = "06";
  } else if (vol >= 1062 && vol <= 1115) {
    host = "07";
  } else if (vol >= 1116 && vol <= 1169) {
    host = "08";
  } else if (vol >= 1170 && vol <= 1313) {
    host = "09";
  } else if (vol >= 1314 && vol <= 1601) {
    host = "10";
  } else if (vol >= 1602 && vol <= 1655) {
    host = "11";
  } else if (vol >= 1656 && vol <= 1919) {
    host = "12";
  } else if (vol >= 1920 && vol <= 2045) {
    host = "13";
  } else {
    host = "14";
  }

  return `${host}`;
}

const fetchWithDelay = async (url: any, delay: any) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetch(url).then(response => response.json());
};

export default defineEventHandler(async (event) => {
  try {
    const { link } = await readBody<IRequestBody>(event);
    let parts = link.split("/");
    let number = parts[parts.length - 2];
    let firstSixDigits;
    let firstFourDigits;
    let basketNumber;

    if (number.length === 9) {
      firstSixDigits = number.substring(0, 6);
      firstFourDigits = number.substring(0, 4);
      basketNumber = getBasketNumber(firstFourDigits);
    } else if (number.length === 8) {
      firstSixDigits = number.substring(0, 5);
      firstFourDigits = number.substring(0, 3);
      basketNumber = getBasketNumber(firstFourDigits);
    }

    let url = `https://basket-${basketNumber}.wbbasket.ru/vol${firstFourDigits}/part${firstSixDigits}/${number}/info/ru/card.json`;
    let url2 = `https://basket-${basketNumber}.wbbasket.ru/vol${firstFourDigits}/part${firstSixDigits}/${number}/info/price-history.json`;
    let url3 = `https://basket-${basketNumber}.wbbasket.ru/vol${firstFourDigits}/part${firstSixDigits}/${number}/images/big/1.webp`;

    let clients = await fetch(url).then((response) => response.json());
    let clients2 = await fetch(url2).then((response) => response.json());
    let clients3 = url3;
    return [clients, clients2, clients3];
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
});
