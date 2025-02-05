// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// // Утилита для безопасного преобразования (хотя агрегатные функции вернут числа)
// const toNum = (val: any) => Number(val) || 0;

// export default defineEventHandler(async (event) => {
//   try {
//     const startDate = new Date("2024-07-01T00:00:00Z");
//     const filterDate = new Date("2024-04-01");

//     // 1. Выгружаем данные ourRansom (если там слишком много строк, возможно, тоже можно агрегировать)
//     const ourRansomPromise = prisma.ourRansom.findMany({
//       select: {
//         verified: true,
//         priceRefund: true,
//         additionally: true,
//         priceSite: true,
//         deliveredKGT: true,
//       },
//       where: { created_at: { gt: startDate } },
//     });

//     // 2. Агрегирование по таблице balance – подсчитаем сумму для нужных записей
//     const balanceAggregatePromise = prisma.balance.aggregate({
//       _sum: { sum: true },
//       where: {
//         received: { not: null },
//         recipient: { in: ["Директор", "Власенкова"] },
//       },
//     });

//     // 3. Агрегирование по таблице delivery
//     const deliveryAggregatePromise = prisma.delivery.aggregate({
//       _sum: { amountFromClient3: true },
//       where: {
//         paid: { not: null, gte: filterDate },
//       },
//     });

//     // 4. Агрегирование по таблице balanceOnline
//     const balanceOnlineAggregatePromise = prisma.balanceOnline.aggregate({
//       _sum: { sum: true },
//     });

//     // 5. Пример агрегирующего запроса для advanceReport, вычисляющего, например, sumOfPVZ1:
//     const advanceSumOfPVZ1Promise = prisma.advanceReport.aggregate({
//       _sum: { expenditure: true },
//       where: {
//         received: { not: null },
//         createdUser: { in: ["Директор", "Власенкова"] },
//         type: "Нал",
//         typeOfExpenditure: {
//           notIn: [
//             "Пополнение баланса",
//             "Перевод с кредитного баланса нал",
//             "Новый кредит нал",
//             "Постоплата WB",
//             "Перевод с баланса безнал",
//           ],
//         },
//       },
//     });

//     // Аналогично можно добавить агрегирующие запросы для остальных сумм (sumOfPVZ2, sumOfPVZ3, sumOfPVZ13, и т.д.)
//     // Например:
//     const advanceSumOfPVZ2Promise = prisma.advanceReport.aggregate({
//       _sum: { expenditure: true },
//       where: {
//         received: { not: null },
//         issuedUser: { in: ["Директор", "Директор (С)", "Власенкова"] },
//         type: "Нал",
//         date: { gte: filterDate },
//         typeOfExpenditure: {
//           notIn: ["Перевод с баланса нал", "Перевод с баланса безнал"],
//         },
//       },
//     });

//     // Запускаем все запросы параллельно
//     const [
//       ourRansomRows,
//       balanceAggregate,
//       deliveryAggregate,
//       balanceOnlineAggregate,
//       advanceSumOfPVZ1,
//       advanceSumOfPVZ2,
//       // ...другие агрегаты по advanceReport
//     ] = await Promise.all([
//       ourRansomPromise,
//       balanceAggregatePromise,
//       deliveryAggregatePromise,
//       balanceOnlineAggregatePromise,
//       advanceSumOfPVZ1Promise,
//       advanceSumOfPVZ2Promise,
//       // ...другие агрегирующие запросы
//     ]);

//     // Если необходимо, можно ещё обработать данные из ourRansom, например:
//     const sumOfPVZ6 = ourRansomRows
//       .filter((row) => row.verified !== null)
//       .reduce((acc, row) => acc + toNum(row.priceRefund), 0);
//     const sumOfPVZ7 = ourRansomRows
//       .filter(
//         (row) =>
//           row.additionally === "Отказ брак" ||
//           row.additionally === "Отказ подмена"
//       )
//       .reduce((acc, row) => acc + toNum(row.priceSite), 0);
//     // Аналогично для sumOfPVZ8, sumOfPVZ9, sumOfPVZ10

