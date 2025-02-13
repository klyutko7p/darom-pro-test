<script setup lang="ts">
import Cookies from "js-cookie";
const toast = useToast();
const storeUsers = useUsersStore();
const storeAdvanceReports = useAdvanceReports();
const storeBalance = useBalanceStore();
const storeRansom = useRansomStore();
const router = useRouter();

let user = ref({} as User);
let rows = ref<Array<IAdvanceReport>>([]);
let originallyRows = ref<Array<IAdvanceReport>>([]);
let rowsBalance = ref<Array<IBalance>>([]);
let rowsBalanceOnline = ref<Array<IBalanceOnline>>([]);
let rowsOurRansom = ref<Array<IOurRansom>>([]);
const token = Cookies.get("token");
let isLoading = ref(false);
let rowsDelivery = ref<Array<IDelivery>>([]);

const uniqueNotation = ref<Array<string>>([]);
const uniqueCreatedUser = ref<Array<string>>([]);
const uniqueExpenditure = ref<Array<string>>([]);

const storePVZ = usePVZStore();
onMounted(async () => {
  // Если нет токена — переходим на страницу логина и выходим
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;

  try {
    // Получаем данные пользователя
    user.value = await storeUsers.getUser();

    pvz.value = await storePVZ.getPVZ();

    // Формируем список промисов для параллельного выполнения запросов
    const promises = [];

    // Всегда запрашиваем отчёты
    const advancedReportsPromise = storeAdvanceReports.getAdvancedReports(
      user.value
    );
    promises.push(advancedReportsPromise);

    // Если роль ADMIN, добавляем дополнительные запросы
    if (user.value.role === "ADMIN") {
      promises.push(
        storeRansom.getRansomRowsForAdvanceReportOurRansomPartOne(),
        storeRansom.getRansomRowsForAdvanceReportOurRansomPartTwo(),
        storeRansom.getRansomRowsForAdvanceReportOurRansomPartThree(),
        storeRansom.getRansomRowsForAdvanceReportOurRansomPartFour(),
        storeRansom.getRansomRowsForBalanceDelivery()
      );
    }

    usersOfIssued.value = await storeUsers.getUsers();
    usersOfIssued.value = usersOfIssued.value.filter(
      (user) =>
        (user.role === "ADMIN" || user.role === "ADMINISTRATOR") &&
        user.username !== "admin_160421"
    );

    // Запросы для баланса (общие для всех)
    promises.push(
      storeBalance.getBalanceRows(),
      storeBalance.getBalanceOnlineRows()
    );

    // Ждём выполнения всех запросов
    const results = await Promise.all(promises);

    // Если роль ADMIN, структура результатов следующая:
    // 0 – advancedReportsData
    // 1-4 – наши Ransom rows (части 1–4)
    // 5   – данные доставки (deliveryRowsData)
    // 6   – balanceRowsData
    // 7   – onlineBalanceRowsData
    // Если НЕ ADMIN, то:
    // 0 – advancedReportsData
    // 1 – balanceRowsData
    // 2 – onlineBalanceRowsData
    let advancedReportsData,
      balanceRowsData,
      onlineBalanceRowsData,
      ourRansomRowsData,
      deliveryRowsData;
    if (user.value.role === "ADMIN") {
      advancedReportsData = results[0];
      // Получаем 4 части массива и объединяем их в один
      const ourRansomRowsParts = results.slice(1, 5);
      ourRansomRowsData = ourRansomRowsParts.flat();
      deliveryRowsData = results[5];
      balanceRowsData = results[6];
      onlineBalanceRowsData = results[7];
    } else {
      advancedReportsData = results[0];
      balanceRowsData = results[1];
      onlineBalanceRowsData = results[2];
    }

    // Присваиваем полученные данные
    rows.value = advancedReportsData;
    originallyRows.value = advancedReportsData;
    selectedUser.value = user.value.username;

    if (user.value.role === "ADMIN") {
      rowsOurRansom.value = ourRansomRowsData;
      rowsDelivery.value = deliveryRowsData;
      getAllSumDirector();
    }

    // Определяем диапазон дат для фильтрации
    const now = new Date();
    const filterParams =
      rows.value &&
      (user.value.username === "Директор" ||
        user.value.username === "Власенкова")
        ? {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          }
        : {
            start: new Date(now.getFullYear() - 1, 0, 1),
            end: now,
          };
    handleFilteredRows([rows.value, filterParams]);

    // Присваиваем данные баланса
    rowsBalance.value = balanceRowsData;
    rowsBalanceOnline.value = onlineBalanceRowsData;

    // Получаем уникальные значения сразу по всем трём полям
    const [notation, createdUser, expenditure] = await Promise.all([
      storeAdvanceReports.getUniqueNonEmptyValuesQuery("notation"),
      storeAdvanceReports.getUniqueNonEmptyValuesQuery("createdUser"),
      storeAdvanceReports.getUniqueNonEmptyValuesQuery("expenditure"),
    ]);

    // Функция очистки, сортировки и формирования уникального массива значений
    const cleanAndSort = (arr: any) =>
      Array.from(
        new Set(
          arr
            .filter((item: any) => item && !item.includes("��"))
            .map((item: any) => item.trim())
            .sort((a: any, b: any) => a.localeCompare(b))
        )
      );

    if (notation) {
      uniqueNotation.value = cleanAndSort(notation);
    }
    if (createdUser) {
      uniqueCreatedUser.value = cleanAndSort(createdUser);
    }
    uniqueExpenditure.value = expenditure;
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    isLoading.value = false;
  }
});

definePageMeta({
  layout: false,
  name: "Авансовый отчёт",
});

let isOpen = ref(false);
let isOpenAdmin = ref(false);
let isOpenAdminOOO = ref(false);
let rowData = ref({} as IAdvanceReport);
let sum1 = ref(0);
let sum2 = ref(0);
let allSum = ref(0);
let allSum2 = ref(0);
let sumOfReject = ref(200);

let copyArrayClientRansom = ref<Array<IClientRansom>>([]);
let clientRansomRows = ref<Array<IClientRansom>>([]);

