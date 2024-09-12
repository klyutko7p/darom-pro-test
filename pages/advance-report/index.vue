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

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  try {
    user.value = await storeUsers.getUser();
    let advanceReportsPromise;
    let ourRansomRowsPromise;
    let deliveryRowsPromise;

    if (user.value.role === "ADMIN") {
      advanceReportsPromise = storeAdvanceReports.getAdvancedReports();
      ourRansomRowsPromise =
        storeRansom.getRansomRowsForAdvanceReportOurRansom();
      deliveryRowsPromise = storeRansom.getRansomRowsForBalanceDelivery();
    } else {
      advanceReportsPromise = storeAdvanceReports.getAdvancedReports();
    }

    const [
      advanceReportsData,
      ourRansomRowsData,
      deliveryRowsData,
      balanceRowsData,
      onlineBalanceRowsData,
    ] = await Promise.all([
      advanceReportsPromise,
      ourRansomRowsPromise,
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

    if (rows.value && user.value.username === "Директор") {
      handleFilteredRows([rows.value, selected.value]);
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
      rowsOurRansom.value = ourRansomRowsData;
      rowsDelivery.value = deliveryRowsData;
      getAllSumDirector();
    }

    rowsBalance.value = balanceRowsData;
    rowsBalanceOnline.value = onlineBalanceRowsData;
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
    ?.filter((row) => row.received !== null && row.recipient === "Директор")
    .reduce((acc, value) => acc + +value.sum, 0);

  let sumOfPVZ1 = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        row.createdUser === "Директор" &&
        row.typeOfExpenditure !== "Пополнение баланса" &&
        row.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
        row.typeOfExpenditure !== "Новый кредит нал" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал" &&
        row.type === "Нал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  const march312024 = new Date("2024-04-01");

  let sumOfPVZ2 = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        (row.issuedUser === "Директор" || row.issuedUser === "Директор (С)") &&
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
        row.createdUser === "Директор" &&
        !row.issuedUser &&
        row.type === "Нал" &&
        row.typeOfExpenditure !== "Кредитовый баланс нал" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал"
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
    ?.filter((row) => row.additionally === "Отказ брак")
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
        row.additionally !== "Отказ брак"
    )
    .reduce((acc, value) => acc + +value.priceSite, 0);

  let sumOfPVZ10 = rowsOurRansom.value
    ?.filter(
      (row) =>
        row.additionally !== "Отказ клиент наличные" &&
        row.additionally !== "Отказ клиент" &&
        row.additionally !== "Отказ брак"
    )
    .reduce((acc, value) => acc + +value.deliveredKGT, 0);

  let sumOfPVZ11 = rows.value
    ?.filter(
      (row) =>
        row.createdUser === "Директор" &&
        row.issuedUser === "Директор" &&
        row.type === "Нал" &&
        row.typeOfExpenditure === "Перевод с баланса безнал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ12 = rows.value
    ?.filter(
      (row) =>
        row.createdUser === "Директор" &&
        row.issuedUser === "Директор" &&
        row.type === "Безнал" &&
        row.typeOfExpenditure === "Перевод с баланса нал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ1Cashless = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        row.createdUser === "Директор" &&
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
        (row.issuedUser === "Директор" || row.issuedUser === "Директор (С)") &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.typeOfExpenditure !== "Перевод с баланса безнал" &&
        row.type === "Безнал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ3Cashless = rows.value
    ?.filter(
      (row) =>
        row.createdUser === "Директор" &&
        !row.issuedUser &&
        row.type === "Безнал" &&
        row.typeOfExpenditure !== "Перевод с баланса нал" &&
        row.typeOfExpenditure !== "Кредитовый баланс безнал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ4Cashless = rows.value
    ?.filter(
      (row) =>
        row.createdUser === "Директор" &&
        row.issuedUser === "Директор" &&
        row.type === "Нал" &&
        row.typeOfExpenditure === "Перевод с баланса безнал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ5Cashless = rows.value
    ?.filter(
      (row) =>
        row.createdUser === "Директор" &&
        row.issuedUser === "Директор" &&
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
  sumOfPVZ1Cashless = sumOfPVZ1Cashless === undefined ? 0 : sumOfPVZ1Cashless;
  sumOfPVZ2Cashless = sumOfPVZ2Cashless === undefined ? 0 : sumOfPVZ2Cashless;
  sumOfPVZ3Cashless = sumOfPVZ3Cashless === undefined ? 0 : sumOfPVZ3Cashless;
  sumOfPVZ4Cashless = sumOfPVZ4Cashless === undefined ? 0 : sumOfPVZ4Cashless;
  sumOfPVZ5Cashless = sumOfPVZ5Cashless === undefined ? 0 : sumOfPVZ5Cashless;
  switch ("Директор") {
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
  getSumCreditBalance();
  return allSum.value + allSum2.value - 19008030;
}

let sumCreditCash = ref(0);
let sumCreditOnline = ref(0);
let sumCreditBalance = ref(0);

let sumCreditCashDebt = ref(0);
let sumCreditOnlineDebt = ref(0);
let sumCreditBalanceDebt = ref(0);

function getSumCreditCash() {
  if (rows.value) {
    let sumOfPVZ = rows.value
      .filter(
        (row) =>
          row.createdUser === "Директор" &&
          row.typeOfExpenditure ===
            "Перевод в междубалансовый, кредитный баланс" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ1 = rows.value
      .filter(
        (row) =>
          row.createdUser === "Директор" &&
          row.typeOfExpenditure === "Перевод с кредитного баланса нал" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ2 = rows.value
      .filter(
        (row) =>
          row.createdUser === "Директор" &&
          row.typeOfExpenditure === "Новый кредит нал" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ3 = rows.value
      .filter(
        (row) =>
          row.createdUser === "Директор" &&
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
          row.createdUser === "Директор" &&
          row.typeOfExpenditure ===
            "Перевод в междубалансовый, кредитный баланс" &&
          row.type === "Безнал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ1 = rows.value
      .filter(
        (row) =>
          row.createdUser === "Директор" &&
          row.typeOfExpenditure === "Перевод с кредитного баланса безнал" &&
          row.type === "Безнал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ2 = rows.value
      .filter(
        (row) =>
          row.createdUser === "Директор" &&
          row.typeOfExpenditure === "Новый кредит безнал" &&
          row.type === "Безнал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ3 = rows.value
      .filter(
        (row) =>
          row.createdUser === "Директор" &&
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
          row.createdUser === "Директор" &&
          row.typeOfExpenditure === "Перевод с баланса безнал" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ2 = rows.value
      .filter(
        (row) =>
          row.createdUser === "Директор" &&
          row.typeOfExpenditure === "Перевод с баланса нал" &&
          row.type === "Безнал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ1Debt = rows.value
      .filter(
        (row) =>
          row.createdUser === "Директор" &&
          row.typeOfExpenditure === "Перевод с баланса нал" &&
          row.type === "Безнал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    let sumOfPVZ2Debt = rows.value
      .filter(
        (row) =>
          row.createdUser === "Директор" &&
          row.typeOfExpenditure === "Перевод с баланса безнал" &&
          row.type === "Нал"
      )
      .reduce((acc, value) => acc + +value.expenditure, 0);

    sumCreditBalance.value =
      sumOfPVZ1 - sumOfPVZ2 - 100000 < 0 ? 0 : sumOfPVZ1 - sumOfPVZ2 - 100000;
    sumCreditBalanceDebt.value =
      sumOfPVZ1Debt - sumOfPVZ2Debt + 1700000 < 0
        ? 0
        : sumOfPVZ1Debt - sumOfPVZ2Debt + 1700000;
  }
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IAdvanceReport;
}

function openModal(row: IAdvanceReport, flag: string = "CASH") {
  isOpen.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    if (user.value.username !== "Директор") {
      rowData.value.date = rowData.value.date ? rowData.value.date : null;
    }
  } else {
    rowData.value = {} as IAdvanceReport;
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
    rowData.value.typeOfExpenditure === "Новый кредит безнал" ||
    rowData.value.typeOfExpenditure === "Перевод с кредитного баланса нал" ||
    rowData.value.typeOfExpenditure === "Перевод с баланса нал" ||
    rowData.value.typeOfExpenditure === "Перевод с баланса безнал" ||
    rowData.value.typeOfExpenditure === "Перевод с кредитного баланса безнал"
  ) {
    rowData.value.PVZ = "";
    rowData.value.company = "";
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
  rowData.value.issuedUser = "Директор";
  rowData.value.received = new Date();
  rowData.value.supportingDocuments = "";
  rowData.value.typeOfExpenditure = row.typeOfExpenditure;
  rowData.value.createdUser = "Директор";
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
  rowData.value.issuedUser = "Директор";
  rowData.value.received = new Date();
  rowData.value.supportingDocuments = "";
  rowData.value.typeOfExpenditure = row.typeOfExpenditure;
  rowData.value.type = "Безнал";
  rowData.value.createdUser = "Директор";
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
  "Бессоново",
  "Новоандриановка",
  "ПВЗ_1",
  "ПВЗ_2",
  "ПВЗ_3",
  "ПВЗ_4",
  "ППВЗ_5",
  "ППВЗ_7",
  "Офис",
  "НаДом",
]);

let typesOfExpenditure = ref([
  "Передача денежных средств",
  "Сопутствующие расходы",
  "Автомобили",
  "Ежемесячные платежи",
  "Оплата ФОТ",
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
  "Директор (С)",
  "Шведова",
  "Косой",
  "Шарафаненко",
  "Волошина",
  "Рейзвих",
  "+7",
  "КассаЯМ",
  "Горцуева",
]);

import { createClient } from "@supabase/supabase-js";
import { useToast } from "vue-toastification";

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
    +rowData.value.expenditure > +sumCreditOnlineDebt.value &&
    rowData.value.type === "Нал"
  ) {
    toast.error("Задолженность кредита меньше чем вписанная сумма!");
    return;
  } else if (
    rowData.value.typeOfExpenditure === "Перевод с баланса нал" &&
    +rowData.value.expenditure > +Math.ceil(getAllSumFromEmployees()) &&
    rowData.value.type === "Безнал"
  ) {
    toast.error("На балансе нал не хватает средств!");
    return;
  } else if (
    rowData.value.typeOfExpenditure === "Перевод с баланса безнал" &&
    +rowData.value.expenditure > +allSum2.value &&
    rowData.value.type === "Нал"
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
    await storeAdvanceReports.createAdvanceReport(
      rowData.value,
      user.value.username
    );
    rows.value = await storeAdvanceReports.getAdvancedReports();
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

    if (rows.value && user.value.username === "Директор") {
      handleFilteredRows([rows.value, selected.value]);
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

  rows.value = await storeAdvanceReports.getAdvancedReports();
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

  if (rows.value && user.value.username === "Директор") {
      handleFilteredRows([rows.value, selected.value]);
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
  rows.value = await storeAdvanceReports.getAdvancedReports();
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

  if (rows.value && user.value.username === "Директор") {
      handleFilteredRows([rows.value, selected.value]);
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
  localStorage.clear();
}

onUnmounted(() => {
  clearLocalStorage();
});

async function deleteRow(id: any) {
  let answer = confirm("Вы точно хотите удалить строку?");
  if (answer) {
    isLoading.value = true;
    await storeAdvanceReports.deleteRow(id.id);
    rows.value = await storeAdvanceReports.getAdvancedReports();
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

    if (rows.value && user.value.username === "Директор") {
      handleFilteredRows([rows.value, selected.value]);
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
  let remainder = numberString.length % 3;

  if (remainder !== 0) {
    formattedString += numberString.slice(0, remainder) + " ";
  }

  for (let i = remainder; i < numberString.length; i += 3) {
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
      (username) => username !== "Директор" && username !== "Директор (С)"
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
  end: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 0),
});

const filteredRows = ref<Array<IAdvanceReport>>();

function handleFilteredRows(obj: any) {
  filteredRows.value = obj[0];
  selected.value = obj[1];

  const newStartingDate = new Date(selected.value.start).setHours(0, 0, 0, 0);
  const newEndDate = new Date(selected.value.end).setHours(23, 59, 59, 999);

  filteredRows.value = filteredRows.value?.filter((row: IAdvanceReport) => {
    const rowDate = new Date(row.created_at).getTime();
    return (
      (!selected.value.start || rowDate >= newStartingDate) &&
      (!selected.value.end || rowDate <= newEndDate)
    );
  });
}

let linkPhoto = ref("");
async function handleFileChange(fileList: FileList) {
  isLoading.value = true;
  const selectedFile = fileList[0];
  const { data, error } = await supabase.storage
    .from("image")
    .upload(`img-${selectedFile.name}`, selectedFile);
  rowData.value.supportingDocuments = selectedFile.name;
  linkPhoto.value = `https://fomoljxhkywsdgnchewy.supabase.co/storage/v1/object/public/image/img-${selectedFile.name}`;
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

const uniqueNotation = computed(() => {
  if (user.value.role === "ADMIN") {
    return storeAdvanceReports.getUniqueNonEmptyValues(rows.value, "notation");
  }
});

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

import ru from "date-fns/locale/ru";
import { format } from "date-fns";
const date = ref(new Date());

const paymentOptions = [
  { value: "Нал", label: "Нал" },
  { value: "Безнал", label: "Безнал" },
];

const typeOfOptions = [
  { value: "Новый кредит нал", label: "Новый" },
  { value: "Пополнение баланса", label: "Нет" },
  { value: "Перевод с кредитного баланса нал", label: "С кредитного баланса" },
  { value: "Перевод с баланса безнал", label: "С баланса безнал" },
];
</script>

<template>
  <Head>
    <Title>Авансовый отчёт</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="table-admin-no-pad">
        <div class="bg-[#f8f9fd] px-16 w-screen pt-10 max-sm:px-5 pb-5">
          <AdvanceReportFilters
            v-if="rows"
            @filtered-rows="handleFilteredRows"
            :rows="rows"
            :user="user"
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
                <h1 class="text-2xl text-center">
                  Междубалансовый, кредитный баланс нал
                </h1>
                <h1 class="text-center text-3xl text-secondary-color mb-5">
                  {{ formatNumber(sumCreditCash) }} ₽
                </h1>
                <h1 class="text-2xl text-center">Кредитная задолженность</h1>
                <h1 class="text-center text-3xl text-secondary-color mb-5">
                  {{ formatNumber(sumCreditCashDebt) }} ₽
                </h1>
                <h1 class="text-2xl text-center">
                  Междубалансовая задолженность
                </h1>
                <h1
                  class="text-center text-3xl text-secondary-color mb-5"
                  v-if="sumCreditBalanceDebt <= 0"
                >
                  {{ formatNumber(sumCreditBalance) }} ₽
                </h1>
                <h1
                  class="text-center text-3xl text-secondary-color mb-5"
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
                <h1 class="text-2xl text-center">
                  Междубалансовый, кредитный баланс безнал
                </h1>
                <h1 class="text-center text-3xl text-secondary-color mb-5">
                  {{ formatNumber(sumCreditOnline) }} ₽
                </h1>
                <h1 class="text-2xl text-center">Кредитная задолженность</h1>
                <h1 class="text-center text-3xl text-secondary-color mb-5">
                  {{ formatNumber(sumCreditOnlineDebt) }} ₽
                </h1>
                <h1 class="text-2xl text-center">
                  Междубалансовая задолженность
                </h1>
                <h1 class="text-center text-3xl text-secondary-color mb-5">
                  {{ formatNumber(sumCreditBalanceDebt) }} ₽
                </h1>
              </div>
            </div>
          </div>

          <div>
            <div
              class="text-center text-2xl my-5"
              v-if="
                selectedUser !== 'Директор' && selectedUser !== 'Директор (С)'
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
            <div v-if="selectedUser === 'Директор'">
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
                  v-if="user.username === 'Директор'"
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
              v-if="user.username === 'Директор'"
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
              selectedUser !== 'Директор (С)' && selectedUser !== 'Директор'
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
            <div class="custom-header" v-else>Создание аван. документа</div>
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
                <UPopover
                  v-if="rowData.date"
                  class="w-full"
                  :popper="{ placement: 'bottom-start' }"
                >
                  <UButton
                    :overlay="true"
                    type="button"
                    icon="i-heroicons-calendar-days-20-solid"
                    color="white"
                    class="w-full"
                    :disabled="
                      rowData.typeOfExpenditure ===
                        'Списание кредитной задолженности торговой империи' ||
                      rowData.typeOfExpenditure ===
                        'Списание балансовой задолженности торговой империи' ||
                      rowData.typeOfExpenditure ===
                        'Перевод в междубалансовый, кредитный баланс'
                    "
                  >
                    {{ format(rowData.date, "dd MMM yyy", { locale: ru }) }}
                  </UButton>

                  <template #panel="{ close }">
                    <DatePickerNotRange
                      v-model="rowData.date"
                      is-required
                      @close="close"
                    />
                  </template>
                </UPopover>
              </div>

              <div
                class="flex flex-col items-start text-left gap-2 mb-5"
                v-if="user.role === 'ADMIN'"
              >
                <label for="name">Дата</label>
                <UPopover
                  v-if="rowData.date"
                  class="w-full"
                  :popper="{ placement: 'bottom-start' }"
                >
                  <UButton
                    :overlay="true"
                    type="button"
                    icon="i-heroicons-calendar-days-20-solid"
                    color="white"
                    class="w-full"
                    :disabled="
                      rowData.typeOfExpenditure ===
                        'Списание кредитной задолженности торговой империи' ||
                      rowData.typeOfExpenditure ===
                        'Списание балансовой задолженности торговой империи' ||
                      rowData.typeOfExpenditure ===
                        'Перевод в междубалансовый, кредитный баланс'
                    "
                  >
                    {{ format(rowData.date, "dd MMM yyy", { locale: ru }) }}
                  </UButton>

                  <template #panel="{ close }">
                    <DatePickerNotRange
                      v-model="rowData.date"
                      is-required
                      @close="close"
                    />
                  </template>
                </UPopover>
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
                <UInputMenu
                  class="w-full"
                  v-model="rowData.notation"
                  v-model:query="rowData.notation"
                  :options="uniqueNotation"
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
                  @input="checkExpenditure"
                  type="text"
                />
              </div>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="name">Дата</label>
              <UPopover
                v-if="rowData.date"
                class="w-full"
                :popper="{ placement: 'bottom-start' }"
              >
                <UButton
                  :overlay="true"
                  type="button"
                  icon="i-heroicons-calendar-days-20-solid"
                  color="white"
                  class="w-full"
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс'
                  "
                >
                  {{ format(rowData.date, "dd MMM yyy", { locale: ru }) }}
                </UButton>

                <template #panel="{ close }">
                  <DatePickerNotRange
                    v-model="rowData.date"
                    is-required
                    @close="close"
                  />
                </template>
              </UPopover>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="dispatchPVZ1">ПВЗ</label>
              <USelectMenu
                :disabled="
                  rowData.typeOfExpenditure === 'Новый кредит нал' ||
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
                <UInputMenu
                  :disabled="user.role !== 'ADMIN'"
                  class="w-full"
                  v-model="rowData.notation"
                  v-model:query="rowData.notation"
                  type="text"
                  :options="uniqueNotation"
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
                  @input="checkExpenditure"
                  type="text"
                />
              </div>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="name">Дата</label>
              <UPopover
                v-if="rowData.date"
                class="w-full"
                :popper="{ placement: 'bottom-start' }"
              >
                <UButton
                  :overlay="true"
                  type="button"
                  icon="i-heroicons-calendar-days-20-solid"
                  color="white"
                  class="w-full"
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс'
                  "
                >
                  {{ format(rowData.date, "dd MMM yyy", { locale: ru }) }}
                </UButton>

                <template #panel="{ close }">
                  <DatePickerNotRange
                    v-model="rowData.date"
                    is-required
                    @close="close"
                  />
                </template>
              </UPopover>
            </div>

            <div class="flex flex-col items-start text-left gap-2 mb-5">
              <label for="dispatchPVZ1">ПВЗ</label>
              <USelectMenu
                :disabled="
                  rowData.typeOfExpenditure === 'Новый кредит нал' ||
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
                <UInputMenu
                  :disabled="user.role !== 'ADMIN'"
                  class="w-full"
                  v-model="rowData.notation"
                  v-model:query="rowData.notation"
                  type="text"
                  :options="uniqueNotation"
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
        <div class="bg-[#f8f9fd] px-16 w-screen pt-10 max-sm:px-5 pb-5">
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
            <div class="custom-header" v-else>Создание аван. документа</div>
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
                <UPopover
                  v-if="rowData.date"
                  class="w-full"
                  :popper="{ placement: 'bottom-start' }"
                >
                  <UButton
                    :overlay="true"
                    type="button"
                    icon="i-heroicons-calendar-days-20-solid"
                    color="white"
                    class="w-full"
                    :disabled="
                      rowData.typeOfExpenditure ===
                        'Списание кредитной задолженности торговой империи' ||
                      rowData.typeOfExpenditure ===
                        'Списание балансовой задолженности торговой империи' ||
                      rowData.typeOfExpenditure ===
                        'Перевод в междубалансовый, кредитный баланс'
                    "
                  >
                    {{ format(rowData.date, "dd MMM yyy", { locale: ru }) }}
                  </UButton>

                  <template #panel="{ close }">
                    <DatePickerNotRange
                      v-model="rowData.date"
                      is-required
                      @close="close"
                    />
                  </template>
                </UPopover>
              </div>

              <div
                class="flex flex-col items-start text-left gap-2 mb-5"
                v-if="user.role === 'ADMIN'"
              >
                <label for="name">Дата</label>
                <UPopover
                  v-if="rowData.date"
                  class="w-full"
                  :popper="{ placement: 'bottom-start' }"
                >
                  <UButton
                    :overlay="true"
                    type="button"
                    icon="i-heroicons-calendar-days-20-solid"
                    color="white"
                    class="w-full"
                    :disabled="
                      rowData.typeOfExpenditure ===
                        'Списание кредитной задолженности торговой империи' ||
                      rowData.typeOfExpenditure ===
                        'Списание балансовой задолженности торговой империи' ||
                      rowData.typeOfExpenditure ===
                        'Перевод в междубалансовый, кредитный баланс'
                    "
                  >
                    {{ format(rowData.date, "dd MMM yyy", { locale: ru }) }}
                  </UButton>

                  <template #panel="{ close }">
                    <DatePickerNotRange
                      v-model="rowData.date"
                      is-required
                      @close="close"
                    />
                  </template>
                </UPopover>
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
                <UInputMenu
                  class="w-full"
                  v-model="rowData.notation"
                  v-model:query="rowData.notation"
                  :options="uniqueNotation"
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
              <UPopover
                v-if="rowData.date"
                class="w-full"
                :popper="{ placement: 'bottom-start' }"
              >
                <UButton
                  :overlay="true"
                  type="button"
                  icon="i-heroicons-calendar-days-20-solid"
                  color="white"
                  class="w-full"
                  :disabled="
                    rowData.typeOfExpenditure ===
                      'Списание кредитной задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Списание балансовой задолженности торговой империи' ||
                    rowData.typeOfExpenditure ===
                      'Перевод в междубалансовый, кредитный баланс'
                  "
                >
                  {{ format(rowData.date, "dd MMM yyy", { locale: ru }) }}
                </UButton>

                <template #panel="{ close }">
                  <DatePickerNotRange
                    v-model="rowData.date"
                    is-required
                    @close="close"
                  />
                </template>
              </UPopover>
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