//     // Пример получения агрегированных значений (если результат агрегирования может быть null, то используем toNum):
//     const sumOfPVZFromBalance = toNum(balanceAggregate._sum.sum);
//     const sumOfPVZFromDelivery = toNum(deliveryAggregate._sum.amountFromClient3);
//     const sumOfPVZFromBalanceOnline = toNum(balanceOnlineAggregate._sum.sum);
//     const sumOfPVZ1Advance = toNum(advanceSumOfPVZ1._sum.expenditure);
//     const sumOfPVZ2Advance = toNum(advanceSumOfPVZ2._sum.expenditure);
//     // Аналогично получаем остальные суммы из advanceReport

//     // Собираем итоговые расчёты по аналогии с вашей логикой:
//     const allSum =
//       sumOfPVZFromBalance -
//       sumOfPVZ1Advance +
//       sumOfPVZ2Advance -
//       /* ... другие вычисления, в том числе с суммами из ourRansom и агрегатов advanceReport ... */
//       0;
//     // Пример расчёта для allSum2, если требуются агрегаты по безналичным операциям:
//     const allSum2 =
//       /* сумма, полученная агрегированием для безналичных операций */ 0;

//     const allSumValue = allSum + allSum2 - 19008030;

//     return { allSum, allSum2, allSumValue };
//   } catch (error) {
//     console.error(error instanceof Error ? error.message : error);
//     return { error: error instanceof Error ? error.message : error };
//   }
// });

// // import { PrismaClient } from "@prisma/client";
// // const prisma = new PrismaClient();

// // export default defineEventHandler(async (event) => {
// //   try {
// //     const startDate = new Date("2024-07-01T00:00:00Z");

// //     let copyArrayOurRansom;
// //     let ourRansomRows;
// //     ourRansomRows = await prisma.ourRansom.findMany({
// //       select: {
// //         verified: true,
// //         priceRefund: true,
// //         additionally: true,
// //         priceSite: true,
// //         deliveredKGT: true,
// //         issued: true,
// //         dispatchPVZ: true,
// //         amountFromClient1: true,
// //         prepayment: true,
// //         percentClient: true,
// //         profit1: true,
// //         deleted: true,
// //       },
// //       where: {
// //         created_at: {
// //           gt: startDate,
// //         },
// //       },
// //     });

// //     let rows;
// //     rows = await prisma.advanceReport.findMany();

// //     let rowsBalance;
// //     rowsBalance = await prisma.balance.findMany();

// //     let rowsDelivery;
// //     rowsDelivery = await prisma.delivery.findMany({
// //       select: {
// //         nameOfAction: true,
// //         paid: true,
// //         dispatchPVZ: true,
// //         amountFromClient3: true,
// //         orderPVZ: true,
// //       },
// //       where: {
// //         paid: {
// //           not: null,
// //         },
// //       },
// //     });

// //     let rowsBalanceOnline;
// //     rowsBalanceOnline = await prisma.balanceOnline.findMany();

// //     copyArrayOurRansom = ourRansomRows.filter(
// //       (row) =>
// //         row.issued !== null &&
// //         (row.additionally === "Оплата наличными" ||
// //           row.additionally === "Отказ клиент наличные" ||
// //           row.additionally === "Отказ клиент")
// //     );

// //     let sumOfPVZ = rowsBalance
// //       .filter(
// //         (row) =>
// //           row.received !== null &&
// //           (row.recipient === "Директор" || row.recipient === "Власенкова")
// //       )
// //       .reduce((acc, value) => acc + +value.sum, 0);

