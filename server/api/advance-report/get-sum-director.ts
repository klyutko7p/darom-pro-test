import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Для сравнения дат используем дату 2024-04-01
    const march312024 = new Date("2024-04-01");

    // 1. Из модели balance – сумма поля "sum" при условии: received не null и recipient = "Директор" или "Власенкова"
    const balanceAgg = await prisma.balance.aggregate({
      _sum: { sum: true },
      where: {
        received: { not: null },
        recipient: { in: ["Директор", "Власенкова"] },
      },
    });
    const sumOfPVZ = balanceAgg._sum.sum ?? 0;

    // 2. Из advanceReport – различные суммы по расходам для наличных:
    // 2.1 sumOfPVZ1: расход, если received задан, createdUser = "Директор" или "Власенкова",
    //      type = "Нал" и typeOfExpenditure не входит в перечень исключений.
    const aggPVZ1 = await prisma.advanceReport.aggregate({
      _sum: { expenditure: true },
      where: {
        received: { not: null },
        createdUser: { in: ["Директор", "Власенкова"] },
        type: "Нал",
        typeOfExpenditure: {
          notIn: [
            "Пополнение баланса",
            "Перевод с кредитного баланса нал",
            "Новый кредит нал",
            "Постоплата WB",
            "Перевод с баланса безнал",
          ],
        },
      },
    });
    const sumOfPVZ1 = aggPVZ1._sum.expenditure ?? 0;

    // 2.2 sumOfPVZ2: расход, если received задан, issuedUser = "Директор" / "Директор (С)" или "Власенкова",
    //      type = "Нал", дата >= march312024 и typeOfExpenditure не входит в ["Перевод с баланса нал", "Перевод с баланса безнал"]
    const aggPVZ2 = await prisma.advanceReport.aggregate({
      _sum: { expenditure: true },
      where: {
        received: { not: null },
        issuedUser: { in: ["Директор", "Директор (С)", "Власенкова"] },
        type: "Нал",
        date: { gte: march312024 },
        typeOfExpenditure: {
          notIn: ["Перевод с баланса нал", "Перевод с баланса безнал"],
        },
      },
    });
    const sumOfPVZ2 = aggPVZ2._sum.expenditure ?? 0;

    // 2.3 sumOfPVZ3: расход, если createdUser = "Директор" или "Власенкова", отсутствует issuedUser,
    //      type = "Нал" и typeOfExpenditure не входит в ["Кредитовый баланс нал", "Перевод с баланса безнал", "Удержания с сотрудников"]
    const aggPVZ3 = await prisma.advanceReport.aggregate({
      _sum: { expenditure: true },
      where: {
        createdUser: { in: ["Директор", "Власенкова"] },
        issuedUser: null,
        type: "Нал",
        typeOfExpenditure: {
          notIn: [
            "Кредитовый баланс нал",
            "Перевод с баланса безнал",
            "Удержания с сотрудников",
          ],
        },
      },
    });
    const sumOfPVZ3 = aggPVZ3._sum.expenditure ?? 0;

    // 2.4 sumOfPVZ13: расход, если type = "Нал" и typeOfExpenditure === "Удержания с сотрудников"
    const aggPVZ13 = await prisma.advanceReport.aggregate({
      _sum: { expenditure: true },
      where: {
        type: "Нал",
        typeOfExpenditure: "Удержания с сотрудников",
      },
    });
    const sumOfPVZ13 = aggPVZ13._sum.expenditure ?? 0;

    // 2.5 sumOfPVZ11: расход, если (createdUser и issuedUser одновременно "Директор" или одновременно "Власенкова"),
    //      type = "Нал" и typeOfExpenditure === "Перевод с баланса безнал"
    const aggPVZ11 = await prisma.advanceReport.aggregate({
      _sum: { expenditure: true },
      where: {
        OR: [
          { createdUser: "Директор", issuedUser: "Директор" },
          { createdUser: "Власенкова", issuedUser: "Власенкова" },
        ],
        type: "Нал",
        typeOfExpenditure: "Перевод с баланса безнал",
      },
    });
    const sumOfPVZ11 = aggPVZ11._sum.expenditure ?? 0;

    // 2.6 sumOfPVZ12: расход, если (createdUser и issuedUser одновременно "Директор" или одновременно "Власенкова"),
    //      type = "Безнал" и typeOfExpenditure === "Перевод с баланса нал"
    const aggPVZ12 = await prisma.advanceReport.aggregate({
      _sum: { expenditure: true },
      where: {
        OR: [
          { createdUser: "Директор", issuedUser: "Директор" },
          { createdUser: "Власенкова", issuedUser: "Власенкова" },
        ],
        type: "Безнал",
        typeOfExpenditure: "Перевод с баланса нал",
      },
    });
    const sumOfPVZ12 = aggPVZ12._sum.expenditure ?? 0;

    // 2.7 Для безналичных операций (суммы с Cashless‑префиксом)
    // sumOfPVZ1Cashless: received задан, createdUser = "Директор" или "Власенкова", type = "Безнал" и
    //   typeOfExpenditure не входит в указанный перечень
    const aggPVZ1Cashless = await prisma.advanceReport.aggregate({
      _sum: { expenditure: true },
      where: {
        received: { not: null },
        createdUser: { in: ["Директор", "Власенкова"] },
        type: "Безнал",
        typeOfExpenditure: {
          notIn: [
            "Пополнение баланса",
            "Перевод с кредитного баланса безнал",
            "Новый кредит безнал",
            "Перевод с баланса нал",
          ],
        },
      },
    });
    const sumOfPVZ1Cashless = aggPVZ1Cashless._sum.expenditure ?? 0;

    // sumOfPVZ2Cashless: received задан, issuedUser = "Директор", "Директор (С)" или "Власенкова",
    //   type = "Безнал" и typeOfExpenditure не входит в ["Перевод с баланса нал", "Перевод с баланса безнал"]
    const aggPVZ2Cashless = await prisma.advanceReport.aggregate({
      _sum: { expenditure: true },
      where: {
        received: { not: null },
        issuedUser: { in: ["Директор", "Директор (С)", "Власенкова"] },
        type: "Безнал",
        typeOfExpenditure: {
          notIn: ["Перевод с баланса нал", "Перевод с баланса безнал"],
        },
      },
    });
    const sumOfPVZ2Cashless = aggPVZ2Cashless._sum.expenditure ?? 0;

    // sumOfPVZ3Cashless: createdUser = "Директор" или "Власенкова", issuedUser отсутствует, type = "Безнал" и
    //   typeOfExpenditure не входит в ["Перевод с баланса нал", "Кредитовый баланс безнал"]
    const aggPVZ3Cashless = await prisma.advanceReport.aggregate({
      _sum: { expenditure: true },
      where: {
        createdUser: { in: ["Директор", "Власенкова"] },
        issuedUser: null,
        type: "Безнал",
        typeOfExpenditure: {
          notIn: ["Перевод с баланса нал", "Кредитовый баланс безнал"],
        },
      },
    });
    const sumOfPVZ3Cashless = aggPVZ3Cashless._sum.expenditure ?? 0;

    // sumOfPVZ4Cashless: createdUser = "Директор" или "Власенкова", issuedUser = "Директор"/"Директор (С)"/"Власенкова",
    //   type = "Нал" и typeOfExpenditure === "Перевод с баланса безнал"
    // (Обратите внимание: в исходном коде имя переменной говорит о безналичных операциях, но фильтр остаётся таким же.)
    const aggPVZ4Cashless = await prisma.advanceReport.aggregate({
      _sum: { expenditure: true },
      where: {
        createdUser: { in: ["Директор", "Власенкова"] },
        issuedUser: { in: ["Директор", "Директор (С)", "Власенкова"] },
        type: "Нал",
        typeOfExpenditure: "Перевод с баланса безнал",
      },
    });
    const sumOfPVZ4Cashless = aggPVZ4Cashless._sum.expenditure ?? 0;

    // sumOfPVZ5Cashless: createdUser = "Директор" или "Власенкова", issuedUser = "Директор"/"Директор (С)"/"Власенкова",
    //   type = "Безнал" и typeOfExpenditure === "Перевод с баланса нал"
    const aggPVZ5Cashless = await prisma.advanceReport.aggregate({
      _sum: { expenditure: true },
      where: {
        createdUser: { in: ["Директор", "Власенкова"] },
        issuedUser: { in: ["Директор", "Директор (С)", "Власенкова"] },
        type: "Безнал",
        typeOfExpenditure: "Перевод с баланса нал",
      },
    });
    const sumOfPVZ5Cashless = aggPVZ5Cashless._sum.expenditure ?? 0;

    // 3. Из ourRansom – суммы по разным полям
    // 3.1 sumOfPVZ6: сумма поля priceRefund, если verified не null
    const aggOurRansom6 = await prisma.ourRansom.aggregate({
      _sum: { priceRefund: true },
      where: {
        verified: { not: null },
      },
    });
    const sumOfPVZ6 = aggOurRansom6._sum.priceRefund ?? 0;

    // 3.2 sumOfPVZ7: сумма priceSite, если additionally = "Отказ брак" или "Отказ подмена"
    const aggOurRansom7 = await prisma.ourRansom.aggregate({
      _sum: { priceSite: true },
      where: {
        additionally: { in: ["Отказ брак", "Отказ подмена"] },
      },
    });
    const sumOfPVZ7 = aggOurRansom7._sum.priceSite ?? 0;

    // 3.3 sumOfPVZ8: сумма priceSite, если additionally = "Отказ клиент наличные" или "Отказ клиент"
    const aggOurRansom8 = await prisma.ourRansom.aggregate({
      _sum: { priceSite: true },
      where: {
        additionally: { in: ["Отказ клиент наличные", "Отказ клиент"] },
      },
    });
    const sumOfPVZ8 = aggOurRansom8._sum.priceSite ?? 0;

    // 3.4 sumOfPVZ9: сумма priceSite, если additionally не входит в перечень отказов
    const aggOurRansom9 = await prisma.ourRansom.aggregate({
      _sum: { priceSite: true },
      where: {
        additionally: {
          notIn: [
            "Отказ клиент наличные",
            "Отказ клиент безнал",
            "Отказ клиент",
            "Отказ брак",
            "Отказ подмена",
          ],
        },
      },
    });
    const sumOfPVZ9 = aggOurRansom9._sum.priceSite ?? 0;

    // 3.5 sumOfPVZ10: сумма deliveredKGT, если additionally не входит в перечень отказов
    const aggOurRansom10 = await prisma.ourRansom.aggregate({
      _sum: { deliveredKGT: true },
      where: {
        additionally: {
          notIn: [
            "Отказ клиент наличные",
            "Отказ клиент",
            "Отказ брак",
            "Отказ подмена",
          ],
        },
      },
    });
    const sumOfPVZ10 = aggOurRansom10._sum.deliveredKGT ?? 0;

    const aggDelivery = await prisma.delivery.aggregate({
      _sum: { amountFromClient3: true },
      where: {
        paid: { not: null, gte: march312024 },
      },
    });
    const sumOfPVZ4 = aggDelivery._sum.amountFromClient3 ?? 0;

    let allSum = 0;
    let allSum2 = 0;

    allSum =
      sumOfPVZ -
      sumOfPVZ1 +
      sumOfPVZ2 -
      sumOfPVZ3 +
      sumOfPVZ4 +
      sumOfPVZ6 +
      sumOfPVZ7 +
      sumOfPVZ8 -
      sumOfPVZ9 +
      sumOfPVZ10 +
      sumOfPVZ11 -
      sumOfPVZ12 +
      sumOfPVZ13 -
      149000 +
      332531 +
      1477830;
    allSum2 =
      sumOfPVZ1Cashless +
      sumOfPVZ2Cashless -
      sumOfPVZ3Cashless -
      sumOfPVZ4Cashless +
      sumOfPVZ5Cashless;

    const allSumValue = allSum + allSum2 - 19008030;

    return { allSum, allSum2, allSumValue };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
});
