import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const startDate = new Date("2024-07-01T00:00:00Z");
    const march312024 = new Date("2024-04-01");

    // Выполняем параллельно все агрегатные запросы
    const [
      // Таблица balance → sumOfPVZ
      balanceAgg,
      // advanceReport
      advReportAgg1, // sumOfPVZ1: received != null, createdUser in [...] и type "Нал", исключая некоторые expenditure
      advReportAgg2, // sumOfPVZ2: received != null, issuedUser in [...] и type "Нал", date >= march312024
      advReportAgg3, // sumOfPVZ3: createdUser in [...] и issuedUser == null, type "Нал", исключая некоторые expenditure
      advReportAgg13, // sumOfPVZ13: type "Нал", typeOfExpenditure === "Удержания с сотрудников"
      // Таблица delivery → sumOfPVZ4
      deliveryAgg,
      // Таблица balanceOnlie → sumOfPVZ5
      balanceOnlineAgg,
      // Таблица ourRansom
      ourRansomAgg6, // sumOfPVZ6: verified != null, сумма priceRefund
      ourRansomAgg7, // sumOfPVZ7: additionally in ["Отказ брак", "Отказ подмена"], сумма priceSite
      ourRansomAgg8, // sumOfPVZ8: additionally in ["Отказ клиент наличные", "Отказ клиент"], сумма priceSite
      ourRansomAgg9, // sumOfPVZ9: additionally не входит в [...] (отказы), сумма priceSite
      ourRansomAgg10, // sumOfPVZ10: additionally не входит в [...] (отказы), сумма deliveredKGT
      // Ещё агрегаты из advanceReport
      advReportAgg11, // sumOfPVZ11: (createdUser и issuedUser совпадают: "Директор" или "Власенкова"), type "Нал", typeOfExpenditure === "Перевод с баланса безнал"
      advReportAgg12, // sumOfPVZ12: аналогично, но type "Безнал", typeOfExpenditure === "Перевод с баланса нал"
      advReportAgg1Cashless, // sumOfPVZ1Cashless: received != null, createdUser in [...] и type "Безнал", исключая некоторые expenditure
      advReportAgg2Cashless, // sumOfPVZ2Cashless: received != null, issuedUser in [...] и type "Безнал", исключая определённые expenditure
      advReportAgg3Cashless, // sumOfPVZ3Cashless: createdUser in [...] и issuedUser == null, type "Безнал", исключая некоторые expenditure
      advReportAgg4Cashless, // sumOfPVZ4Cashless: createdUser in [...] и issuedUser in [...] , type "Нал", typeOfExpenditure === "Перевод с баланса безнал"
      advReportAgg5Cashless, // sumOfPVZ5Cashless: createdUser in [...] и issuedUser in [...] , type "Безнал", typeOfExpenditure === "Перевод с баланса нал"
    ] = await Promise.all([
      // balance
      prisma.balance.aggregate({
        _sum: { sum: true },
        where: {
          received: { not: null },
          recipient: { in: ["Директор", "Власенкова"] },
        },
      }),
      // advanceReport – sumOfPVZ1
      prisma.advanceReport.aggregate({
        _sum: { expenditure: true },
        where: {
          received: { not: null },
          createdUser: { in: ["Директор", "Власенкова"] },
          typeOfExpenditure: {
            notIn: [
              "Пополнение баланса",
              "Перевод с кредитного баланса нал",
              "Новый кредит нал",
              "Постоплата WB",
              "Перевод с баланса безнал",
            ],
          },
          type: "Нал",
        },
      }),
      // advanceReport – sumOfPVZ2
      prisma.advanceReport.aggregate({
        _sum: { expenditure: true },
        where: {
          received: { not: null },
          issuedUser: { in: ["Директор", "Директор (С)", "Власенкова"] },
          typeOfExpenditure: {
            notIn: ["Перевод с баланса нал", "Перевод с баланса безнал"],
          },
          type: "Нал",
          date: { gte: march312024 },
        },
      }),
      // advanceReport – sumOfPVZ3
      prisma.advanceReport.aggregate({
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
      }),
      // advanceReport – sumOfPVZ13
      prisma.advanceReport.aggregate({
        _sum: { expenditure: true },
        where: {
          type: "Нал",
          typeOfExpenditure: "Удержания с сотрудников",
        },
      }),
      // delivery – sumOfPVZ4
      prisma.delivery.aggregate({
        _sum: { amountFromClient3: true },
        where: {
          paid: { not: null, gte: march312024 },
        },
      }),
      // balanceOnlie – sumOfPVZ5
      prisma.balanceOnline.aggregate({
        _sum: { sum: true },
      }),
      // ourRansom – sumOfPVZ6
      prisma.ourRansom.aggregate({
        _sum: { priceRefund: true },
        where: { verified: { not: null }, created_at: { gt: startDate } },
      }),
      // ourRansom – sumOfPVZ7
      prisma.ourRansom.aggregate({
        _sum: { priceSite: true },
        where: { additionally: { in: ["Отказ брак", "Отказ подмена"] } },
      }),
      // ourRansom – sumOfPVZ8
      prisma.ourRansom.aggregate({
        _sum: { priceSite: true },
        where: {
          additionally: { in: ["Отказ клиент наличные", "Отказ клиент"] },
          created_at: { gt: startDate },
        },
      }),
      // ourRansom – sumOfPVZ9
      prisma.ourRansom.aggregate({
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
          created_at: { gt: startDate },
        },
      }),
      // ourRansom – sumOfPVZ10
      prisma.ourRansom.aggregate({
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
          created_at: { gt: startDate },
        },
      }),
      // advanceReport – sumOfPVZ11
      prisma.advanceReport.aggregate({
        _sum: { expenditure: true },
        where: {
          OR: [
            { createdUser: "Директор", issuedUser: "Директор" },
            { createdUser: "Власенкова", issuedUser: "Власенкова" },
          ],
          type: "Нал",
          typeOfExpenditure: "Перевод с баланса безнал",
        },
      }),
      // advanceReport – sumOfPVZ12
      prisma.advanceReport.aggregate({
        _sum: { expenditure: true },
        where: {
          OR: [
            { createdUser: "Директор", issuedUser: "Директор" },
            { createdUser: "Власенкова", issuedUser: "Власенкова" },
          ],
          type: "Безнал",
          typeOfExpenditure: "Перевод с баланса нал",
        },
      }),
      // advanceReport – sumOfPVZ1Cashless
      prisma.advanceReport.aggregate({
        _sum: { expenditure: true },
        where: {
          received: { not: null },
          createdUser: { in: ["Директор", "Власенкова"] },
          typeOfExpenditure: {
            notIn: [
              "Пополнение баланса",
              "Перевод с кредитного баланса безнал",
              "Новый кредит безнал",
              "Перевод с баланса нал",
            ],
          },
          type: "Безнал",
        },
      }),
      // advanceReport – sumOfPVZ2Cashless
      prisma.advanceReport.aggregate({
        _sum: { expenditure: true },
        where: {
          received: { not: null },
          issuedUser: { in: ["Директор", "Директор (С)", "Власенкова"] },
          typeOfExpenditure: {
            notIn: ["Перевод с баланса нал", "Перевод с баланса безнал"],
          },
          type: "Безнал",
        },
      }),
      // advanceReport – sumOfPVZ3Cashless
      prisma.advanceReport.aggregate({
        _sum: { expenditure: true },
        where: {
          createdUser: { in: ["Директор", "Власенкова"] },
          issuedUser: null,
          type: "Безнал",
          typeOfExpenditure: {
            notIn: ["Перевод с баланса нал", "Кредитовый баланс безнал"],
          },
        },
      }),
      // advanceReport – sumOfPVZ4Cashless
      prisma.advanceReport.aggregate({
        _sum: { expenditure: true },
        where: {
          createdUser: { in: ["Директор", "Власенкова"] },
          issuedUser: { in: ["Директор", "Директор (С)", "Власенкова"] },
          type: "Нал",
          typeOfExpenditure: "Перевод с баланса безнал",
        },
      }),
      // advanceReport – sumOfPVZ5Cashless
      prisma.advanceReport.aggregate({
        _sum: { expenditure: true },
        where: {
          createdUser: { in: ["Директор", "Власенкова"] },
          issuedUser: { in: ["Директор", "Директор (С)", "Власенкова"] },
          type: "Безнал",
          typeOfExpenditure: "Перевод с баланса нал",
        },
      }),
    ]);

    // Извлекаем суммы, подставляя 0, если агрегат вернул null
    const sumOfPVZ = balanceAgg._sum.sum || 0;
    const sumOfPVZ1 = advReportAgg1._sum.expenditure || 0;
    const sumOfPVZ2 = advReportAgg2._sum.expenditure || 0;
    const sumOfPVZ3 = advReportAgg3._sum.expenditure || 0;
    const sumOfPVZ13 = advReportAgg13._sum.expenditure || 0;
    const sumOfPVZ4 = deliveryAgg._sum.amountFromClient3 || 0;
    const sumOfPVZ5 = balanceOnlineAgg._sum.sum || 0;
    const sumOfPVZ6 = ourRansomAgg6._sum.priceRefund || 0;
    const sumOfPVZ7 = ourRansomAgg7._sum.priceSite || 0;
    const sumOfPVZ8 = ourRansomAgg8._sum.priceSite || 0;
    const sumOfPVZ9 = ourRansomAgg9._sum.priceSite || 0;
    const sumOfPVZ10 = ourRansomAgg10._sum.deliveredKGT || 0;
    const sumOfPVZ11 = advReportAgg11._sum.expenditure || 0;
    const sumOfPVZ12 = advReportAgg12._sum.expenditure || 0;
    const sumOfPVZ1Cashless = advReportAgg1Cashless._sum.expenditure || 0;
    const sumOfPVZ2Cashless = advReportAgg2Cashless._sum.expenditure || 0;
    const sumOfPVZ3Cashless = advReportAgg3Cashless._sum.expenditure || 0;
    const sumOfPVZ4Cashless = advReportAgg4Cashless._sum.expenditure || 0;
    const sumOfPVZ5Cashless = advReportAgg5Cashless._sum.expenditure || 0;

    let allSum, allSum2;
    // Если пользователь "Директор" или "Власенкова" – используем полную формулу:
    allSum =
      sumOfPVZ +
      sumOfPVZ2 -
      sumOfPVZ3 +
      sumOfPVZ4 +
      sumOfPVZ6 +
      sumOfPVZ7 +
      sumOfPVZ8 -
      sumOfPVZ9 +
      sumOfPVZ10 +
      sumOfPVZ11 -
      sumOfPVZ12 -
      149000 +
      sumOfPVZ13 +
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