// //     let sumOfPVZ1 = rows
// //       ?.filter(
// //         (row) =>
// //           row.received !== null &&
// //           (row.createdUser === "Директор" ||
// //             row.createdUser === "Власенкова") &&
// //           row.typeOfExpenditure !== "Пополнение баланса" &&
// //           row.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
// //           row.typeOfExpenditure !== "Новый кредит нал" &&
// //           row.typeOfExpenditure !== "Постоплата WB" &&
// //           row.typeOfExpenditure !== "Перевод с баланса безнал" &&
// //           row.type === "Нал"
// //       )
// //       .reduce((acc, value) => acc + +value.expenditure, 0);

// //     const march312024 = new Date("2024-04-01");

// //     let sumOfPVZ2 = rows
// //       ?.filter(
// //         (row) =>
// //           row.received !== null &&
// //           (row.issuedUser === "Директор" ||
// //             row.issuedUser === "Директор (С)" ||
// //             row.issuedUser === "Власенкова") &&
// //           row.typeOfExpenditure !== "Перевод с баланса нал" &&
// //           row.typeOfExpenditure !== "Перевод с баланса безнал" &&
// //           row.type === "Нал" &&
// //           row.date &&
// //           new Date(row.date) >= march312024
// //       )
// //       .reduce((acc, value) => acc + +value.expenditure, 0);

// //     let sumOfPVZ3 = rows
// //       ?.filter(
// //         (row) =>
// //           (row.createdUser === "Директор" ||
// //             row.createdUser === "Власенкова") &&
// //           !row.issuedUser &&
// //           row.type === "Нал" &&
// //           row.typeOfExpenditure !== "Кредитовый баланс нал" &&
// //           row.typeOfExpenditure !== "Перевод с баланса безнал" &&
// //           row.typeOfExpenditure !== "Удержания с сотрудников"
// //       )
// //       .reduce((acc, value) => acc + +value.expenditure, 0);

// //     let sumOfPVZ13 = rows
// //       ?.filter(
// //         (row) =>
// //           row.type === "Нал" &&
// //           row.typeOfExpenditure === "Удержания с сотрудников"
// //       )
// //       .reduce((acc, value) => acc + +value.expenditure, 0);

// //     let sumOfPVZ4 = rowsDelivery
// //       ?.filter(
// //         (row) =>
// //           row.paid !== null && row.paid && new Date(row.paid) >= march312024
// //       )
// //       .reduce((acc, value) => acc + +value.amountFromClient3, 0);

// //     let sumOfPVZ5 = rowsBalanceOnline.reduce(
// //       (acc, value) => acc + +value.sum,
// //       0
// //     );

// //     let sumOfPVZ6 = ourRansomRows
// //       ?.filter((row) => row.verified !== null)
// //       .reduce((acc, value) => acc + +value.priceRefund, 0);

// //     let sumOfPVZ7 = ourRansomRows
// //       ?.filter(
// //         (row) =>
// //           row.additionally === "Отказ брак" ||
// //           row.additionally === "Отказ подмена"
// //       )
// //       .reduce((acc, value) => acc + +value.priceSite, 0);

// //     let sumOfPVZ8 = ourRansomRows
// //       ?.filter(
// //         (row) =>
// //           row.additionally === "Отказ клиент наличные" ||
// //           row.additionally === "Отказ клиент"
// //       )
// //       .reduce((acc, value) => acc + +value.priceSite, 0);

// //     let sumOfPVZ9 = ourRansomRows
// //       ?.filter(
// //         (row) =>
// //           row.additionally !== "Отказ клиент наличные" &&
// //           row.additionally !== "Отказ клиент безнал" &&
// //           row.additionally !== "Отказ клиент" &&
// //           row.additionally !== "Отказ брак" &&
// //           row.additionally !== "Отказ подмена"
// //       )
// //       .reduce((acc, value) => acc + +value.priceSite, 0);

// //     let sumOfPVZ10 = ourRansomRows
// //       ?.filter(
// //         (row) =>
// //           row.additionally !== "Отказ клиент наличные" &&
// //           row.additionally !== "Отказ клиент" &&
// //           row.additionally !== "Отказ брак" &&
// //           row.additionally !== "Отказ подмена"
// //       )
// //       .reduce((acc, value) => acc + +value.deliveredKGT, 0);

