<script setup lang="ts">
import { vAutoAnimate } from "@formkit/auto-animate";
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

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  try {
    user.value = await storeUsers.getUser();

    let advanceReportsPromise;
    let ourRansomRowsPromise;
    let ourRansomRowsPromise2;
    let ourRansomRowsPromise3;
    let deliveryRowsPromise;

    if (user.value.role === "ADMIN") {
      advanceReportsPromise = storeAdvanceReports.getAdvancedReports(
        user.value
      );
      ourRansomRowsPromise =
        storeRansom.getRansomRowsForAdvanceReportOurRansomPartOne();
      ourRansomRowsPromise2 =
        storeRansom.getRansomRowsForAdvanceReportOurRansomPartTwo();
      ourRansomRowsPromise3 =
        storeRansom.getRansomRowsForAdvanceReportOurRansomPartThree();
      deliveryRowsPromise = storeRansom.getRansomRowsForBalanceDelivery();
    } else {
      advanceReportsPromise = storeAdvanceReports.getAdvancedReports(
        user.value
      );
    }

    const [
      advanceReportsData,
      ourRansomRowsData,
      ourRansomRowsData2,
      ourRansomRowsData3,
      deliveryRowsData,
      balanceRowsData,
      onlineBalanceRowsData,
    ] = await Promise.all([
      advanceReportsPromise,
      ourRansomRowsPromise,
      ourRansomRowsPromise2,
      ourRansomRowsPromise3,
      deliveryRowsPromise,
      storeBalance.getBalanceRows(),
      storeBalance.getBalanceOnlineRows(),
    ]);

    rows.value = advanceReportsData;
    originallyRows.value = rows.value;
    selectedUser.value = user.value.username;

    if (user.value.role !== "ADMIN") {
      rows.value = rows.value.filter(
        (row) =>
          row.createdUser === user.value.username ||
          row.issuedUser === user.value.username
      );
    }

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

    if (user.value.role === "ADMIN") {
      rowsOurRansom.value = [
        ...ourRansomRowsData,
        ...ourRansomRowsData2,
        ...ourRansomRowsData3,
      ];
      rowsDelivery.value = deliveryRowsData;
      getAllSumDirector();
    }

    rowsBalance.value = balanceRowsData;
    rowsBalanceOnline.value = onlineBalanceRowsData;

    const [notation, createdUser, expenditure] = await Promise.all([
      storeAdvanceReports.getUniqueNonEmptyValuesQuery("notation"),
      storeAdvanceReports.getUniqueNonEmptyValuesQuery("createdUser"),
      storeAdvanceReports.getUniqueNonEmptyValuesQuery("expenditure"),
    ]);

    uniqueNotation.value = notation;
    uniqueCreatedUser.value = createdUser;
    uniqueExpenditure.value = expenditure;

    if (uniqueNotation.value) {
      uniqueNotation.value = Array.from(
        new Set(
          uniqueNotation.value
            .filter((item) => item && !item.includes("��"))
            .map((item) => item.trim())
            .sort((a, b) => a.localeCompare(b))
        )
      );
    }

    if (uniqueCreatedUser.value) {
      uniqueCreatedUser.value = Array.from(
        new Set(
          uniqueCreatedUser.value
            .filter((item) => item && !item.includes("��"))
            .map((item) => item.trim())
            .sort((a, b) => a.localeCompare(b))
        )
      );
    }
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

let copyArrayOurRansom = ref<Array<IOurRansom>>([]);
let copyArrayClientRansom = ref<Array<IClientRansom>>([]);
let ourRansomRows = ref<Array<IOurRansom>>([]);
let clientRansomRows = ref<Array<IClientRansom>>([]);

function getAllSumDirector() {
  copyArrayOurRansom.value = ourRansomRows.value?.filter(
    (row) =>
      row.issued !== null &&
      (row.additionally === "Оплата наличными" ||
        row.additionally === "Отказ клиент наличные" ||
        row.additionally === "Отказ клиент")
  );

  copyArrayClientRansom.value = clientRansomRows.value?.filter(
    (row) => row.issued !== null && row.additionally === "Оплата наличными"
  );

  let sumOfPVZ = rowsBalance.value
    ?.filter(
      (row) =>
        row.received !== null &&
        (row.recipient === "Директор" || row.recipient === "Власенкова")
    )
    .reduce((acc, value) => acc + +value.sum, 0);

  let sumOfPVZ1 = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        row.typeOfExpenditure !== "Пополнение баланса" &&
        row.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
        row.typeOfExpenditure !== "Новый кредит нал" &&
        row.typeOfExpenditure !== "Постоплата WB" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал" &&
        row.type === "Нал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  const march312024 = new Date("2024-04-01");

  let sumOfPVZ2 = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        (row.issuedUser === "Директор" ||
          row.issuedUser === "Директор (С)" ||
          row.issuedUser === "Власенкова") &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал" &&
        row.type === "Нал" &&
        row.date &&
        new Date(row.date) >= march312024
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ3 = rows.value
    ?.filter(
      (row) =>
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        !row.issuedUser &&
        row.type === "Нал" &&
        row.typeOfExpenditure !== "Кредитовый баланс нал" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал" &&
        row.typeOfExpenditure !== "Удержания с сотрудников"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ13 = rows.value
    ?.filter(
      (row) =>
        row.type === "Нал" &&
        row.typeOfExpenditure === "Удержания с сотрудников"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ4 = rowsDelivery.value
    ?.filter(
      (row) =>
        row.paid !== null && row.paid && new Date(row.paid) >= march312024
    )
    .reduce((acc, value) => acc + +value.amountFromClient3, 0);

  let sumOfPVZ5 = rowsBalanceOnline.value?.reduce(
    (acc, value) => acc + +value.sum,
    0
  );

  let sumOfPVZ6 = rowsOurRansom.value
    ?.filter((row) => row.verified !== null)
    .reduce((acc, value) => acc + +value.priceRefund, 0);

  let sumOfPVZ7 = rowsOurRansom.value
    ?.filter(
      (row) =>
        row.additionally === "Отказ брак" ||
        row.additionally === "Отказ подмена"
    )
    .reduce((acc, value) => acc + +value.priceSite, 0);

  let sumOfPVZ8 = rowsOurRansom.value
    ?.filter(
      (row) =>
        row.additionally === "Отказ клиент наличные" ||
        row.additionally === "Отказ клиент"
    )
    .reduce((acc, value) => acc + +value.priceSite, 0);

  let sumOfPVZ9 = rowsOurRansom.value
    ?.filter(
      (row) =>
        row.additionally !== "Отказ клиент наличные" &&
        row.additionally !== "Отказ клиент безнал" &&
        row.additionally !== "Отказ клиент" &&
        row.additionally !== "Отказ брак" &&
        row.additionally !== "Отказ подмена"
    )
    .reduce((acc, value) => acc + +value.priceSite, 0);

  let sumOfPVZ10 = rowsOurRansom.value
    ?.filter(
      (row) =>
        row.additionally !== "Отказ клиент наличные" &&
        row.additionally !== "Отказ клиент" &&
        row.additionally !== "Отказ брак" &&
        row.additionally !== "Отказ подмена"
    )
    .reduce((acc, value) => acc + +value.deliveredKGT, 0);

  let sumOfPVZ11 = rows.value
    ?.filter(
      (row) =>
        ((row.createdUser === "Директор" && row.issuedUser === "Директор") ||
          (row.createdUser === "Власенкова" &&
            row.issuedUser === "Власенкова")) &&
        row.type === "Нал" &&
        row.typeOfExpenditure === "Перевод с баланса безнал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ12 = rows.value
    ?.filter(
      (row) =>
        ((row.createdUser === "Директор" && row.issuedUser === "Директор") ||
          (row.createdUser === "Власенкова" &&
            row.issuedUser === "Власенкова")) &&
        row.type === "Безнал" &&
        row.typeOfExpenditure === "Перевод с баланса нал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ1Cashless = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        row.typeOfExpenditure !== "Пополнение баланса" &&
        row.typeOfExpenditure !== "Перевод с кредитного баланса безнал" &&
        row.typeOfExpenditure !== "Новый кредит безнал" &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.type === "Безнал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ2Cashless = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        (row.issuedUser === "Директор" ||
          row.issuedUser === "Директор (С)" ||
          row.issuedUser === "Власенкова") &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал" &&
        row.type === "Безнал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ3Cashless = rows.value
    ?.filter(
      (row) =>
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        !row.issuedUser &&
        row.type === "Безнал" &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.typeOfExpenditure !== "Кредитовый баланс безнал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ4Cashless = rows.value
    ?.filter(
      (row) =>
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        (row.issuedUser === "Директор" ||
          row.issuedUser === "Директор (С)" ||
          row.issuedUser === "Власенкова") &&
        row.type === "Нал" &&
        row.typeOfExpenditure === "Перевод с баланса безнал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ5Cashless = rows.value
    ?.filter(
      (row) =>
        (row.createdUser === "Директор" || row.createdUser === "Власенкова") &&
        (row.issuedUser === "Директор" ||
          row.issuedUser === "Директор (С)" ||
          row.issuedUser === "Власенкова") &&
        row.type === "Безнал" &&
        row.typeOfExpenditure === "Перевод с баланса нал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  sumOfPVZ = sumOfPVZ === undefined ? 0 : sumOfPVZ;
  sumOfPVZ1 = sumOfPVZ1 === undefined ? 0 : sumOfPVZ1;
  sumOfPVZ2 = sumOfPVZ2 === undefined ? 0 : sumOfPVZ2;
  sumOfPVZ3 = sumOfPVZ3 === undefined ? 0 : sumOfPVZ3;
  sumOfPVZ4 = sumOfPVZ4 === undefined ? 0 : sumOfPVZ4;
  sumOfPVZ5 = sumOfPVZ5 === undefined ? 0 : sumOfPVZ5;
  sumOfPVZ6 = sumOfPVZ6 === undefined ? 0 : sumOfPVZ6;
  sumOfPVZ7 = sumOfPVZ7 === undefined ? 0 : sumOfPVZ7;
  sumOfPVZ8 = sumOfPVZ8 === undefined ? 0 : sumOfPVZ8;
  sumOfPVZ9 = sumOfPVZ9 === undefined ? 0 : sumOfPVZ9;
  sumOfPVZ10 = sumOfPVZ10 === undefined ? 0 : sumOfPVZ10;
  sumOfPVZ11 = sumOfPVZ11 === undefined ? 0 : sumOfPVZ11;
  sumOfPVZ12 = sumOfPVZ12 === undefined ? 0 : sumOfPVZ12;
  sumOfPVZ13 = sumOfPVZ13 === undefined ? 0 : sumOfPVZ13;
  sumOfPVZ1Cashless = sumOfPVZ1Cashless === undefined ? 0 : sumOfPVZ1Cashless;
  sumOfPVZ2Cashless = sumOfPVZ2Cashless === undefined ? 0 : sumOfPVZ2Cashless;
  sumOfPVZ3Cashless = sumOfPVZ3Cashless === undefined ? 0 : sumOfPVZ3Cashless;
  sumOfPVZ4Cashless = sumOfPVZ4Cashless === undefined ? 0 : sumOfPVZ4Cashless;
  sumOfPVZ5Cashless = sumOfPVZ5Cashless === undefined ? 0 : sumOfPVZ5Cashless;
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
        149000 +
        sumOfPVZ1 +
        sumOfPVZ13 +
        332531 +
        1477830;

      allSum2.value =
        +sumOfPVZ1Cashless +
        +sumOfPVZ2Cashless -
        +sumOfPVZ3Cashless -
        +sumOfPVZ4Cashless +
        +sumOfPVZ5Cashless;
      break;

    case "Власенкова":
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
        149000 +
        sumOfPVZ1 +
        sumOfPVZ13 +
        332531 +
        1477830;

      allSum2.value =
        +sumOfPVZ1Cashless +
        +sumOfPVZ2Cashless -
        +sumOfPVZ3Cashless -
        +sumOfPVZ4Cashless +
        +sumOfPVZ5Cashless;
      break;

    default:
      allSum.value =
        +sumOfPVZ - +sumOfPVZ1 + +sumOfPVZ2 - +sumOfPVZ3 + +sumOfPVZ4;
      break;
  }
  getSumCreditCash();
  getSumCreditOnline();
  getSumCashWB();
  getSumCreditBalance();
  return allSum.value + allSum2.value - 19008030;
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
          row.typeOfExpenditure ===
            "Списание кредитной задолженности торговой империи" &&
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
          row.typeOfExpenditure ===
            "Списание кредитной задолженности торговой империи" &&
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
      sumOfPVZ1 - sumOfPVZ2 - 100000 - 1600000 < 0
        ? 0
        : sumOfPVZ1 - sumOfPVZ2 - 100000 - 1600000;
    sumCreditBalanceDebt.value =
      sumOfPVZ1Debt - sumOfPVZ2Debt + 1700000 < 0
        ? 0
        : sumOfPVZ1Debt - sumOfPVZ2Debt + 1700000;
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
    rowData.value.typeOfExpenditure ===
      "Списание кредитной задолженности торговой империи" ||
    rowData.value.typeOfExpenditure ===
      "Списание балансовой задолженности торговой империи" ||
    rowData.value.typeOfExpenditure ===
      "Перевод в междубалансовый, кредитный баланс"
  ) {
    rowData.value.PVZ = "";
    rowData.value.issuedUser = "";
    rowData.value.date = storeUsers.getISODate(new Date());
    rowData.value.company = "";
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
    rowData.value.company = "";
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
  rowData.value.expenditure = row.expenditure;
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
  rowData.value.company = "W/O/Я start";
  rowData.value.expenditure = row.expenditure;
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
  rowData.value.company = row.company;
  rowData.value.expenditure = row.expenditure;
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

let pvz = ref([
  "Ряженое",
  "Алексеевка",
  "Латоново",
  "Надежда",
  "Александровка",
  "Новониколаевка",
  "Политотдельское",
  "Мещерино",
  "Коломенское ЯМ",
  "Коломенское WB",
  "Бессоново WB",
  "Бессоново OZ",
  "Новоандриановка",
  "Офис",
  "НаДом",
]);

pvz.value = pvz.value.sort((a, b) => a.localeCompare(b, "ru"));

pvz.value.push("ПВЗ_1");
pvz.value.push("ПВЗ_2");
pvz.value.push("ПВЗ_3");
pvz.value.push("ПВЗ_4");
pvz.value.push("ППВЗ_5");
pvz.value.push("ППВЗ_7");
pvz.value.push("ПВЗ_8");
pvz.value.push("ППВЗ_9");
pvz.value.push("ПВЗ_10");
pvz.value.push("ПВЗ_11");
pvz.value.push("ППВЗ_12");
pvz.value.push("ПВЗ_13");
pvz.value.push("Магазин");

let typesOfExpenditure = ref([
  "Передача денежных средств",
  "Сопутствующие расходы",
  "Автомобили",
  "Ежемесячные платежи",
  "Оплата ФОТ",
  "Удержания с сотрудников",
  "Оплата Налоги. ПФР, СОЦ и т.д.",
  "Вывод дивидендов",
  "Расходники для ПВЗ",
  "Перевод в междубалансовый, кредитный баланс",
  "Списание кредитной задолженности торговой империи",
]);

let companies = ref([
  "W/O/Я start",
  "Darom.pro",
  "Сортировка",
  "Доставка",
  "Чаевые",
]);

let usersOfIssued = ref([
  "+7",
  "Алиса",
  "Василенко",
  "Волошина",
  "Горцуева",
  "Директор (С)",
  "КассаЯМ",
  "Косой",
  "Кулешов",
  "Мешков",
  "Рейзвих",
  "Сошников",
  "Шарафаненко",
  "Шведова",
]);

import { createClient } from "@supabase/supabase-js";
import { useToast } from "vue-toastification";
import { useBanksStore } from "~/stores/banks";

const supabase = createClient(
  "https://fomoljxhkywsdgnchewy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbW9sanhoa3l3c2RnbmNoZXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1ODMwMTksImV4cCI6MjAzOTE1OTAxOX0.ItZhBr3_OBP0nii6RX-jy9Q7hu2qvNQ2UBVZNJyZDFs"
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
    rowData.value.typeOfExpenditure ===
      "Списание кредитной задолженности торговой империи" &&
    +rowData.value.expenditure > +sumCreditOnlineDebt.value &&
    rowData.value.type === "Безнал"
  ) {
    toast.error("Задолженность кредита меньше чем вписанная сумма!");
    return;
  } else if (
    rowData.value.typeOfExpenditure ===
      "Списание кредитной задолженности торговой империи" &&
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
    !rowData.value.company &&
    rowData.value.typeOfExpenditure !== "Передача денежных средств" &&
    rowData.value.typeOfExpenditure !==
      "Списание кредитной задолженности торговой империи" &&
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
    toast.error("Выберите компанию!");
    return;
  } else if (
    !rowData.value.PVZ &&
    rowData.value.typeOfExpenditure !== "Передача денежных средств" &&
    rowData.value.typeOfExpenditure !==
      "Списание кредитной задолженности торговой империи" &&
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
          "Авансовый отчёт: Darom.pro",
          `Подтвердите получение денежных средств`,
          rowData.value.issuedUser
        );
      } else {
        await storeUsers.sendMessageToEmployee(
          "Авансовый отчёт: Darom.pro",
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

    if (
      (rowData.value.typeOfExpenditure === "Перевод с баланса безнал" ||
        rowData.value.typeOfExpenditure === "Новый кредит безнал" ||
        rowData.value.typeOfExpenditure === "Пополнение баланса" ||
        rowData.value.typeOfExpenditure === "Удержания с сотрудников") &&
      rowData.value.type === "Безнал" &&
      user.value.username !== "Горцуева"
    ) {
      banks.value = await storeBanks.getBanks();
      let idMainBank = banks.value.find((bank) => bank.main === true)?.id;
      let maxIdRowData = rows.value.reduce((maxRow: any, currentRow: any) => {
        return currentRow.id > (maxRow?.id || -Infinity) ? currentRow : maxRow;
      }, null);

      let transaction = {
        type: "incoming",
        sum: Number(rowData.value.expenditure),
        createdUser: user.value.username,
        fromBankId: idMainBank,
        toBankId: idMainBank,
        idRow: maxIdRowData.id + 1,
      } as any;

      await storeBanks.createTransaction(transaction);
    } else if (
      rowData.value.typeOfExpenditure !== "Перевод с баланса безнал" &&
      rowData.value.typeOfExpenditure !== "Новый кредит безнал" &&
      rowData.value.typeOfExpenditure !== "Пополнение баланса" &&
      rowData.value.typeOfExpenditure !== "Удержания с сотрудников" &&
      rowData.value.type === "Безнал" &&
      user.value.username !== "Горцуева"
    ) {
      banks.value = await storeBanks.getBanks();
      let idMainBank = banks.value.find((bank) => bank.main === true)?.id;
      let maxIdRowData = rows.value.reduce((maxRow: any, currentRow: any) => {
        return currentRow.id > (maxRow?.id || -Infinity) ? currentRow : maxRow;
      }, null);

      let transaction = {
        type: "expenditure",
        sum: Number(rowData.value.expenditure),
        createdUser: user.value.username,
        fromBankId: idMainBank,
        toBankId: idMainBank,
        idRow: maxIdRowData.id + 1,
      } as any;

      await storeBanks.createTransaction(transaction);
    } else if (
      rowData.value.typeOfExpenditure !== "Перевод с баланса безнал" &&
      rowData.value.typeOfExpenditure !== "Новый кредит безнал" &&
      rowData.value.typeOfExpenditure !== "Пополнение баланса" &&
      rowData.value.typeOfExpenditure !== "Удержания с сотрудников" &&
      rowData.value.type === "Безнал" &&
      user.value.username === "Горцуева"
    ) {
      banks.value = await storeBanks.getBanks();
      let idMainBank = banks.value.find((bank) => bank.main === true)?.id;
      let maxIdRowData = rows.value.reduce((maxRow: any, currentRow: any) => {
        return currentRow.id > (maxRow?.id || -Infinity) ? currentRow : maxRow;
      }, null);

      let transaction = {
        type: "expenditure",
        sum: Number(rowData.value.expenditure),
        createdUser: user.value.username,
        fromBankId: 5,
        toBankId: 5,
        idRow: maxIdRowData.id + 1,
      } as any;

      await storeBanks.createTransaction(transaction);
    } else if (
      (rowData.value.typeOfExpenditure === "Перевод с баланса безнал" ||
        rowData.value.typeOfExpenditure === "Новый кредит безнал" ||
        rowData.value.typeOfExpenditure === "Пополнение баланса" ||
        rowData.value.typeOfExpenditure === "Удержания с сотрудников") &&
      rowData.value.type === "Безнал" &&
      user.value.username === "Горцуева"
    ) {
      banks.value = await storeBanks.getBanks();
      let idMainBank = banks.value.find((bank) => bank.main === true)?.id;
      let maxIdRowData = rows.value.reduce((maxRow: any, currentRow: any) => {
        return currentRow.id > (maxRow?.id || -Infinity) ? currentRow : maxRow;
      }, null);

      let transaction = {
        type: "incoming",
        sum: Number(rowData.value.expenditure),
        createdUser: user.value.username,
        fromBankId: 5,
        toBankId: 5,
        idRow: maxIdRowData.id + 1,
      } as any;

      await storeBanks.createTransaction(transaction);
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
    rowData.value.typeOfExpenditure ===
      "Списание кредитной задолженности торговой империи" &&
    +rowData.value.expenditure > +sumCreditOnlineDebt.value &&
    rowData.value.type === "Безнал"
  ) {
    toast.error("Задолженность кредита меньше чем вписанная сумма!");
    return;
  } else if (
    rowData.value.typeOfExpenditure ===
      "Списание кредитной задолженности торговой империи" &&
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
    await storeAdvanceReports.updateAdvanceReport(rowData.value);
  }

  if (
    (rowData.value.typeOfExpenditure === "Перевод с баланса безнал" ||
      rowData.value.typeOfExpenditure === "Новый кредит безнал" ||
      rowData.value.typeOfExpenditure === "Пополнение баланса" ||
      rowData.value.typeOfExpenditure === "Удержания с сотрудников") &&
    rowData.value.type === "Безнал"
  ) {
    transactions.value = await storeBanks.getTransactions();

    let currentTransaction = transactions.value.find(
      (row) => row.idRow === rowData.value.id
    );

    if (currentTransaction) {
      currentTransaction.sum = Number(rowData.value.expenditure);
      await storeBanks.updateTransaction(currentTransaction);
    }
  } else if (
    rowData.value.typeOfExpenditure !== "Перевод с баланса безнал" &&
    rowData.value.typeOfExpenditure !== "Новый кредит безнал" &&
    rowData.value.typeOfExpenditure !== "Пополнение баланса" &&
    rowData.value.typeOfExpenditure !== "Удержания с сотрудников" &&
    rowData.value.type === "Безнал"
  ) {
    transactions.value = await storeBanks.getTransactions();

    let currentTransaction = transactions.value.find(
      (row) => row.idRow === rowData.value.id
    );

    if (currentTransaction) {
      currentTransaction.sum = Number(rowData.value.expenditure);
      await storeBanks.updateTransaction(currentTransaction);
    }
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
    await storeBanks.deleteTransaction(id.id);
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
  copyArrayOurRansom.value = ourRansomRows.value?.filter(
    (row) =>
      row.issued !== null &&
      (row.additionally === "Оплата наличными" ||
        row.additionally === "Отказ клиент наличные" ||
        row.additionally === "Отказ клиент")
  );

  copyArrayClientRansom.value = clientRansomRows.value?.filter(
    (row) => row.issued !== null && row.additionally === "Оплата наличными"
  );

  let totalSum = 0;

  usersOfIssued.value
    .filter(
      (username) =>
        username !== "Директор" &&
        username !== "Директор (С)" &&
        username !== "Власенкова"
    )
    .forEach((username) => {
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
      sumOfPVZ = sumOfPVZ === undefined ? 0 : sumOfPVZ;
      sumOfPVZ1 = sumOfPVZ1 === undefined ? 0 : sumOfPVZ1;
      sumOfPVZ2 = sumOfPVZ2 === undefined ? 0 : sumOfPVZ2;
      sumOfPVZ3 = sumOfPVZ3 === undefined ? 0 : sumOfPVZ3;
      let allSum = +sumOfPVZ - +sumOfPVZ1 + +sumOfPVZ2 - +sumOfPVZ3;
      totalSum += allSum;
    });
  totalSum += allSum.value;
  totalSum -= 19008030;
  totalSum -= 3247;
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
  linkPhoto.value = `https://fomoljxhkywsdgnchewy.supabase.co/storage/v1/object/public/image/img-${
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

function checkExpenditure() {
  if (rowData.value.expenditure) {
    rowData.value.expenditure = rowData.value.expenditure.replace(",", ".");
    rowData.value.expenditure = rowData.value.expenditure.replace(
      /(?!^-)[^0-9.]/g,
      ""
    );
    if (rowData.value.expenditure.indexOf("-") > 0) {
      rowData.value.expenditure = rowData.value.expenditure.replace("-", "");
    }
  }
}

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
  { value: "Перевод с кредитного баланса нал", label: "С кредитного баланса" },
  { value: "Перевод с баланса безнал", label: "С баланса безнал" },
  { value: "Постоплата WB", label: "Постоплата WB" },
];

const typeOfOptions2 = [
  { value: "Новый кредит безнал", label: "Новый" },
  { value: "Пополнение баланса", label: "Нет" },
  {
    value: "Перевод с кредитного баланса безнал",
    label: "С кредитного баланса",
  },
  { value: "Перевод с баланса нал", label: "С баланса нал" },
];

let isShowBanks = ref(false);

let banks = ref<Array<Bank>>([]);
let transactions = ref<Array<Transaction>>([]);

async function updateBanksData() {
  idSelectedBank.value = Number(idSelectedBank.value);
  const prevCurrentBank = banks.value.find((bank) => bank.main === true);

  if (prevCurrentBank) {
    prevCurrentBank.main = false;
  }

  const currentBank = banks.value.find(
    (bank) => bank.id === idSelectedBank.value
  );

  if (currentBank) {
    currentBank.main = true;
  }

  await storeBanks.updateBanks(banks.value);
}

let idSelectedBank = ref();
// watch(idSelectedBank, editMainBank);

let isShowTransactions = ref(false);
let isShowFromBanksChoice = ref(false);
let isShowToBanksChoice = ref(false);

const storeBanks = useBanksStore();

async function openModalBanks() {
  isLoadingBanks.value = true;
  isShowBanks.value = true;
  banks.value = await storeBanks.getBanks();
  transactions.value = await storeBanks.getTransactions();

  banks.value.forEach((bank: Bank) => {
    transactions.value.forEach((transaction: Transaction) => {
      if (
        bank.id === transaction.fromBankId &&
        transaction.type === "transfer"
      ) {
        bank.money -= Number(transaction.sum);
      } else if (
        bank.id === transaction.toBankId &&
        transaction.type === "transfer"
      ) {
        bank.money += Number(transaction.sum);
      } else if (
        bank.id === transaction.toBankId &&
        bank.id === transaction.fromBankId &&
        transaction.type === "incoming"
      ) {
        bank.money += Number(transaction.sum);
      } else if (
        bank.id === transaction.toBankId &&
        bank.id === transaction.fromBankId &&
        transaction.type === "expenditure"
      ) {
        bank.money -= Number(transaction.sum);
      }
    });
  });

  let idMainBank = banks.value.find((bank) => bank.main === true)?.id;
  idSelectedBank.value = idMainBank;
  idFromBank.value = idMainBank;
  fromBank.value = banks.value.find((bank) => bank.id === idMainBank);
  idToBank.value = idFromBank.value === 1 ? 2 : 1;
  toBank.value = banks.value.find((bank) => bank.id === idToBank.value);
  isLoadingBanks.value = false;
}

function closeModalBanks() {
  isShowBanks.value = false;
}

function openModalTransactions() {
  isShowTransactions.value = true;
  let idMainBank = banks.value.find((bank) => bank.main === true)?.id;
  idSelectedBank.value = idMainBank;
  idFromBank.value = idMainBank;
  fromBank.value = banks.value.find((bank) => bank.id === idMainBank);
  idToBank.value = idFromBank.value === 1 ? 2 : 1;
  toBank.value = banks.value.find((bank) => bank.id === idToBank.value);
  isShowBanks.value = false;
}

function closeModalTransactions() {
  isShowTransactions.value = false;
  isShowBanks.value = true;
}

function openModalFromBanksChoice() {
  isShowTransactions.value = false;
  isShowFromBanksChoice.value = true;
}

function closeModalFromBanksChoice() {
  isShowTransactions.value = true;
  isShowFromBanksChoice.value = false;
}

function openModalToBanksChoice() {
  isShowTransactions.value = false;
  isShowToBanksChoice.value = true;
}

function closeModalToBanksChoice() {
  isShowTransactions.value = true;
  isShowToBanksChoice.value = false;
}

let idFromBank = ref();
let fromBank = ref({} as any);
let idToBank = ref();
let toBank = ref({} as any);
let sumOfTransaction = ref("");

function validationSumOfTransaction() {
  sumOfTransaction.value = sumOfTransaction.value.replace(/[^0-9]/g, "");
}

watch(() => sumOfTransaction.value, validationSumOfTransaction);
watch(() => sumOfTransaction.value, checkValidationTransaction);

function changeBanks() {
  let copyFromBank = {};
  let copyToBank = {};

  Object.assign(copyFromBank, fromBank.value);
  Object.assign(copyToBank, toBank.value);

  fromBank.value = copyToBank;
  toBank.value = copyFromBank;
}

let isLoadingTransactions = ref(false);
let isLoadingBanks = ref(false);

function changeToBank(bank: any) {
  toBank.value = bank;
  if (toBank.value.id === fromBank.value.id) {
    fromBank.value = {};
  }
  closeModalToBanksChoice();
}

function changeFromBank(bank: any) {
  fromBank.value = bank;
  if (fromBank.value.id === toBank.value.id) {
    toBank.value = {};
  }
  closeModalFromBanksChoice();
}

function checkValidationTransaction() {
  if (!sumOfTransaction.value || sumOfTransaction.value === "0") {
    return true;
  }

  if (!fromBank.value.money || fromBank.value.money === "0") {
    return true;
  }

  if (!fromBank.value.id || !toBank.value.id) {
    return true;
  }

  if (Number(fromBank.value.money) < Number(sumOfTransaction.value)) {
    return true;
  }

  return false;
}

async function createTransaction() {
  isLoadingTransactions.value = true;
  let transaction = {
    sum: Number(sumOfTransaction.value),
    fromBankId: fromBank.value.id,
    toBankId: toBank.value.id,
    createdUser: user.value.username,
    type: "transfer",
  } as Transaction;
  await storeBanks.createTransaction(transaction);
  closeModalTransactions();
  await openModalBanks();
  sumOfTransaction.value = "";
  isLoadingTransactions.value = false;
}

let isShowHistoryTransactions = ref(false);

function openModalHistoryTransactions() {
  isShowTransactions.value = false;
  isShowHistoryTransactions.value = true;
}

function closeModalHistoryTransactions() {
  isShowTransactions.value = true;
  isShowHistoryTransactions.value = false;
}

let idBankForHistory = ref(2);
function showBankTransactions(id: number) {
  if (idBankForHistory.value === id) {
    idBankForHistory.value = 0;
  } else {
    idBankForHistory.value = id;
  }
}
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
                <h1 class="text-xl text-center">
                  Междубалансовый, кредитный <br />
                  баланс нал
                </h1>
                <h1 class="text-center text-2xl text-secondary-color mb-5">
                  {{ formatNumber(sumCreditCash) }} ₽
                </h1>
                <h1 class="text-xl text-center">Кредитная задолженность</h1>
                <h1 class="text-center text-2xl text-secondary-color mb-5">
                  {{ formatNumber(sumCreditCashDebt) }} ₽
                </h1>
                <h1 class="text-xl text-center">WB задолженность</h1>
                <h1 class="text-center text-2xl text-secondary-color mb-5">
                  {{ formatNumber(sumCashWB) }} ₽
                </h1>
                <h1 class="text-xl text-center">
                  Междубалансовая задолженность
                </h1>
                <h1
                  class="text-center text-2xl text-secondary-color mb-5"
                  v-if="sumCreditBalanceDebt <= 0"
                >
                  {{ formatNumber(sumCreditBalance) }} ₽
                </h1>
                <h1
                  class="text-center text-2xl text-secondary-color mb-5"
                  v-else
                >
                  0 ₽
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
              v-if="
                selectedUser !== 'Директор' &&
                selectedUser !== 'Директор (С)' &&
                selectedUser !== 'Власенкова'
              "
            >
              <h1>Баланс {{ selectedUser }}:</h1>
              <h1 class="font-bold text-secondary-color text-4xl text-center">
                {{ formatNumber(getAllSumFromName(selectedUser)) }} ₽
              </h1>
            </div>
            <div
              class="text-center text-2xl my-5"
              v-if="selectedUser === 'Директор (С)'"
            >
              <h1>Баланс {{ selectedUser }}:</h1>
              <h1 class="font-bold text-secondary-color text-4xl text-center">
                {{ formatNumber(allSum - 19008030 - 91594) }} ₽
              </h1>
            </div>
            <div
              v-if="
                selectedUser === 'Директор' || selectedUser === 'Власенкова'
              "
            >
              <div class="flex items-center flex-col mb-3">
                <div class="text-center text-xl my-3">
                  <h1>Баланс Торговой Империи онлайн&наличные:</h1>
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
                  Пополнение баланса (нал)
                </UIMainButton>
              </div>

              <div class="flex items-center flex-col mb-10">
                <div class="text-center text-xl my-3">
                  <h1>
                    Баланс Торговой Империи <br />
                    безнал:
                  </h1>
                  <div class="flex items-center justify-center gap-3 mt-1">
                    <Icon
                      name="i-material-symbols-shadow-add"
                      size="30"
                      class="text-secondary-color hover:opacity-50 cursor-pointer duration-200"
                      @click="openModalBanks"
                    />
                    <h1
                      class="font-bold text-secondary-color text-4xl text-center"
                    >
                      {{ formatNumber(Math.ceil(allSum2 - 105101)) }} ₽
                    </h1>
                    <Icon
                      name="solar:money-bag-bold"
                      size="30"
                      class="text-secondary-color hover:opacity-50 cursor-pointer duration-200"
                      @click="
                        isShowCreditBalanceOnline = !isShowCreditBalanceOnline
                      "
                    />
                  </div>
                </div>
                <UIMainButton
                  class="max-sm:w-full max-w-[400px]"
                  v-if="
                    user.username === 'Директор' ||
                    user.username === 'Власенкова'
                  "
                  @click="openModalAdminOOO"
                >
                  Пополнение баланса (безнал)
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
                <option value="Директор">Торговая Империя</option>
                <option :value="user" v-for="user in usersOfIssued">
                  {{ user }}
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
                Создание аван. документа (нал)
              </UIMainButton>
              <div class="max-sm:hidden">
                <Icon
                  class="text-secondary-color"
                  name="tdesign:money"
                  size="24"
                />
              </div>
            </div>

            <div
              class="flex items-center gap-3 w-full max-w-[400px] max-sm:max-w-full"
              v-if="
                user.username === 'Директор' ||
                user.username === 'Власенкова' ||
                user.username === 'Горцуева'
              "
            >
              <UIMainButton
                class="w-full max-sm:max-w-[400px] mx-auto max-sm:text-sm"
                @click="openModal(rowData, 'ONLINE')"
              >
                Создание аван. документа (безнал)
              </UIMainButton>
              <div class="max-sm:hidden">
                <Icon
                  class="text-secondary-color"
                  name="hugeicons:credit-card-pos"
                  size="24"
                />
              </div>
            </div>
          </div>

          <AdvanceReportTable
            v-if="
              selectedUser !== 'Директор (С)' &&
              selectedUser !== 'Директор' &&
              selectedUser !== 'Власенкова'
            "
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
            v-if="selectedUser === 'Директор (С)'"
            :rows="
              filteredRows?.filter(
                (row) =>
                  row.issuedUser === 'Директор' ||
                  row.createdUser === 'Директор' ||
                  row.issuedUser === 'Директор (С)' ||
                  row.createdUser === 'Директор (С)'
              )
            "
            :user="user"
            @open-modal="openModal"
            @update-delivery-row="updateDeliveryRow"
            @delete-row="deleteRow"
          />

          <AdvanceReportTable
            v-if="selectedUser === 'Директор' || selectedUser === 'Власенкова'"
            :rows="filteredRows"
            :user="user"
            @open-modal="openModal"
            @update-delivery-row="updateDeliveryRow"
            @delete-row="deleteRow"
          />
        </div>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-auto-animate
          v-model="isShowBanks"
          prevent-close
        >
          <UCard
            v-auto-animate
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Банки
                </h3>
                <Icon
                  @click="closeModalBanks"
                  name="i-heroicons-x-mark-20-solid"
                  size="24"
                  class="cursor-pointer hover:text-secondary-color duration-200"
                />
              </div>
            </template>
            <div v-if="!isLoadingBanks" class="text-center">
              <div class="flex items-start flex-col">
                <h1 class="mb-2">Выбор активного банка</h1>
                <USelect
                  class="w-full"
                  v-model="idSelectedBank"
                  :options="banks"
                  option-attribute="name"
                  value-attribute="id"
                  @change="updateBanksData"
                />
              </div>
              <div v-for="bank in banks" class="my-5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-3">
                      <img
                        alt="name"
                        :src="bank.img"
                        className="w-10 h-10 rounded-full border-[1px] shadow-inner bg-white"
                      />
                      <h1>{{ bank.name }}</h1>
                    </div>
                    <h1
                      :class="{
                        'text-secondary-color': idSelectedBank === bank.id,
                      }"
                      class="text-xl font-semibold"
                    >
                      {{ formatNumber(bank.money) }} ₽
                    </h1>
                  </div>
                </div>
              </div>
              <UButton
                @click="openModalTransactions"
                class="font-semibold"
                icon="i-mdi-bank"
                >Перевод между счетами</UButton
              >
            </div>
            <div v-else>
              <UISpinnerModal />
            </div>
          </UCard>
        </UModal>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-auto-animate
          v-model="isShowTransactions"
          prevent-close
        >
          <UCard
            v-auto-animate
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Транзакции
                </h3>
                <Icon
                  @click="closeModalTransactions"
                  name="i-heroicons-x-mark-20-solid"
                  size="24"
                  class="cursor-pointer hover:text-secondary-color duration-200"
                />
              </div>
            </template>
            <div v-if="!isLoadingTransactions">
              <div
                :class="{ 'bg-red-200': !fromBank.id }"
                @click="openModalFromBanksChoice"
                class="bg-gray-100 flex items-center justify-between rounded-md px-5 py-2 font-semibold space-y-1 hover:cursor-pointer"
              >
                <div>
                  <h1
                    :class="{ 'text-red-500': !fromBank.id }"
                    class="text-muted-color text-sm"
                  >
                    Откуда
                  </h1>
                  <div
                    v-if="
                      fromBank.money ||
                      fromBank.money === '0' ||
                      fromBank.money === 0
                    "
                    class="font-bold"
                  >
                    {{ formatNumber(fromBank.money) }} ₽
                  </div>
                  <h1 v-if="fromBank.name" class="text-muted-color">
                    {{ fromBank.name }}
                  </h1>
                </div>
                <div
                  v-if="fromBank.img"
                  class="text-white px-3 py-2 rounded-md"
                >
                  <img
                    alt="name"
                    :src="fromBank.img"
                    className="w-10 h-10 rounded-full border-[1px] shadow-inner bg-white"
                  />
                </div>
              </div>

              <div class="text-center my-5 flex items-center justify-center">
                <div
                  @click="changeBanks"
                  class="hover:text-white max-w-[40px] rounded-full pt-1 px-2 border-[1px] shadow-inner cursor-pointer duration-200 hover:border-secondary-color hover:shadow-none hover:bg-secondary-color font-bold"
                >
                  <Icon
                    class="rotate-90"
                    name="i-system-uicons-reverse"
                    size="24"
                  />
                </div>
              </div>

              <div
                @click="openModalToBanksChoice"
                class="bg-gray-100 flex items-center justify-between rounded-md px-5 py-2 font-semibold space-y-1 hover:cursor-pointer"
                :class="{ 'bg-red-200': !toBank.id }"
              >
                <div>
                  <h1
                    :class="{ 'text-red-500': !toBank.id }"
                    class="text-muted-color text-sm"
                  >
                    Куда
                  </h1>
                  <div
                    v-if="
                      toBank.money || toBank.money === '0' || toBank.money === 0
                    "
                    class="font-bold"
                  >
                    {{ formatNumber(toBank.money) }} ₽
                  </div>
                  <h1 v-if="toBank.name" class="text-muted-color">
                    {{ toBank.name }}
                  </h1>
                </div>
                <div v-if="toBank.img" class="text-white px-3 py-2 rounded-md">
                  <img
                    alt="name"
                    :src="toBank.img"
                    className="w-10 h-10 rounded-full border-[1px] shadow-inner bg-white"
                  />
                </div>
              </div>

              <div
                class="bg-gray-100 mt-5 flex items-center justify-between rounded-md px-5 py-2 font-semibold space-y-1"
              >
                <div class="w-full">
                  <h1 class="text-muted-color mb-2 text-sm">Сколько</h1>
                  <div class="flex items-center justify-between gap-2">
                    <UInput
                      @input="validationSumOfTransaction"
                      class="w-full"
                      v-model="sumOfTransaction"
                      name="searchingQuery"
                      autocomplete="off"
                      :ui="{ icon: { trailing: { pointer: '' } } }"
                    >
                      <template #trailing>
                        <UButton
                          v-show="sumOfTransaction !== ''"
                          color="gray"
                          variant="link"
                          icon="i-heroicons-x-mark-20-solid"
                          :padded="false"
                          @click="sumOfTransaction = ''"
                        />
                      </template>
                    </UInput>
                    <Icon
                      name="i-material-symbols-currency-ruble-rounded"
                      size="24"
                    />
                  </div>
                </div>
              </div>

              <div
                class="flex items-center justify-center w-full mt-5 gap-3 max-sm:flex-col"
              >
                <UButton
                  :disabled="checkValidationTransaction()"
                  @click="createTransaction"
                  class="font-semibold w-full max-w-[200px]"
                  icon="i-icon-park-outline-bank-transfer"
                  >Перевести</UButton
                >
                <UButton
                  @click="openModalHistoryTransactions()"
                  class="font-semibold w-full max-w-[200px]"
                  icon="i-mingcute-history-anticlockwise-line"
                  >История транзакций</UButton
                >
              </div>
            </div>
            <div v-else>
              <UISpinnerModal />
            </div>
          </UCard>
        </UModal>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-auto-animate
          v-model="isShowToBanksChoice"
          prevent-close
        >
          <UCard
            v-auto-animate
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Куда
                </h3>
                <Icon
                  @click="closeModalToBanksChoice"
                  name="i-heroicons-x-mark-20-solid"
                  size="24"
                  class="cursor-pointer hover:text-secondary-color duration-200"
                />
              </div>
            </template>
            <div class="text-center">
              <div
                v-for="bank in banks"
                class="mb-5 hover:bg-secondary-color px-3 py-3 duration-200 rounded-md cursor-pointer border-[1px] hover:text-white"
                @click="changeToBank(bank)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-3">
                      <img
                        alt="name"
                        :src="bank.img"
                        className="w-10 h-10 rounded-full border-[1px] shadow-inner bg-white"
                      />
                      <h1>{{ bank.name }}</h1>
                    </div>
                    <h1 class="text-xl font-semibold">
                      {{ formatNumber(bank.money) }} ₽
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </UModal>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-auto-animate
          v-model="isShowFromBanksChoice"
          prevent-close
        >
          <UCard
            v-auto-animate
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Откуда
                </h3>
                <Icon
                  @click="closeModalFromBanksChoice"
                  name="i-heroicons-x-mark-20-solid"
                  size="24"
                  class="cursor-pointer hover:text-secondary-color duration-200"
                />
              </div>
            </template>
            <div class="text-center">
              <div
                v-for="bank in banks"
                class="mb-5 hover:bg-secondary-color px-3 py-3 duration-200 rounded-md cursor-pointer border-[1px] hover:text-white"
                @click="changeFromBank(bank)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-3">
                      <img
                        alt="name"
                        :src="bank.img"
                        className="w-10 h-10 rounded-full border-[1px] shadow-inner bg-white"
                      />
                      <h1>{{ bank.name }}</h1>
                    </div>
                    <h1 class="text-xl font-semibold">
                      {{ formatNumber(bank.money) }} ₽
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </UModal>

        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-auto-animate
          v-model="isShowHistoryTransactions"
          prevent-close
        >
          <UCard
            v-auto-animate
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  История транзакций
                </h3>
                <Icon
                  @click="closeModalHistoryTransactions"
                  name="i-heroicons-x-mark-20-solid"
                  size="24"
                  class="cursor-pointer hover:text-secondary-color duration-200"
                />
              </div>
            </template>
            <div class="text-center">
              <div
                v-for="bank in banks"
                class="mb-5 px-3 py-3 duration-200 rounded-md cursor-pointer border-[1px]"
                @click="showBankTransactions(bank.id)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-3">
                      <img
                        alt="name"
                        :src="bank.img"
                        className="w-10 h-10 rounded-full border-[1px] shadow-inner bg-white"
                      />
                      <h1>{{ bank.name }}</h1>
                    </div>
                  </div>
                </div>
                <div v-if="idBankForHistory === bank.id">
                  <div
                    v-if="
                      transactions.filter(
                        (row) =>
                          (row.toBankId === bank.id ||
                            row.fromBankId === bank.id) &&
                          row.type === 'transfer'
                      ).length
                    "
                  >
                    <h1 class="text-xl mt-3 mb-3">Переводы</h1>

                    <div
                      class="bg-gray-100 py-2 px-1 max-h-[300px] overflow-y-scroll rounded-sm"
                    >
                      <div
                        v-for="transaction in transactions.filter(
                          (row) =>
                            (row.toBankId === bank.id ||
                              row.fromBankId === bank.id) &&
                            row.type === 'transfer'
                        )"
                      >
                        <div
                          class="bg-white shadow-md rounded-md py-1 px-2 my-5"
                        >
                          <div
                            class="grid grid-cols-3 gap-3 max-sm:gap-0 max-sm:flex max-sm:flex-col max-sm:items-center"
                          >
                            <div class="flex items-center gap-3">
                              <img
                                alt="name"
                                :src="transaction.fromBank.img"
                                className="w-6 h-6 rounded-full border-[1px] shadow-inner bg-white"
                              />
                              <h1
                                class="whitespace-normal overflow-auto break-all"
                              >
                                {{ transaction.fromBank.name }}
                              </h1>
                            </div>
                            <div>
                              <div class="italic">
                                {{ formatNumber(transaction.sum) }} ₽
                              </div>
                              <Icon
                                :class="{
                                  'text-red-500':
                                    transaction.fromBankId === bank.id,
                                  'text-green-500':
                                    transaction.toBankId === bank.id,
                                }"
                                name="i-material-symbols-line-end-arrow-notch"
                                size="24"
                                class="w-full max-sm:rotate-90"
                              />
                            </div>
                            <div class="flex items-center gap-3">
                              <img
                                alt="name"
                                :src="transaction.toBank.img"
                                className="w-6 h-6 rounded-full border-[1px] shadow-inner bg-white"
                              />
                              <h1
                                class="whitespace-normal overflow-auto break-all"
                              >
                                {{ transaction.toBank.name }}
                              </h1>
                            </div>
                          </div>
                          <div>
                            <h1 class="text-sm italic text-muted-color mt-2">
                              {{
                                storeUsers.getNormalizedDate(
                                  transaction.created_at
                                )
                              }}, {{ transaction.createdUser }}
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="
                      transactions.filter(
                        (row) =>
                          row.toBankId === bank.id &&
                          row.fromBankId === bank.id &&
                          row.type === 'incoming'
                      ).length
                    "
                  >
                    <h1 class="text-xl mt-3 mb-3">Приход</h1>

                    <div
                      class="bg-gray-100 py-2 px-1 max-h-[150px] overflow-y-scroll rounded-sm"
                    >
                      <div
                        v-for="transaction in transactions.filter(
                          (row) =>
                            row.toBankId === bank.id &&
                            row.fromBankId === bank.id &&
                            row.type === 'incoming'
                        )"
                      >
                        <div
                          class="bg-white shadow-md rounded-md py-1 px-2 my-5"
                        >
                          <div
                            class="grid grid-cols-3 gap-3 max-sm:gap-0 max-sm:flex max-sm:flex-col max-sm:items-center"
                          >
                            <div class="flex items-center gap-3">
                              <img
                                alt="name"
                                src="@/assets/images/dp_advance.png"
                                className="w-6 h-6 rounded-full border-[1px] shadow-inner bg-white"
                              />
                              <h1>DAROM.PRO</h1>
                            </div>
                            <div>
                              <div class="italic">
                                {{ formatNumber(transaction.sum) }} ₽
                              </div>
                              <Icon
                                name="i-material-symbols-line-end-arrow-notch"
                                size="24"
                                class="w-full text-green-500 max-sm:rotate-90"
                              />
                            </div>
                            <div class="flex items-center gap-3">
                              <img
                                alt="name"
                                :src="transaction.toBank.img"
                                className="w-6 h-6 rounded-full border-[1px] shadow-inner bg-white"
                              />
                              <h1>{{ transaction.toBank.name }}</h1>
                            </div>
                          </div>
                          <div>
                            <h1 class="text-sm italic text-muted-color mt-2">
                              {{
                                storeUsers.getNormalizedDate(
                                  transaction.created_at
                                )
                              }}, {{ transaction.createdUser }}
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="
                      transactions.filter(
                        (row) =>
                          row.toBankId === bank.id &&
                          row.fromBankId === bank.id &&
                          row.type === 'expenditure'
                      ).length
                    "
                  >
                    <h1 class="text-xl mt-3 mb-3">Расход</h1>

                    <div
                      class="bg-gray-100 py-2 px-1 max-h-[150px] overflow-y-scroll rounded-sm"
                    >
                      <div
                        v-for="transaction in transactions.filter(
                          (row) =>
                            row.toBankId === bank.id &&
                            row.fromBankId === bank.id &&
                            row.type === 'expenditure'
                        )"
                      >
                        <div
                          class="bg-white shadow-md rounded-md py-1 px-2 my-5"
                        >
                          <div
                            class="grid grid-cols-3 gap-3 max-sm:gap-0 max-sm:flex max-sm:flex-col max-sm:items-center"
                          >
                            <div class="flex items-center gap-3">
                              <img
                                alt="name"
                                :src="transaction.toBank.img"
                                className="w-6 h-6 rounded-full border-[1px] shadow-inner bg-white"
                              />
                              <h1>{{ transaction.toBank.name }}</h1>
                            </div>
                            <div>
                              <div class="italic">
                                {{ formatNumber(transaction.sum) }} ₽
                              </div>
                              <Icon
                                name="i-material-symbols-line-end-arrow-notch"
                                size="24"
                                class="w-full text-red-500 max-sm:rotate-90"
                              />
                            </div>
                            <div class="flex items-center gap-3">
                              <img
                                alt="name"
                                src="@/assets/images/dp_advance.png"
                                className="w-6 h-6 rounded-full border-[1px] shadow-inner bg-white"
                              />
                              <h1>DAROM.PRO</h1>
                            </div>
                          </div>
                          <div>
                            <h1 class="text-sm italic text-muted-color mt-2">
                              {{
                                storeUsers.getNormalizedDate(
                                  transaction.created_at
                                )
                              }}, {{ transaction.createdUser }}
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </UModal>

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="material-symbols:file-copy-outline-rounded" />
          </template>
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение: <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else-if="rowData.type === 'Нал'">
              Создание аван. документа Нал
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
                      'Списание кредитной задолженности торговой империи' ||
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
                      'Списание кредитной задолженности торговой империи' ||
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
                      'Списание кредитной задолженности торговой империи' ||
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
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Расход</label>
                <UInput
                  class="w-full"
                  v-model="rowData.expenditure"
                  type="text"
                  @input="checkExpenditure"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="dispatchPVZ1">Статья расхода</label>
                <USelectMenu
                  @change="checkStatus"
                  class="w-full"
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
                <label for="dispatchPVZ1">Компания</label>
                <USelectMenu
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс' ||
                    rowData.typeOfExpenditure === 'Передача денежных средств' ||
                    rowData.typeOfExpenditure === 'Передача денежных средств'
                  "
                  class="w-full"
                  v-model="rowData.company"
                  :options="companies"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Подтверждающий документ</label>
                <UInput
                  v-if="!rowData.supportingDocuments"
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности торговой империи' ||
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

              <div
                class="flex flex-col items-start text-left gap-2 mb-5"
                v-if="
                  user.username === 'Директор' || user.username === 'Власенкова'
                "
              >
                <label for="name">Тип</label>
                <USelectMenu
                  :disabled="rowData.type !== null"
                  class="w-full"
                  value-attribute="value"
                  id-attribute="value"
                  v-model="rowData.type"
                  :options="paymentOptions"
                />
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
            <div class="custom-header" v-else>Пополнение баланса Нал</div>
          </template>
          <template v-slot:body>
            <div class="text-black">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Сумма</label>
                <UInput
                  :disabled="user.role !== 'ADMIN'"
                  class="w-full"
                  v-model="rowData.expenditure"
                  @input="checkExpenditure"
                  type="text"
                />
              </div>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="name">Дата</label>
              <input
                :disabled="
                  rowData.typeOfExpenditure ===
                    'Списание кредитной задолженности торговой империи' ||
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
              />
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="dispatchPVZ1">Компания</label>
              <USelectMenu
                :disabled="
                  rowData.typeOfExpenditure === 'Новый кредит нал' ||
                  rowData.typeOfExpenditure === 'Постоплата WB' ||
                  rowData.typeOfExpenditure === 'Перевод с баланса безнал' ||
                  rowData.typeOfExpenditure ===
                    'Перевод с кредитного баланса нал'
                "
                class="w-full"
                v-model="rowData.company"
                :options="companies"
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
            <div class="custom-header" v-else>Пополнение баланса Безнал</div>
          </template>
          <template v-slot:body>
            <div class="text-black">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Сумма</label>
                <UInput
                  :disabled="user.role !== 'ADMIN'"
                  class="w-full"
                  v-model="rowData.expenditure"
                  @input="checkExpenditure"
                  type="text"
                />
              </div>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="name">Дата</label>
              <input
                :disabled="
                  rowData.typeOfExpenditure ===
                    'Списание кредитной задолженности торговой империи' ||
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
              />
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="dispatchPVZ1">Компания</label>
              <USelectMenu
                :disabled="
                  rowData.typeOfExpenditure === 'Новый кредит безнал' ||
                  rowData.typeOfExpenditure === 'Перевод с баланса нал' ||
                  rowData.typeOfExpenditure ===
                    'Перевод с кредитного баланса безнал'
                "
                class="w-full"
                v-model="rowData.company"
                :options="companies"
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
                Создание аван. документа (нал)
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
              Создание аван. документа Нал
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
                      'Списание кредитной задолженности торговой империи' ||
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
                      'Списание кредитной задолженности торговой империи' ||
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
                      'Списание кредитной задолженности торговой империи' ||
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
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Расход</label>
                <UInput
                  class="w-full"
                  v-model="rowData.expenditure"
                  type="text"
                  @input="checkExpenditure"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="dispatchPVZ1">Статья расхода</label>
                <USelectMenu
                  @change="checkStatus"
                  class="w-full"
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
                <label for="dispatchPVZ1">Компания</label>
                <USelectMenu
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс' ||
                    rowData.typeOfExpenditure === 'Передача денежных средств' ||
                    rowData.typeOfExpenditure === 'Передача денежных средств' ||
                    rowData.typeOfExpenditure === 'Вывод дивидендов'
                  "
                  class="w-full"
                  v-model="rowData.company"
                  :options="companies"
                />
              </div>

              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Подтверждающий документ</label>
                <UInput
                  v-if="!rowData.supportingDocuments"
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности торговой империи' ||
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

              <div
                class="flex flex-col items-start text-left gap-2 mb-5"
                v-if="user.username === 'Директор'"
              >
                <label for="name">Тип</label>
                <USelectMenu
                  :disabled="rowData.type !== null"
                  class="w-full"
                  value-attribute="value"
                  id-attribute="value"
                  v-model="rowData.type"
                  :options="paymentOptions"
                />
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
                    'Списание кредитной задолженности торговой империи' ||
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