function getAllSumDirector() {
  // Кэшируем дату, чтобы не создавать её в цикле
  const march312024 = new Date("2024-04-01");
  // --- Вычисляем суммы из разных источников ---

  // 1. Сумма из rowsBalance
  const sumOfPVZ = (rowsBalance.value || []).reduce((acc, row) => {
    return (
      acc +
      (row.received !== null &&
      (row.recipient === "Директор" || row.recipient === "Власенкова")
        ? Number(row.sum)
        : 0)
    );
  }, 0);

  // 2. Сумма из rowsDelivery (отфильтровано по дате)
  const sumOfPVZ4 = (rowsDelivery.value || []).reduce((acc, row) => {
    return (
      acc +
      (row.paid && new Date(row.paid) >= march312024
        ? Number(row.amountFromClient3)
        : 0)
    );
  }, 0);

  // 4. Считаем суммы по массиву rowsOurRansom за один проход
  let sumOfPVZ6 = 0,
    sumOfPVZ7 = 0,
    sumOfPVZ8 = 0,
    sumOfPVZ9 = 0,
    sumOfPVZ10 = 0;
  for (const row of rowsOurRansom.value || []) {
    if (row.verified !== null) {
      sumOfPVZ6 += Number(row.priceRefund);
    }
    if (
      row.additionally === "Отказ брак" ||
      row.additionally === "Отказ подмена"
    ) {
      sumOfPVZ7 += Number(row.priceSite);
    }
    if (
      row.additionally === "Отказ клиент наличные" ||
      row.additionally === "Отказ клиент"
    ) {
      sumOfPVZ8 += Number(row.priceSite);
    }
    if (
      row.additionally !== "Отказ клиент наличные" &&
      row.additionally !== "Отказ клиент безнал" &&
      row.additionally !== "Отказ клиент" &&
      row.additionally !== "Отказ брак" &&
      row.additionally !== "Отказ подмена"
    ) {
      sumOfPVZ9 += Number(row.priceSite);
    }
    if (
      row.additionally !== "Отказ клиент наличные" &&
      row.additionally !== "Отказ клиент" &&
      row.additionally !== "Отказ брак" &&
      row.additionally !== "Отказ подмена"
    ) {
      sumOfPVZ10 += Number(row.deliveredKGT);
    }
  }

  // 5. Объединяем все вычисления для rows.value в одном цикле
  let sumOfPVZ1 = 0, // для «Нал» с received и createdUser
    sumOfPVZ2 = 0, // для «Нал» с received и issuedUser (после 01.04.2024)
    sumOfPVZ3 = 0, // для «Нал» с отсутствующим issuedUser
    sumOfPVZ13 = 0, // удержания с сотрудников (Нал)
    sumOfPVZ11 = 0, // перевод с баланса безнал (Нал)
    sumOfPVZ12 = 0, // перевод с баланса нал (Безнал)
    sumOfPVZ1Cashless = 0, // для «Безнал» с received и createdUser
    sumOfPVZ2Cashless = 0, // для «Безнал» с received и issuedUser
    sumOfPVZ3Cashless = 0, // для «Безнал» с отсутствующим issuedUser
    sumOfPVZ4Cashless = 0, // для «Нал» с переводом с баланса безнал (доп. условие)
    sumOfPVZ5Cashless = 0; // для «Безнал» с переводом с баланса нал (доп. условие)

  for (const row of rows.value || []) {
    // Если указано received и пользователь создал запись
    if (
      row.received !== null &&
      (row.createdUser === "Директор" || row.createdUser === "Власенкова")
    ) {
      // Для наличных
      if (
        row.type === "Нал" &&
        row.typeOfExpenditure !== "Пополнение баланса" &&
        row.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
        row.typeOfExpenditure !== "Новый кредит нал" &&
        row.typeOfExpenditure !== "Постоплата WB" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал"
      ) {
        sumOfPVZ1 += Number(row.expenditure);
      }
      // Для безналичных
      if (
        row.type === "Безнал" &&
        row.typeOfExpenditure !== "Пополнение баланса" &&
        row.typeOfExpenditure !== "Перевод с кредитного баланса безнал" &&
        row.typeOfExpenditure !== "Новый кредит безнал" &&
        row.typeOfExpenditure !== "Перевод с баланса нал"
      ) {
        sumOfPVZ1Cashless += Number(row.expenditure);
      }
    }

    // Если received есть и дата установлена для наличных
    if (row.received !== null && row.type === "Нал" && row.date) {
      if (
        (row.issuedUser === "Директор" ||
          row.issuedUser === "Директор (С)" ||
          row.issuedUser === "Власенкова") &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал" &&
        new Date(row.date) >= march312024
      ) {
        sumOfPVZ2 += Number(row.expenditure);
      }
    }

    // Если отсутствует issuedUser и запись создана нужным пользователем (для наличных)
    if (
      (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
      !row.issuedUser &&
      row.type === "Нал" &&
      row.typeOfExpenditure !== "Кредитовый баланс нал" &&
      row.typeOfExpenditure !== "Перевод с баланса безнал" &&
      row.typeOfExpenditure !== "Удержания с сотрудников"
    ) {
      sumOfPVZ3 += Number(row.expenditure);
    }

    // Если удержания с сотрудников (наличные)
    if (
      row.type === "Нал" &&
      row.typeOfExpenditure === "Удержания с сотрудников"
    ) {
      sumOfPVZ13 += Number(row.expenditure);
    }

    // Если и createdUser, и issuedUser совпадают ("Директор" или "Власенкова")
    if (
      (row.createdUser === "Директор" && row.issuedUser === "Директор") ||
      (row.createdUser === "Власенкова" && row.issuedUser === "Власенкова")
    ) {
      if (
        row.type === "Нал" &&
        row.typeOfExpenditure === "Перевод с баланса безнал"
      ) {
        sumOfPVZ11 += Number(row.expenditure);
      }
      if (
        row.type === "Безнал" &&
        row.typeOfExpenditure === "Перевод с баланса нал"
      ) {
        sumOfPVZ12 += Number(row.expenditure);
      }
    }

    // Для безналичных – если received и задан issuedUser
    if (row.received !== null && row.type === "Безнал") {
      if (
        (row.issuedUser === "Директор" ||
          row.issuedUser === "Директор (С)" ||
          row.issuedUser === "Власенкова") &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал"
      ) {
        sumOfPVZ2Cashless += Number(row.expenditure);
      }
    }

    // Если отсутствует issuedUser и тип безнал, с нужными проверками
    if (
      (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
      !row.issuedUser &&
      row.type === "Безнал" &&
      row.typeOfExpenditure !== "Перевод с баланса нал" &&
      row.typeOfExpenditure !== "Кредитовый баланс безнал"
    ) {
      sumOfPVZ3Cashless += Number(row.expenditure);
    }

    // Если и createdUser, и issuedUser заданы (для обоих типов)
    if (
      (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
      (row.issuedUser === "Директор" ||
        row.issuedUser === "Директор (С)" ||
        row.issuedUser === "Власенкова")
    ) {
      if (
        row.type === "Нал" &&
        row.typeOfExpenditure === "Перевод с баланса безнал"
      ) {
        sumOfPVZ4Cashless += Number(row.expenditure);
      }
      if (
        row.type === "Безнал" &&
        row.typeOfExpenditure === "Перевод с баланса нал"
      ) {
        sumOfPVZ5Cashless += Number(row.expenditure);
      }
    }
  }

  switch (user.value.username) {
    case "Директор":
      allSum.value =
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
        sumOfPVZ1 +
        sumOfPVZ13;
      allSum2.value =
        sumOfPVZ1Cashless +
        sumOfPVZ2Cashless -
        sumOfPVZ3Cashless -
        sumOfPVZ4Cashless +
        sumOfPVZ5Cashless;

      break;
    default:
      allSum.value = sumOfPVZ - sumOfPVZ1 + sumOfPVZ2 - sumOfPVZ3 + sumOfPVZ4;
      break;
  }

  // Выполняем дополнительные расчёты
  getSumCreditCash();
  getSumCreditOnline();
  getSumCashWB();
  getSumCreditBalance();

  return allSum.value + allSum2.value;
}

let sumCreditCash = ref(0);
let sumCashWB = ref(0);
let sumCreditOnline = ref(0);
let sumCreditBalance = ref(0);

let sumCreditCashDebt = ref(0);
let sumCreditOnlineDebt = ref(0);
let sumCreditBalanceDebt = ref(0);

function getSumCashWB() {
  if (rows.value) {
    let sumOfPVZ = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure === "Постоплата WB" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    sumCashWB.value = sumOfPVZ;
  }
}

function getSumCreditCash() {
  if (rows.value) {
    let sumOfPVZ = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure ===
            "Перевод в междубалансовый, кредитный баланс" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ1 = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure === "Перевод с кредитного баланса нал" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ2 = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure === "Новый кредит нал" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ3 = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure === "Списание кредитной задолженности" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    sumCreditCash.value = sumOfPVZ - sumOfPVZ1;
    sumCreditCashDebt.value = sumOfPVZ2 - sumOfPVZ1 - sumOfPVZ3;
  }
}

function getSumCreditOnline() {
  if (rows.value) {
    let sumOfPVZ = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure ===
            "Перевод в междубалансовый, кредитный баланс" &&
          row.type === "Безнал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ1 = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure === "Перевод с кредитного баланса безнал" &&
          row.type === "Безнал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ2 = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure === "Новый кредит безнал" &&
          row.type === "Безнал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ3 = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure === "Списание кредитной задолженности" &&
          row.type === "Безнал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);
    sumCreditOnline.value = sumOfPVZ - sumOfPVZ1;
    sumCreditOnlineDebt.value = sumOfPVZ2 - sumOfPVZ1 - sumOfPVZ3;
  }
}

function getSumCreditBalance() {
  if (rows.value) {
    let sumOfPVZ1 = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure === "Перевод с баланса безнал" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ2 = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure === "Перевод с баланса нал" &&
          row.type === "Безнал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ1Debt = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure === "Перевод с баланса нал" &&
          row.type === "Безнал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ2Debt = rows.value
      .filter(
        (row) =>
          (row.createdUser === "Директор" ||
            row.createdUser === "Власенкова") &&
          row.typeOfExpenditure === "Перевод с баланса безнал" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    sumCreditBalance.value =
      sumOfPVZ1 - sumOfPVZ2 < 0 ? 0 : sumOfPVZ1 - sumOfPVZ2;
    sumCreditBalanceDebt.value =
      sumOfPVZ1Debt - sumOfPVZ2Debt < 0 ? 0 : sumOfPVZ1Debt - sumOfPVZ2Debt;
  }
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IAdvanceReport;
  rowData.value.notation = "";
}

function openModal(row: IAdvanceReport, flag: string = "CASH") {
  isOpen.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    if (
      user.value.username !== "Директор" &&
      user.value.username !== "Власенкова"
    ) {
      rowData.value.date = rowData.value.date ? rowData.value.date : null;
    }
  } else {
    rowData.value = {} as IAdvanceReport;
    rowData.value.notation = "";
    rowData.value.date = new Date();
  }
  if (!row.type) {
    if (flag === "CASH") {
      rowData.value.type = "Нал";
    } else {
      rowData.value.type = "Безнал";
    }
  } else {
    rowData.value.type = rowData.value.type;
  }
}

function checkStatus() {
  if (
    rowData.value.typeOfExpenditure === "Списание кредитной задолженности" ||
    rowData.value.typeOfExpenditure ===
      "Списание балансовой задолженности торговой империи" ||
    rowData.value.typeOfExpenditure ===
      "Перевод в междубалансовый, кредитный баланс"
  ) {
    rowData.value.PVZ = "";
    rowData.value.issuedUser = "";
    rowData.value.date = storeUsers.getISODate(new Date());
    rowData.value.supportingDocuments = "";
  }

  if (
    rowData.value.typeOfExpenditure !== "Передача денежных средств" &&
    rowData.value.typeOfExpenditure !== "Пополнение баланса" &&
    rowData.value.typeOfExpenditure !== "Новый кредит нал" &&
    rowData.value.typeOfExpenditure !== "Постоплата WB" &&
    rowData.value.typeOfExpenditure !== "Новый кредит безнал" &&
    rowData.value.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
    rowData.value.typeOfExpenditure !== "Перевод с баланса нал" &&
    rowData.value.typeOfExpenditure !== "Перевод с баланса безнал" &&
    rowData.value.typeOfExpenditure !== "Перевод с кредитного баланса безнал"
  ) {
    rowData.value.issuedUser = "";
  }

  if (
    rowData.value.typeOfExpenditure === "Передача денежных средств" ||
    rowData.value.typeOfExpenditure === "Вывод дивидендов" ||
    rowData.value.typeOfExpenditure === "Новый кредит нал" ||
    rowData.value.typeOfExpenditure === "Постоплата WB" ||
    rowData.value.typeOfExpenditure === "Новый кредит безнал" ||
    rowData.value.typeOfExpenditure === "Перевод с кредитного баланса нал" ||
    rowData.value.typeOfExpenditure === "Перевод с баланса нал" ||
    rowData.value.typeOfExpenditure === "Перевод с баланса безнал" ||
    rowData.value.typeOfExpenditure === "Перевод с кредитного баланса безнал"
  ) {
    rowData.value.PVZ = "";
  }

  if (rowData.value.typeOfExpenditure === "Вывод дивидендов") {
    rowData.value.PVZ = "Офис";
  }
}
let isOpenYM = ref(false);

function openModalAdmin(row: IAdvanceReport) {
  row.typeOfExpenditure = "Пополнение баланса";
  isOpenAdmin.value = true;
  rowData.value = {} as IAdvanceReport;
  rowData.value.PVZ = row.PVZ;
  rowData.value.company = row.company;
  rowData.value.expenditure = 0;
  rowData.value.notation = row.notation;
  rowData.value.issuedUser = user.value.username;
  rowData.value.received = new Date();
  rowData.value.supportingDocuments = "";
  rowData.value.typeOfExpenditure = row.typeOfExpenditure;
  rowData.value.createdUser = user.value.username;
  rowData.value.date = storeUsers.getISODate(new Date());
}

function openModalYM(row: IAdvanceReport) {
  row.typeOfExpenditure = "Пополнение баланса";
  isOpenYM.value = true;
  rowData.value = {} as IAdvanceReport;
  rowData.value.PVZ = "Коломенское ЯМ";
  rowData.value.expenditure = +row.expenditure;
  rowData.value.notation = row.notation;
  rowData.value.supportingDocuments = "";
  rowData.value.typeOfExpenditure = row.typeOfExpenditure;
  rowData.value.issuedUser = "КассаЯМ";
  rowData.value.createdUser = "КассаЯМ";
  rowData.value.received = new Date();
  rowData.value.date = storeUsers.getISODate(new Date());
}

function openModalAdminOOO(row: IAdvanceReport) {
  row.typeOfExpenditure = "Пополнение баланса";
  isOpenAdminOOO.value = true;
  rowData.value = {} as IAdvanceReport;
  rowData.value.PVZ = row.PVZ;
  rowData.value.expenditure = 0;
  rowData.value.notation = row.notation;
  rowData.value.issuedUser = user.value.username;
  rowData.value.received = new Date();
  rowData.value.supportingDocuments = "";
  rowData.value.typeOfExpenditure = row.typeOfExpenditure;
  rowData.value.type = "Безнал";
  rowData.value.createdUser = user.value.username;
  rowData.value.date = storeUsers.getISODate(new Date());
}

function closeModalAdmin() {
  isOpenAdmin.value = false;
  rowData.value = {} as IAdvanceReport;
}

function closeModalAdminOOO() {
  isOpenAdminOOO.value = false;
  rowData.value = {} as IAdvanceReport;
}

function closeModalYM() {
  isOpenYM.value = false;
  rowData.value = {} as IAdvanceReport;
}

let pvz = ref([]);

pvz.value = pvz.value.sort((a, b) => a.localeCompare(b, "ru"));

let typesOfExpenditure = ref([
  "Передача денежных средств",
  "Сопутствующие расходы",
  "Расходники для ПВЗ",
  "Ежемесячные платежи",
  "Списание кредитной задолженности",
  "Оплата ФОТ",
]);

let usersOfIssued = ref<Array<User>>([]);

import { createClient } from "@supabase/supabase-js";
import { useToast } from "vue-toastification";

const supabase = createClient(
  "https://larlbqgiulcvtankbkot.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcmxicWdpdWxjdnRhbmtia290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0MDUwMDcsImV4cCI6MjAzMjk4MTAwN30.mg-Z1vzsO6RWfZCoND7yIGpSu_E9e5N7qZasGzqGurQ"
);

async function createRow() {
  if (
    rowData.value.typeOfExpenditure ===
      "Перевод в междубалансовый, кредитный баланс" &&
    +rowData.value.expenditure > +sumCreditCashDebt.value &&
    rowData.value.type === "Нал"
  ) {
    toast.error("Задолженность кредита меньше чем вписанная сумма!");
    return;
  } else if (
    rowData.value.typeOfExpenditure ===
      "Перевод в междубалансовый, кредитный баланс" &&
    +rowData.value.expenditure > +sumCreditOnlineDebt.value &&
    rowData.value.type === "Безнал"
  ) {
    toast.error("Задолженность кредита меньше чем вписанная сумма!");
    return;
  } else if (
    rowData.value.typeOfExpenditure === "Списание кредитной задолженности" &&
    +rowData.value.expenditure > +sumCreditOnlineDebt.value &&
    rowData.value.type === "Безнал"
  ) {
    toast.error("Задолженность кредита меньше чем вписанная сумма!");
    return;
  } else if (
    rowData.value.typeOfExpenditure === "Списание кредитной задолженности" &&
    +rowData.value.expenditure > +sumCreditCashDebt.value &&
    rowData.value.type === "Нал"
  ) {
    toast.error("Задолженность кредита меньше чем вписанная сумма!");
    return;
  } else if (
    rowData.value.typeOfExpenditure === "Перевод с баланса нал" &&
    +rowData.value.expenditure > +Math.ceil(getAllSumFromEmployees()) &&
    rowData.value.type === "Безнал" &&
    user.value.username !== "Власенкова"
  ) {
    toast.error("На балансе нал не хватает средств!");
    return;
  } else if (
    rowData.value.typeOfExpenditure === "Перевод с баланса безнал" &&
    +rowData.value.expenditure > +allSum2.value &&
    rowData.value.type === "Нал" &&
    user.value.username !== "Власенкова"
  ) {
    toast.error("На балансе Директора безнал не хватает средств!");
    return;
  } else if (
    rowData.value.typeOfExpenditure === "Перевод с кредитного баланса нал" &&
    +rowData.value.expenditure > +sumCreditCash.value
  ) {
    toast.error("Баланс кредита меньше чем вписанная сумма!");
    return;
  } else if (!rowData.value.typeOfExpenditure) {
    toast.error("Выберите статью расхода!");
    return;
  } else if (
    !rowData.value.PVZ &&
    rowData.value.typeOfExpenditure !== "Передача денежных средств" &&
    rowData.value.typeOfExpenditure !== "Списание кредитной задолженности" &&
    rowData.value.typeOfExpenditure !==
      "Перевод в междубалансовый, кредитный баланс" &&
    rowData.value.typeOfExpenditure !== "Новый кредит нал" &&
    rowData.value.typeOfExpenditure !== "Постоплата WB" &&
    rowData.value.typeOfExpenditure !== "Новый кредит безнал" &&
    rowData.value.typeOfExpenditure !== "Пополнение баланса" &&
    rowData.value.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
    rowData.value.typeOfExpenditure !== "Перевод с кредитного баланса безнал" &&
    rowData.value.typeOfExpenditure !== "Перевод с баланса безнал" &&
    rowData.value.typeOfExpenditure !== "Перевод с баланса нал"
  ) {
    toast.error("Выберите ПВЗ!");
    return;
  } else if (
    rowData.value.typeOfExpenditure === "Перевод с кредитного баланса безнал" &&
    +rowData.value.expenditure > +sumCreditOnline.value
  ) {
    toast.error("Баланс кредита меньше чем вписанная сумма!");
  } else if (
    rowData.value.typeOfExpenditure === "Передача денежных средств" &&
    !rowData.value.issuedUser
  ) {
    toast.error("Выберите получателя!");
  } else {
    isLoading.value = true;
    if (rowData.value.typeOfExpenditure === "Передача денежных средств") {
      if (rowData.value.issuedUser !== "Директор (С)") {
        await storeUsers.sendMessageToEmployee(
          "Авансовый отчёт",
          `Подтвердите получение денежных средств`,
          rowData.value.issuedUser
        );
      } else {
        await storeUsers.sendMessageToEmployee(
          "Авансовый отчёт",
          `Подтвердите получение денежных средств`,
          "Директор"
        );
      }
    }

    if (rowData.value.type === "Безнал" && user.value.username === "Горцуева") {
      rowData.value.createdUser = "Директор";
      await storeAdvanceReports.createAdvanceReport(rowData.value, "Директор");
    } else {
      await storeAdvanceReports.createAdvanceReport(
        rowData.value,
        user.value.username
      );
    }

    rows.value = await storeAdvanceReports.getAdvancedReports(user.value);
    originallyRows.value = rows.value;

    if (user.value.role !== "ADMIN") {
      rows.value = rows.value?.filter(
        (row) =>
          row.createdUser === user.value.username ||
          row.issuedUser === user.value.username
      );
    } else {
      rows.value = rows.value;
    }
    filteredRows.value = rows.value;

    if (
      rows.value &&
      (user.value.username === "Директор" ||
        user.value.username === "Власенкова")
    ) {
      handleFilteredRows([
        rows.value,
        {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
      ]);
    } else {
      handleFilteredRows([
        rows.value,
        {
          start: new Date(new Date().getFullYear() - 1, 0, 1),
          end: new Date(),
        },
      ]);
    }

    closeModal();
    closeModalYM();
    closeModalAdmin();
    closeModalAdminOOO();
    getSumCreditCash();
    getSumCreditOnline();
    getSumCreditBalance();
  }

  isLoading.value = false;
}

async function updateRow() {
  isLoading.value = true;
  if (
    rowData.value.typeOfExpenditure ===
      "Перевод в междубалансовый, кредитный баланс" &&
    +rowData.value.expenditure > +sumCreditCashDebt.value &&
    rowData.value.type === "Нал"
  ) {
    toast.error("Задолженность меньше чем сумма расхода!");
    return;
  } else if (
    rowData.value.typeOfExpenditure ===
      "Перевод в междубалансовый, кредитный баланс" &&
    +rowData.value.expenditure > +sumCreditOnlineDebt.value &&
    rowData.value.type === "Безнал"
  ) {
    toast.error("Задолженность меньше чем сумма расхода!");
    return;
  } else if (
    rowData.value.typeOfExpenditure === "Списание кредитной задолженности" &&
    +rowData.value.expenditure > +sumCreditOnlineDebt.value &&
    rowData.value.type === "Безнал"
  ) {
    toast.error("Задолженность кредита меньше чем вписанная сумма!");
    return;
  } else if (
    rowData.value.typeOfExpenditure === "Списание кредитной задолженности" &&
    +rowData.value.expenditure > +sumCreditOnlineDebt.value &&
    rowData.value.type === "Нал"
  ) {
    toast.error("Задолженность кредита меньше чем вписанная сумма!");
    return;
  } else {
    isLoading.value = true;
  }

  if (
    rowData.value.typeOfExpenditure ===
      "Перевод в междубалансовый, кредитный баланс" &&
    +rowData.value.expenditure > +sumCreditCashDebt.value
  ) {
    toast.error("Задолженность кредита меньше чем вписанная сумма!");
    return;
  } else if (
    rowData.value.typeOfExpenditure ===
      "Перевод в междубалансовый, кредитный баланс" &&
    +rowData.value.expenditure > +sumCreditOnlineDebt.value
  ) {
    toast.error("Задолженность кредита меньше чем вписанная сумма!");
    return;
  } else if (
    rowData.value.typeOfExpenditure === "Перевод с кредитного баланса нал" &&
    +rowData.value.expenditure > +sumCreditCash.value
  ) {
    toast.error("Баланс кредита меньше чем вписанная сумма!");
  } else if (
    rowData.value.typeOfExpenditure === "Перевод с кредитного баланса безнал" &&
    +rowData.value.expenditure > +sumCreditOnline.value
  ) {
    toast.error("Баланс кредита меньше чем вписанная сумма!");
  } else {
    isLoading.value = true;
    rowData.value.expenditure = Number(rowData.value.expenditure);
    await storeAdvanceReports.updateAdvanceReport(rowData.value);
  }

  rows.value = await storeAdvanceReports.getAdvancedReports(user.value);
  originallyRows.value = rows.value;

  if (user.value.role !== "ADMIN") {
    rows.value = rows.value?.filter(
      (row) =>
        row.createdUser === user.value.username ||
        row.issuedUser === user.value.username
    );
  } else {
    rows.value = rows.value;
  }
  filteredRows.value = rows.value;

  if (
    rows.value &&
    (user.value.username === "Директор" || user.value.username === "Власенкова")
  ) {
    handleFilteredRows([
      rows.value,
      {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      },
    ]);
  } else {
    handleFilteredRows([
      rows.value,
      {
        start: new Date(new Date().getFullYear() - 1, 0, 1),
        end: new Date(),
      },
    ]);
  }

  getSumCreditCash();
  getSumCreditOnline();
  getSumCreditBalance();
  closeModal();
  isLoading.value = false;
}

async function updateDeliveryRow(row: any) {
  isLoading.value = true;
  await storeAdvanceReports.updateDeliveryStatus(row.row);
  rows.value = await storeAdvanceReports.getAdvancedReports(user.value);
  originallyRows.value = rows.value;

  if (user.value.role !== "ADMIN") {
    rows.value = rows.value?.filter(
      (row) =>
        row.createdUser === user.value.username ||
        row.issuedUser === user.value.username
    );
  } else {
    rows.value = rows.value;
  }
  filteredRows.value = rows.value;

  if (
    rows.value &&
    (user.value.username === "Директор" || user.value.username === "Власенкова")
  ) {
    handleFilteredRows([
      rows.value,
      {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      },
    ]);
  } else {
    handleFilteredRows([
      rows.value,
      {
        start: new Date(new Date().getFullYear() - 1, 0, 1),
        end: new Date(),
      },
    ]);
  }

  getSumCreditCash();
  getSumCreditOnline();
  getSumCreditBalance();
  isLoading.value = false;
}

function clearLocalStorage() {
  const addressData = localStorage.getItem("addressData");
  localStorage.clear();
  if (addressData) {
    localStorage.setItem("addressData", addressData);
  }
}

onUnmounted(() => {
  clearLocalStorage();
});

async function deleteRow(id: any) {
  let answer = confirm("Вы точно хотите удалить строку?");
  if (answer) {
    isLoading.value = true;
    await storeAdvanceReports.deleteRow(id.id);
    rows.value = await storeAdvanceReports.getAdvancedReports(user.value);
    originallyRows.value = rows.value;

    if (user.value.role !== "ADMIN") {
      rows.value = rows.value?.filter(
        (row) =>
          row.createdUser === user.value.username ||
          row.issuedUser === user.value.username
      );
    } else {
      rows.value = rows.value;
    }
    filteredRows.value = rows.value;

    if (
      rows.value &&
      (user.value.username === "Директор" ||
        user.value.username === "Власенкова")
    ) {
      handleFilteredRows([
        rows.value,
        {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
      ]);
    } else {
      handleFilteredRows([
        rows.value,
        {
          start: new Date(new Date().getFullYear() - 1, 0, 1),
          end: new Date(),
        },
      ]);
    }

    getSumCreditCash();
    getSumCreditOnline();
    getSumCreditBalance();
    isLoading.value = false;
  }
}

function formatNumber(number: number) {
  let numberString = Math.ceil(number).toString();

  if (numberString.length <= 3) {
    return numberString;
  }

  let formattedString = "";
  let reminder = numberString.length % 3;

  if (reminder !== 0) {
    formattedString += numberString.slice(0, reminder) + " ";
  }

  for (let i = reminder; i < numberString.length; i += 3) {
    formattedString += numberString.slice(i, i + 3) + " ";
  }

  return formattedString.slice(0, -1);
}

function getAllSumFromName(username: string) {
  let sumOfPVZ = rowsBalance.value
    ?.filter((row) => row.received !== null && row.recipient === username)
    .reduce((acc, value) => acc + +value.sum, 0);

  let sumOfPVZ1 = originallyRows.value
    ?.filter((row) => row.received !== null && row.createdUser === username)
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ2 = originallyRows.value
    ?.filter((row) => row.received !== null && row.issuedUser === username)
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ3 = originallyRows.value
    ?.filter((row) => row.createdUser === username && !row.issuedUser)
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ4 = originallyRows.value
    ?.filter(
      (row) => row.createdUser === username && row.issuedUser === username
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let allSum = sumOfPVZ - sumOfPVZ1 + sumOfPVZ2 - sumOfPVZ3 + sumOfPVZ4;
  return allSum;
}

function getAllSumFromEmployees() {
  getAllSumDirector();

  copyArrayClientRansom.value = clientRansomRows.value?.filter(
    (row) => row.issued !== null && row.additionally === "Оплата наличными"
  );

  let totalSum = 0;

  usersOfIssued.value
    .filter((userData) => userData.username !== "Директор")
    .forEach((userData) => {
      let sumOfPVZ = rowsBalance.value
        ?.filter(
          (row) => row.received !== null && row.recipient === userData.username
        )
        .reduce((acc, value) => acc + +value.sum, 0);

      let sumOfPVZ1 = originallyRows.value
        ?.filter(
          (row) =>
            row.received !== null && row.createdUser === userData.username
        )
        .reduce((acc, value) => acc + +value.expenditure, 0);

      let sumOfPVZ2 = originallyRows.value
        ?.filter(
          (row) => row.received !== null && row.issuedUser === userData.username
        )
        .reduce((acc, value) => acc + +value.expenditure, 0);

      let sumOfPVZ3 = originallyRows.value
        ?.filter(
          (row) => row.createdUser === userData.username && !row.issuedUser
        )
        .reduce((acc, value) => acc + +value.expenditure, 0);
      sumOfPVZ = sumOfPVZ === undefined ? 0 : sumOfPVZ;
      sumOfPVZ1 = sumOfPVZ1 === undefined ? 0 : sumOfPVZ1;
      sumOfPVZ2 = sumOfPVZ2 === undefined ? 0 : sumOfPVZ2;
      sumOfPVZ3 = sumOfPVZ3 === undefined ? 0 : sumOfPVZ3;
      let allSum = +sumOfPVZ - +sumOfPVZ1 + +sumOfPVZ2 - +sumOfPVZ3;
      totalSum += allSum;
    });
  totalSum += allSum.value;
  return totalSum;
}

interface SelectedDateRange {
  start: Date;
  end: Date;
}

const selected = ref<SelectedDateRange>({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
});

const filteredRows = ref<Array<IAdvanceReport>>();

function handleFilteredRows(obj: any) {
  filteredRows.value = obj[0];
  selected.value = obj[1];

  const newStartingDate = new Date(selected.value.start).setHours(0, 0, 0, 0);
  const newEndDate = new Date(selected.value.end).setHours(23, 59, 59, 999);

  if (user.value.username !== "Власенкова") {
    filteredRows.value = filteredRows.value?.filter((row: IAdvanceReport) => {
      const rowDate = new Date(row.date).getTime();
      return (
        (!selected.value.start || rowDate >= newStartingDate) &&
        (!selected.value.end || rowDate <= newEndDate)
      );
    });
  } else {
    filteredRows.value = filteredRows.value?.filter((row: IAdvanceReport) => {
      const rowDate = new Date(row.created_at).getTime();
      return (
        (!selected.value.start || rowDate >= newStartingDate) &&
        (!selected.value.end || rowDate <= newEndDate)
      );
    });
  }
}

let linkPhoto = ref("");
async function handleFileChange(fileList: FileList) {
  isLoading.value = true;
  const selectedFile = fileList[0];
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const { data, error } = await supabase.storage
    .from("image")
    .upload(`img-${randomDigits + selectedFile.name}`, selectedFile);
  rowData.value.supportingDocuments = randomDigits + selectedFile.name;
  linkPhoto.value = `https://larlbqgiulcvtankbkot.supabase.co/storage/v1/object/public/image/img-${
    randomDigits + selectedFile.name
  }`;
  if (data) {
    toast.success("Фото успешно загружено");
  } else {
    toast.error("Произошла ошибка");
    rowData.value.supportingDocuments = "";
  }
  isLoading.value = false;
}

let selectedUser = ref("");
let showBalanceEmployees = ref(false);

let isShowCreditBalanceCash = ref(false);
let isShowCreditBalanceOnline = ref(false);

let searchNotations = ref<Array<string>>([]);
function searchNotation() {
  const uniqueNotation = storeAdvanceReports.getUniqueNonEmptyValues(
    rows.value,
    "notation"
  );

  if (rowData.value.notation) {
    searchNotations.value = uniqueNotation.filter((notation) =>
      notation.toLowerCase().includes(rowData.value.notation.toLowerCase())
    );
  }
}

watch(
  () => rowData.value.notation,
  (newValue, oldValue) => {
    searchNotation();
  }
);

let isFirstClick = ref(true);

function closeAdvanceReportEmployee() {
  if (isFirstClick) {
    showBalanceEmployees.value = !showBalanceEmployees.value;
    selectedUser.value = "Директор";
    isFirstClick.value = false;
  }
}

function lockScroll() {
  document.body.classList.add("no-scroll");
}

function unlockScroll() {
  document.body.classList.remove("no-scroll");
}

watch(isOpen, (newValue) => {
  if (newValue) {
    lockScroll();
  } else {
    unlockScroll();
  }
});

watch(isOpenAdmin, (newValue) => {
  if (newValue) {
    lockScroll();
  } else {
    unlockScroll();
  }
});

watch(isOpenAdminOOO, (newValue) => {
  if (newValue) {
    lockScroll();
  } else {
    unlockScroll();
  }
});

watch(isOpenYM, (newValue) => {
  if (newValue) {
    lockScroll();
  } else {
    unlockScroll();
  }
});

const paymentOptions = [
  { value: "Нал", label: "Нал" },
  { value: "Безнал", label: "Безнал" },
];

const typeOfOptions = [
  { value: "Новый кредит нал", label: "Новый" },
  { value: "Пополнение баланса", label: "Нет" },
];

const typeOfOptions2 = [
  { value: "Новый кредит безнал", label: "Новый" },
  { value: "Пополнение баланса", label: "Нет" },
];
</script>

<template>
  <Head>
    <Title>Авансовый отчёт</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="table-admin-no-pad">
        <div class="bg-gray-50 px-5 w-screen pt-10 max-sm:px-5 pb-5">
          <AdvanceReportFilters
            v-if="rows"
            @filtered-rows="handleFilteredRows"
            :rows="rows"
            :user="user"
            :uniqueNotation="uniqueNotation"
            :uniqueCreatedUser="uniqueCreatedUser"
            :uniqueExpenditure="uniqueExpenditure"
          />

          <div
            v-if="isShowCreditBalanceCash"
            class="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-70 z-[200]"
          >
            <div class="h-screen flex items-center justify-center font-bold">
              <div
                class="bg-white max-sm:px-3 max-w-[500px] p-10 rounded-2xl relative"
              >
                <Icon
                  name="material-symbols:cancel-rounded"
                  size="40"
                  class="absolute top-0 right-0 hover:text-secondary-color duration-200 cursor-pointer"
                  @click="isShowCreditBalanceCash = !isShowCreditBalanceCash"
                />
                <h1 class="text-xl text-center">Кредитная задолженность</h1>
                <h1 class="text-center text-2xl text-secondary-color mb-5">
                  {{ formatNumber(sumCreditCashDebt) }} ₽
                </h1>
              </div>
            </div>
          </div>

          <div
            v-if="isShowCreditBalanceOnline"
            class="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-70 z-[200]"
          >
            <div class="h-screen flex items-center justify-center font-bold">
              <div
                class="bg-white max-sm:px-3 max-w-[500px] p-10 rounded-2xl relative"
              >
                <Icon
                  name="material-symbols:cancel-rounded"
                  size="40"
                  class="absolute top-0 right-0 hover:text-secondary-color duration-200 cursor-pointer"
                  @click="
                    isShowCreditBalanceOnline = !isShowCreditBalanceOnline
                  "
                />
                <h1 class="text-xl text-center">
                  Междубалансовый, кредитный <br />
                  баланс безнал
                </h1>
                <h1 class="text-center text-2xl text-secondary-color mb-5">
                  {{ formatNumber(sumCreditOnline) }} ₽
                </h1>
                <h1 class="text-xl text-center">Кредитная задолженность</h1>
                <h1 class="text-center text-2xl text-secondary-color mb-5">
                  {{ formatNumber(sumCreditOnlineDebt) }} ₽
                </h1>
                <h1 class="text-xl text-center">
                  Междубалансовая задолженность
                </h1>
                <h1 class="text-center text-2xl text-secondary-color mb-5">
                  {{ formatNumber(sumCreditBalanceDebt) }} ₽
                </h1>
              </div>
            </div>
          </div>

          <div>
            <div
              class="text-center text-2xl my-5"
              v-if="selectedUser !== 'Директор'"
            >
              <h1>Баланс {{ selectedUser }}:</h1>
              <h1 class="font-bold text-secondary-color text-4xl text-center">
                {{ formatNumber(getAllSumFromName(selectedUser)) }} ₽
              </h1>
            </div>
            <div v-if="user.role === 'ADMIN' && selectedUser === 'Директор'">
              <div class="flex items-center flex-col mb-3">
                <div class="text-center text-xl my-3">
                  <h1>Баланс онлайн&наличные:</h1>
                  <div class="flex items-center justify-center gap-3 mt-1">
                    <h1
                      class="font-bold text-secondary-color text-4xl text-center"
                    >
                      {{ formatNumber(Math.ceil(getAllSumFromEmployees())) }}
                      ₽
                    </h1>
                    <Icon
                      name="solar:money-bag-bold"
                      size="30"
                      class="text-secondary-color hover:opacity-50 cursor-pointer duration-200"
                      @click="
                        isShowCreditBalanceCash = !isShowCreditBalanceCash
                      "
                    />
                  </div>
                </div>
                <UIMainButton
                  class="max-sm:w-full max-w-[400px]"
                  v-if="user.role === 'ADMIN'"
                  @click="openModalAdmin"
                >
                  Пополнение баланса
                </UIMainButton>
              </div>
            </div>
          </div>

          <div v-if="user.role === 'ADMIN' && user.username !== 'Горцуева'">
            <div class="flex items-center gap-3 mb-5">
              <h1 class="font-bold text-xl">Проверить баланс сотрудника</h1>
              <Icon
                @click="closeAdvanceReportEmployee"
                name="clarity:employee-line"
                size="24"
                class="text-secondary-color hover:opacity-50 cursor-pointer duration-200"
              />
            </div>
            <div
              v-if="showBalanceEmployees"
              class="text-xl border-2 bg-white p-5 border-dashed border-black"
            >
              <select
                v-model="selectedUser"
                class="relative disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 inline-flex items-center text-left cursor-default rounded-md text-sm gap-x-1.5 px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 pe-9"
              >
                <option :value="user.username" v-for="user in usersOfIssued">
                  {{ user.username }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex items-start gap-3 flex-col">
            <div
              class="flex items-center mt-5 gap-3 w-full max-w-[400px] max-sm:max-w-full"
            >
              <UIMainButton
                class="w-full max-sm:max-w-[400px] mx-auto"
                @click="openModal(rowData, 'CASH')"
              >
                Создание аван. документа
              </UIMainButton>
              <div class="max-sm:hidden">
                <Icon
                  class="text-secondary-color"
                  name="tdesign:money"
                  size="24"
                />
              </div>
            </div>
          </div>

          <AdvanceReportTable
            v-if="selectedUser !== 'Директор'"
            :rows="
              filteredRows?.filter(
                (row) =>
                  row.issuedUser === selectedUser ||
                  row.createdUser === selectedUser
              )
            "
            :user="user"
            @open-modal="openModal"
            @update-delivery-row="updateDeliveryRow"
            @delete-row="deleteRow"
          />

          <AdvanceReportTable
            v-if="selectedUser === 'Директор'"
            :rows="filteredRows"
            :user="user"
            @open-modal="openModal"
            @update-delivery-row="updateDeliveryRow"
            @delete-row="deleteRow"
          />
        </div>

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="material-symbols:file-copy-outline-rounded" />
          </template>
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение: <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else-if="rowData.type === 'Нал'">
              Создание аван. документа
            </div>
            <div class="custom-header" v-else-if="rowData.type === 'Безнал'">
              Создание аван. документа Безнал
            </div>
          </template>
          <template v-slot:body>
            <div class="text-black">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="dispatchPVZ1">ПВЗ</label>
                <USelectMenu
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс' ||
                    rowData.typeOfExpenditure === 'Передача денежных средств' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure === 'Вывод дивидендов'
                  "
                  class="w-full"
                  v-model="rowData.PVZ"
                  :options="pvz"
                  value-attribute="name"
                  option-attribute="name"
                />
              </div>

              <div
                class="flex flex-col items-start text-left gap-2 mb-5"
                v-if="user.role !== 'ADMIN'"
              >
                <label for="name">Дата</label>
                <input
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс'
                  "
                  type="date"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  v-model="rowData.date"
                />
              </div>

              <div
                class="flex flex-col items-start text-left gap-2 mb-5"
                v-if="user.role === 'ADMIN'"
              >
                <label for="name">Дата</label>
                <input
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс'
                  "
                  type="date"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  v-model="rowData.date"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Получатель</label>
                <USelectMenu
                  :disabled="
                    rowData.typeOfExpenditure !== 'Передача денежных средств'
                  "
                  class="w-full"
                  v-model="rowData.issuedUser"
                  :options="usersOfIssued"
                  value-attribute="username"
                  option-attribute="username"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Расход</label>
                <UInput
                  class="w-full"
                  v-model="rowData.expenditure"
                  type="text"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="dispatchPVZ1">Статья расхода</label>
                <USelectMenu
                  @change="checkStatus"
                  class="w-full"
                  v-model="rowData.typeOfExpenditure"
                  searchable
                  searchable-placeholder="Поиск..."
                  :options="typesOfExpenditure"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Комментарий</label>
                <UInput class="w-full" v-model="rowData.notation" />
                <USelectMenu
                  class="w-full"
                  v-model="rowData.notation"
                  :options="searchNotations"
                  placeholder="Выберите из списка"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Подтверждающий документ</label>
                <UInput
                  v-if="!rowData.supportingDocuments"
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс'
                  "
                  class="w-full"
                  @change="handleFileChange"
                  type="file"
                  size="sm"
                  icon="i-heroicons-folder"
                />
                <div
                  v-else
                  class="flex items-center gap-3 relative w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 file:font-medium file:text-gray-500 dark:file:text-gray-400 file:bg-transparent file:border-0 file:p-0 file:outline-none text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                >
                  <Icon
                    name="icon-park-solid:folder-success"
                    size="24"
                    class="text-green-500"
                  />
                  <h1>Файл успешно загружен.</h1>
                </div>
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div
              class="flex items-center justify-center gap-3"
              v-if="rowData.id"
            >
              <UISaveModalButton @click="updateRow"
                >Сохранить
              </UISaveModalButton>
              <UIExitModalButton @click="closeModal"
                >Отменить
              </UIExitModalButton>
            </div>
            <div class="flex items-center justify-center gap-3" v-else>
              <UISaveModalButton @click="createRow">Создать </UISaveModalButton>
              <UIExitModalButton @click="closeModal"
                >Отменить
              </UIExitModalButton>
            </div>
          </template>
        </UINewModalEdit>

        <UINewModalEdit v-show="isOpenAdmin" @close-modal="closeModalAdmin">
          <template v-slot:icon-header>
            <Icon size="24" name="iconoir:hand-cash" />
          </template>
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение: <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else>Пополнение баланса</div>
          </template>
          <template v-slot:body>
            <div class="text-black">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Сумма</label>
                <UInput
                  :disabled="user.role !== 'ADMIN'"
                  class="w-full"
                  v-model="rowData.expenditure"
                  type="text"
                />
              </div>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="name">Дата</label>
              <input
                :disabled="
                  rowData.typeOfExpenditure ===
                    'Списание кредитной задолженности' ||
                  rowData.typeOfExpenditure ===
                    'Списание балансовой задолженности торговой империи' ||
                  rowData.typeOfExpenditure ===
                    'Перевод в междубалансовый, кредитный баланс'
                "
                type="date"
                class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                v-model="rowData.date"
              />
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="dispatchPVZ1">ПВЗ</label>
              <USelectMenu
                :disabled="
                  rowData.typeOfExpenditure === 'Новый кредит нал' ||
                  rowData.typeOfExpenditure === 'Постоплата WB' ||
                  rowData.typeOfExpenditure === 'Перевод с баланса безнал' ||
                  rowData.typeOfExpenditure ===
                    'Перевод с кредитного баланса нал'
                "
                class="w-full"
                v-model="rowData.PVZ"
                :options="pvz"
                value-attribute="name"
                option-attribute="name"
              />
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="dispatchPVZ1">Кредит</label>
              <USelectMenu
                class="w-full"
                v-model="rowData.typeOfExpenditure"
                :options="typeOfOptions"
                value-attribute="value"
                id-attribute="label"
                @change="checkStatus"
              />
            </div>

            <div class="text-black">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Комментарий</label>
                <UInput
                  :disabled="user.role !== 'ADMIN'"
                  class="w-full"
                  v-model="rowData.notation"
                />
                <USelectMenu
                  :disabled="user.role !== 'ADMIN'"
                  class="w-full"
                  v-model="rowData.notation"
                  :options="searchNotations"
                  placeholder="Выберите из списка"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex items-center justify-center gap-3">
              <UISaveModalButton @click="createRow">Создать</UISaveModalButton>
              <UIExitModalButton @click="closeModalAdmin"
                >Отменить</UIExitModalButton
              >
            </div>
          </template>
        </UINewModalEdit>

        <UINewModalEdit
          v-show="isOpenAdminOOO"
          @close-modal="closeModalAdminOOO"
        >
          <template v-slot:icon-header>
            <Icon size="24" name="hugeicons:credit-card-validation" />
          </template>
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение: <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else>Пополнение баланса</div>
          </template>
          <template v-slot:body>
            <div class="text-black">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Сумма</label>
                <UInput
                  :disabled="user.role !== 'ADMIN'"
                  class="w-full"
                  v-model="rowData.expenditure"
                  type="text"
                />
              </div>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="name">Дата</label>
              <input
                :disabled="
                  rowData.typeOfExpenditure ===
                    'Списание кредитной задолженности' ||
                  rowData.typeOfExpenditure ===
                    'Списание балансовой задолженности торговой империи' ||
                  rowData.typeOfExpenditure ===
                    'Перевод в междубалансовый, кредитный баланс'
                "
                type="date"
                class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                v-model="rowData.date"
              />
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="dispatchPVZ1">ПВЗ</label>
              <USelectMenu
                :disabled="
                  rowData.typeOfExpenditure === 'Новый кредит безнал' ||
                  rowData.typeOfExpenditure === 'Перевод с баланса нал' ||
                  rowData.typeOfExpenditure ===
                    'Перевод с кредитного баланса безнал'
                "
                class="w-full"
                v-model="rowData.PVZ"
                :options="pvz"
                value-attribute="name"
                option-attribute="name"
              />
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="dispatchPVZ1">Кредит</label>
              <USelectMenu
                class="w-full"
                v-model="rowData.typeOfExpenditure"
                :options="typeOfOptions2"
                value-attribute="value"
                id-attribute="label"
                @change="checkStatus"
              />
            </div>

            <div class="text-black">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Комментарий</label>
                <UInput
                  :disabled="user.role !== 'ADMIN'"
                  class="w-full"
                  v-model="rowData.notation"
                />
                <USelectMenu
                  :disabled="user.role !== 'ADMIN'"
                  class="w-full"
                  v-model="rowData.notation"
                  :options="searchNotations"
                  placeholder="Выберите из списка"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex items-center justify-center gap-3">
              <UISaveModalButton @click="createRow">Создать</UISaveModalButton>
              <UIExitModalButton @click="closeModalAdminOOO"
                >Отменить</UIExitModalButton
              >
            </div>
          </template>
        </UINewModalEdit>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="table-user-no-pad">
        <div class="bg-gray-50 px-5 w-screen pt-10 max-sm:px-5 pb-5">
          <div>
            <div
              class="text-center text-2xl my-5 flex items-center justify-center flex-col gap-3"
              v-if="selectedUser !== 'Директор'"
            >
              <div>
                <h1>Баланс {{ selectedUser }}:</h1>
                <h1 class="font-bold text-secondary-color text-4xl text-center">
                  {{ formatNumber(getAllSumFromName(selectedUser)) }} ₽
                </h1>
              </div>

              <UIMainButton
                class=""
                v-if="user.username === 'КассаЯМ'"
                @click="openModalYM"
              >
                Пополнение баланса
              </UIMainButton>
            </div>
          </div>

          <div class="flex items-start gap-3 flex-col">
            <div
              class="flex items-center mt-5 gap-3 w-full max-w-[400px] max-sm:max-w-full"
            >
              <UIMainButton
                class="w-full max-sm:max-w-[400px] mx-auto"
                @click="openModal(rowData, 'CASH')"
              >
                Создание аван. документа
              </UIMainButton>
              <div class="max-sm:hidden">
                <Icon
                  class="text-secondary-color"
                  name="tdesign:money"
                  size="24"
                />
              </div>
            </div>
          </div>

          <AdvanceReportTable
            :rows="
              filteredRows?.filter(
                (row) =>
                  row.issuedUser === selectedUser ||
                  row.createdUser === selectedUser
              )
            "
            :user="user"
            @open-modal="openModal"
            @update-delivery-row="updateDeliveryRow"
          />
        </div>

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="material-symbols:file-copy-outline-rounded" />
          </template>
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение: <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else-if="rowData.type === 'Нал'">
              Создание аван. документа
            </div>
            <div class="custom-header" v-else-if="rowData.type === 'Безнал'">
              Создание аван. документа
            </div>
          </template>
          <template v-slot:body>
            <div class="text-black">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="dispatchPVZ1">ПВЗ</label>
                <USelectMenu
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс' ||
                    rowData.typeOfExpenditure === 'Передача денежных средств' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure === 'Вывод дивидендов'
                  "
                  class="w-full"
                  v-model="rowData.PVZ"
                  :options="pvz"
                  value-attribute="name"
                  option-attribute="name"
                />
              </div>

              <div
                class="flex flex-col items-start text-left gap-2 mb-5"
                v-if="user.role !== 'ADMIN'"
              >
                <label for="name">Дата</label>
                <input
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс'
                  "
                  type="date"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  v-model="rowData.date"
                />
              </div>

              <div
                class="flex flex-col items-start text-left gap-2 mb-5"
                v-if="user.role === 'ADMIN'"
              >
                <label for="name">Дата</label>
                <input
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс'
                  "
                  type="date"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  v-model="rowData.date"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Получатель</label>
                <USelectMenu
                  :disabled="
                    rowData.typeOfExpenditure !== 'Передача денежных средств'
                  "
                  class="w-full"
                  v-model="rowData.issuedUser"
                  :options="usersOfIssued"
                  value-attribute="username"
                  option-attribute="username"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Расход</label>
                <UInput
                  class="w-full"
                  v-model="rowData.expenditure"
                  type="text"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="dispatchPVZ1">Статья расхода</label>
                <USelectMenu
                  @change="checkStatus"
                  class="w-full"
                  searchable
                  searchable-placeholder="Поиск..."
                  v-model="rowData.typeOfExpenditure"
                  :options="typesOfExpenditure"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Комментарий</label>
                <UInput class="w-full" v-model="rowData.notation" />
                <USelectMenu
                  class="w-full"
                  v-model="rowData.notation"
                  :options="searchNotations"
                  placeholder="Выберите из списка"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Подтверждающий документ</label>
                <UInput
                  v-if="!rowData.supportingDocuments"
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс'
                  "
                  class="w-full"
                  @change="handleFileChange"
                  type="file"
                  size="sm"
                  icon="i-heroicons-folder"
                />
                <div
                  v-else
                  class="flex items-center gap-3 relative w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 file:font-medium file:text-gray-500 dark:file:text-gray-400 file:bg-transparent file:border-0 file:p-0 file:outline-none text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                >
                  <Icon
                    name="icon-park-solid:folder-success"
                    size="24"
                    class="text-green-500"
                  />
                  <h1>Файл успешно загружен.</h1>
                </div>
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div
              class="flex items-center justify-center gap-3"
              v-if="rowData.id"
            >
              <UISaveModalButton @click="updateRow"
                >Сохранить
              </UISaveModalButton>
              <UIExitModalButton @click="closeModal"
                >Отменить
              </UIExitModalButton>
            </div>
            <div class="flex items-center justify-center gap-3" v-else>
              <UISaveModalButton @click="createRow">Создать </UISaveModalButton>
              <UIExitModalButton @click="closeModal"
                >Отменить
              </UIExitModalButton>
            </div>
          </template>
        </UINewModalEdit>

        <UINewModalEdit v-show="isOpenYM" @close-modal="closeModalYM">
          <template v-slot:icon-header>
            <Icon size="24" name="hugeicons:credit-card-validation" />
          </template>
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение: <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else>Пополнение баланса</div>
          </template>
          <template v-slot:body>
            <div class="text-black">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Сумма</label>
                <UInput
                  class="w-full"
                  v-model="rowData.expenditure"
                  type="text"
                />
              </div>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="name">Дата</label>
              <input
                :disabled="
                  rowData.typeOfExpenditure ===
                    'Списание кредитной задолженности' ||
                  rowData.typeOfExpenditure ===
                    'Списание балансовой задолженности торговой империи' ||
                  rowData.typeOfExpenditure ===
                    'Перевод в междубалансовый, кредитный баланс'
                "
                type="date"
                class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                v-model="rowData.date"
              />
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex items-center justify-center gap-3">
              <UISaveModalButton @click="createRow">Создать</UISaveModalButton>
              <UIExitModalButton @click="closeModalYM"
                >Отменить
              </UIExitModalButton>
            </div>
          </template>
        </UINewModalEdit>
      </NuxtLayout>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