// //     let sumOfPVZ11 = rows
// //       ?.filter(
// //         (row) =>
// //           ((row.createdUser === "Директор" && row.issuedUser === "Директор") ||
// //             (row.createdUser === "Власенкова" &&
// //               row.issuedUser === "Власенкова")) &&
// //           row.type === "Нал" &&
// //           row.typeOfExpenditure === "Перевод с баланса безнал"
// //       )
// //       .reduce((acc, value) => acc + +value.expenditure, 0);

// //     let sumOfPVZ12 = rows
// //       ?.filter(
// //         (row) =>
// //           ((row.createdUser === "Директор" && row.issuedUser === "Директор") ||
// //             (row.createdUser === "Власенкова" &&
// //               row.issuedUser === "Власенкова")) &&
// //           row.type === "Безнал" &&
// //           row.typeOfExpenditure === "Перевод с баланса нал"
// //       )
// //       .reduce((acc, value) => acc + +value.expenditure, 0);

// //     let sumOfPVZ1Cashless = rows
// //       ?.filter(
// //         (row) =>
// //           row.received !== null &&
// //           (row.createdUser === "Директор" ||
// //             row.createdUser === "Власенкова") &&
// //           row.typeOfExpenditure !== "Пополнение баланса" &&
// //           row.typeOfExpenditure !== "Перевод с кредитного баланса безнал" &&
// //           row.typeOfExpenditure !== "Новый кредит безнал" &&
// //           row.typeOfExpenditure !== "Перевод с баланса нал" &&
// //           row.type === "Безнал"
// //       )
// //       .reduce((acc, value) => acc + +value.expenditure, 0);

// //     let sumOfPVZ2Cashless = rows
// //       ?.filter(
// //         (row) =>
// //           row.received !== null &&
// //           (row.issuedUser === "Директор" ||
// //             row.issuedUser === "Директор (С)" ||
// //             row.issuedUser === "Власенкова") &&
// //           row.typeOfExpenditure !== "Перевод с баланса нал" &&
// //           row.typeOfExpenditure !== "Перевод с баланса безнал" &&
// //           row.type === "Безнал"
// //       )
// //       .reduce((acc, value) => acc + +value.expenditure, 0);

// //     let sumOfPVZ3Cashless = rows
// //       ?.filter(
// //         (row) =>
// //           (row.createdUser === "Директор" ||
// //             row.createdUser === "Власенкова") &&
// //           !row.issuedUser &&
// //           row.type === "Безнал" &&
// //           row.typeOfExpenditure !== "Перевод с баланса нал" &&
// //           row.typeOfExpenditure !== "Кредитовый баланс безнал"
// //       )
// //       .reduce((acc, value) => acc + +value.expenditure, 0);

// //     let sumOfPVZ4Cashless = rows
// //       ?.filter(
// //         (row) =>
// //           (row.createdUser === "Директор" ||
// //             row.createdUser === "Власенкова") &&
// //           (row.issuedUser === "Директор" ||
// //             row.issuedUser === "Директор (С)" ||
// //             row.issuedUser === "Власенкова") &&
// //           row.type === "Нал" &&
// //           row.typeOfExpenditure === "Перевод с баланса безнал"
// //       )
// //       .reduce((acc, value) => acc + +value.expenditure, 0);

// //     let sumOfPVZ5Cashless = rows
// //       ?.filter(
// //         (row) =>
// //           (row.createdUser === "Директор" ||
// //             row.createdUser === "Власенкова") &&
// //           (row.issuedUser === "Директор" ||
// //             row.issuedUser === "Директор (С)" ||
// //             row.issuedUser === "Власенкова") &&
// //           row.type === "Безнал" &&
// //           row.typeOfExpenditure === "Перевод с баланса нал"
// //       )
// //       .reduce((acc, value) => acc + +value.expenditure, 0);

// //     sumOfPVZ = sumOfPVZ === undefined ? 0 : sumOfPVZ;
// //     sumOfPVZ1 = sumOfPVZ1 === undefined ? 0 : sumOfPVZ1;
// //     sumOfPVZ2 = sumOfPVZ2 === undefined ? 0 : sumOfPVZ2;
// //     sumOfPVZ3 = sumOfPVZ3 === undefined ? 0 : sumOfPVZ3;
// //     sumOfPVZ4 = sumOfPVZ4 === undefined ? 0 : sumOfPVZ4;
// //     sumOfPVZ5 = sumOfPVZ5 === undefined ? 0 : sumOfPVZ5;
// //     sumOfPVZ6 = sumOfPVZ6 === undefined ? 0 : sumOfPVZ6;
// //     sumOfPVZ7 = sumOfPVZ7 === undefined ? 0 : sumOfPVZ7;
// //     sumOfPVZ8 = sumOfPVZ8 === undefined ? 0 : sumOfPVZ8;
// //     sumOfPVZ9 = sumOfPVZ9 === undefined ? 0 : sumOfPVZ9;
// //     sumOfPVZ10 = sumOfPVZ10 === undefined ? 0 : sumOfPVZ10;
// //     sumOfPVZ11 = sumOfPVZ11 === undefined ? 0 : sumOfPVZ11;
// //     sumOfPVZ12 = sumOfPVZ12 === undefined ? 0 : sumOfPVZ12;
// //     sumOfPVZ13 = sumOfPVZ13 === undefined ? 0 : sumOfPVZ13;
// //     sumOfPVZ1Cashless = sumOfPVZ1Cashless === undefined ? 0 : sumOfPVZ1Cashless;
// //     sumOfPVZ2Cashless = sumOfPVZ2Cashless === undefined ? 0 : sumOfPVZ2Cashless;
// //     sumOfPVZ3Cashless = sumOfPVZ3Cashless === undefined ? 0 : sumOfPVZ3Cashless;
// //     sumOfPVZ4Cashless = sumOfPVZ4Cashless === undefined ? 0 : sumOfPVZ4Cashless;
// //     sumOfPVZ5Cashless = sumOfPVZ5Cashless === undefined ? 0 : sumOfPVZ5Cashless;
// //     let allSum;
// //     let allSum2;
// //     let allSumValue;
// //     allSum =
// //       sumOfPVZ -
// //       sumOfPVZ1 +
// //       sumOfPVZ2 -
// //       sumOfPVZ3 +
// //       sumOfPVZ4 +
// //       sumOfPVZ6 +
// //       sumOfPVZ7 +
// //       sumOfPVZ8 -
// //       sumOfPVZ9 +
// //       sumOfPVZ10 +
// //       sumOfPVZ11 -
// //       sumOfPVZ12 -
// //       149000 +
// //       sumOfPVZ1 +
// //       sumOfPVZ13 +
// //       332531 +
// //       1477830;

// //     allSum2 =
// //       +sumOfPVZ1Cashless +
// //       +sumOfPVZ2Cashless -
// //       +sumOfPVZ3Cashless -
// //       +sumOfPVZ4Cashless +
// //       +sumOfPVZ5Cashless;

// //     allSumValue = allSum + allSum2 - 19008030;
// //     return { allSum, allSum2, allSumValue };
// //   } catch (error) {
// //     if (error instanceof Error) {
// //       console.error(error.message);
// //       return { error: error.message };
// //     }
// //   }
// // });


import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Задаём даты для фильтрации
    const startDate = new Date("2024-07-01T00:00:00Z");
    const filterDate = new Date("2024-04-01");

    // Выполняем все запросы параллельно
    const [
      ourRansomRows,
      advanceReportRows,
      balanceRows,
      deliveryRows,
      balanceOnlineRows,
    ] = await Promise.all([
      prisma.ourRansom.findMany({
        select: {
          verified: true,
          priceRefund: true,
          additionally: true,
          priceSite: true,
          deliveredKGT: true,
          issued: true,
          dispatchPVZ: true,
          amountFromClient1: true,
          prepayment: true,
          percentClient: true,
          profit1: true,
          deleted: true,
        },
        where: { created_at: { gt: startDate } },
      }),
      prisma.advanceReport.findMany(),
      prisma.balance.findMany(),
      prisma.delivery.findMany({
        select: {
          nameOfAction: true,
          paid: true,
          dispatchPVZ: true,
          amountFromClient3: true,
          orderPVZ: true,
        },
        where: { paid: { not: null } },
      }),
      prisma.balanceOnline.findMany(),
    ]);

    // Утилитарная функция для безопасного преобразования в число
    const toNum = (val: any) => Number(val) || 0;

    // Расчёт суммы из таблицы balance
    const sumOfPVZ = balanceRows
      .filter(
        (row) =>
          row.received !== null &&
          (row.recipient === "Директор" || row.recipient === "Власенкова")
      )
      .reduce((acc, row) => acc + toNum(row.sum), 0);

    // Расчёт сумм из таблицы advanceReport за один проход
    let sumOfPVZ1 = 0;
    let sumOfPVZ2 = 0;
    let sumOfPVZ3 = 0;
    let sumOfPVZ13 = 0;
    let sumOfPVZ11 = 0;
    let sumOfPVZ12 = 0;
    let sumOfPVZ1Cashless = 0;
    let sumOfPVZ2Cashless = 0;
    let sumOfPVZ3Cashless = 0;
    let sumOfPVZ4Cashless = 0;
    let sumOfPVZ5Cashless = 0;

    for (const row of advanceReportRows) {
      const exp = toNum(row.expenditure);
      const receivedNotNull = row.received !== null;
      const rowDate = row.date ? new Date(row.date) : null;

      // Наличными (type === "Нал")
      if (
        receivedNotNull &&
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        row.typeOfExpenditure !== "Пополнение баланса" &&
        row.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
        row.typeOfExpenditure !== "Новый кредит нал" &&
        row.typeOfExpenditure !== "Постоплата WB" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал" &&
        row.type === "Нал"
      ) {
        sumOfPVZ1 += exp;
      }
      if (
        receivedNotNull &&
        (row.issuedUser === "Директор" ||
          row.issuedUser === "Директор (С)" ||
          row.issuedUser === "Власенкова") &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал" &&
        row.type === "Нал" &&
        rowDate &&
        rowDate >= filterDate
      ) {
        sumOfPVZ2 += exp;
      }
      if (
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        !row.issuedUser &&
        row.type === "Нал" &&
        row.typeOfExpenditure !== "Кредитовый баланс нал" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал" &&
        row.typeOfExpenditure !== "Удержания с сотрудников"
      ) {
        sumOfPVZ3 += exp;
      }
      if (row.type === "Нал" && row.typeOfExpenditure === "Удержания с сотрудников") {
        sumOfPVZ13 += exp;
      }
      if (
        ((row.createdUser === "Директор" && row.issuedUser === "Директор") ||
          (row.createdUser === "Власенкова" && row.issuedUser === "Власенкова")) &&
        row.type === "Нал" &&
        row.typeOfExpenditure === "Перевод с баланса безнал"
      ) {
        sumOfPVZ11 += exp;
      }
      if (
        ((row.createdUser === "Директор" && row.issuedUser === "Директор") ||
          (row.createdUser === "Власенкова" && row.issuedUser === "Власенкова")) &&
        row.type === "Безнал" &&
        row.typeOfExpenditure === "Перевод с баланса нал"
      ) {
        sumOfPVZ12 += exp;
      }

      // Безналичные (type === "Безнал")
      if (
        receivedNotNull &&
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        row.typeOfExpenditure !== "Пополнение баланса" &&
        row.typeOfExpenditure !== "Перевод с кредитного баланса безнал" &&
        row.typeOfExpenditure !== "Новый кредит безнал" &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.type === "Безнал"
      ) {
        sumOfPVZ1Cashless += exp;
      }
      if (
        receivedNotNull &&
        (row.issuedUser === "Директор" ||
          row.issuedUser === "Директор (С)" ||
          row.issuedUser === "Власенкова") &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал" &&
        row.type === "Безнал"
      ) {
        sumOfPVZ2Cashless += exp;
      }
      if (
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        !row.issuedUser &&
        row.type === "Безнал" &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.typeOfExpenditure !== "Кредитовый баланс безнал"
      ) {
        sumOfPVZ3Cashless += exp;
      }
      if (
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        (row.issuedUser === "Директор" ||
          row.issuedUser === "Директор (С)" ||
          row.issuedUser === "Власенкова") &&
        row.type === "Нал" &&
        row.typeOfExpenditure === "Перевод с баланса безнал"
      ) {
        sumOfPVZ4Cashless += exp;
      }
      if (
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        (row.issuedUser === "Директор" ||
          row.issuedUser === "Директор (С)" ||
          row.issuedUser === "Власенкова") &&
        row.type === "Безнал" &&
        row.typeOfExpenditure === "Перевод с баланса нал"
      ) {
        sumOfPVZ5Cashless += exp;
      }
    }

    // Расчёт суммы из таблицы delivery
    const sumOfPVZ4 = deliveryRows
      .filter((row) => row.paid && new Date(row.paid) >= filterDate)
      .reduce((acc, row) => acc + toNum(row.amountFromClient3), 0);

    // Расчёт суммы из таблицы balanceOnline
    const sumOfPVZ5 = balanceOnlineRows.reduce(
      (acc, row) => acc + toNum(row.sum),
      0
    );

    // Вычисления по данным из ourRansom
    const sumOfPVZ6 = ourRansomRows
      .filter((row) => row.verified !== null)
      .reduce((acc, row) => acc + toNum(row.priceRefund), 0);
    const sumOfPVZ7 = ourRansomRows
      .filter(
        (row) =>
          row.additionally === "Отказ брак" ||
          row.additionally === "Отказ подмена"
      )
      .reduce((acc, row) => acc + toNum(row.priceSite), 0);
    const sumOfPVZ8 = ourRansomRows
      .filter(
        (row) =>
          row.additionally === "Отказ клиент наличные" ||
          row.additionally === "Отказ клиент"
      )
      .reduce((acc, row) => acc + toNum(row.priceSite), 0);
    const sumOfPVZ9 = ourRansomRows
      .filter(
        (row) =>
          row.additionally !== "Отказ клиент наличные" &&
          row.additionally !== "Отказ клиент безнал" &&
          row.additionally !== "Отказ клиент" &&
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена"
      )
      .reduce((acc, row) => acc + toNum(row.priceSite), 0);
    const sumOfPVZ10 = ourRansomRows
      .filter(
        (row) =>
          row.additionally !== "Отказ клиент наличные" &&
          row.additionally !== "Отказ клиент" &&
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена"
      )
      .reduce((acc, row) => acc + toNum(row.deliveredKGT), 0);

    // Итоговые расчёты (с сохранением логики исходного кода)
    const allSum =
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
      sumOfPVZ12 -
      149000 +
      sumOfPVZ1 +
      sumOfPVZ13 +
      332531 +
      1477830;

    const allSum2 =
      sumOfPVZ1Cashless +
      sumOfPVZ2Cashless -
      sumOfPVZ3Cashless -
      sumOfPVZ4Cashless +
      sumOfPVZ5Cashless;

    const allSumValue = allSum + allSum2 - 19008030;

    return { allSum, allSum2, allSumValue };
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return { error: error instanceof Error ? error.message : error };
  }
});
