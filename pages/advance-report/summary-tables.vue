<script setup lang="ts">
import Cookies from "js-cookie";
import { vAutoAnimate } from "@formkit/auto-animate";

interface SelectedDateRange {
  start: Date;
  end: Date;
}

const storeUsers = useUsersStore();
const storeAdvanceReports = useAdvanceReports();
const storeBalance = useBalanceStore();
const storeRansom = useRansomStore();
const router = useRouter();

let user = ref({} as User);
let rows = ref<Array<IAdvanceReport>>([]);
let originallyRows = ref<Array<IAdvanceReport>>([]);
let rowsBalance = ref<Array<IBalance>>([]);
const token = Cookies.get("token");
let isLoading = ref(false);

let rowsBalanceOnline = ref<Array<IBalanceOnline>>([]);
let rowsOurRansom = ref<Array<IOurRansom>>([]);
let rowsDelivery = ref<Array<IDelivery>>([]);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  selected.value = {
    start: new Date(new Date().getFullYear() - 1, 0, 1),
    end: new Date(),
  };

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeAdvanceReports.getAdvancedReports(user.value);

  const [
    ransomRowsForBalanceOurRansomDataPartOne,
    ransomRowsForBalanceOurRansomDataPartTwo,
    ransomRowsForBalanceOurRansomDataPartThree,
    ransomRowsForBalanceOurRansomDataPartFour,
    rowsDeliveryValue,
    clientRansomRowsValue,
    rowsBalanceValue,
  ] = await Promise.all([
    storeRansom.getRansomRowsForBalanceOurRansomPartOne(),
    storeRansom.getRansomRowsForBalanceOurRansomPartTwo(),
    storeRansom.getRansomRowsForBalanceOurRansomPartThree(),
    storeRansom.getRansomRowsForBalanceOurRansomPartFour(),
    storeRansom.getRansomRowsForBalanceDelivery(),
    storeRansom.getRansomRowsForBalanceClientRansom(),
    storeBalance.getBalanceRows(),
  ]);
  originallyRows.value = rows.value;
  rowsOurRansom.value = [
    ...ransomRowsForBalanceOurRansomDataPartOne,
    ...ransomRowsForBalanceOurRansomDataPartTwo,
    ...ransomRowsForBalanceOurRansomDataPartThree,
    ...ransomRowsForBalanceOurRansomDataPartFour,
  ];
  rowsDelivery.value = rowsDeliveryValue;

  if (user.value.role !== "ADMIN") {
    rows.value = rows.value?.filter(
      (row) =>
        row.createdUser === user.value.username ||
        row.issuedUser === user.value.username
    );
  } else {
    rows.value = rows.value;
  }

  if (rows.value) {
    handleFilteredRows([rows.value, selected.value, ["Нал", "Безнал"], []]);
  }

  ourRansomRows.value = rowsOurRansom.value;
  clientRansomRows.value = clientRansomRowsValue;
  rowsBalance.value = rowsBalanceValue;

  getAllSum();

  isLoading.value = false;
});

definePageMeta({
  layout: false,
  name: "Сводные таблицы",
});

let allSum = ref(0);
let allSum2 = ref(0);

let copyArrayOurRansom = ref<Array<IOurRansom>>();
let copyArrayClientRansom = ref<Array<IClientRansom>>();
let ourRansomRows = ref<Array<IOurRansom>>();
let clientRansomRows = ref<Array<IClientRansom>>();

function getAllSum() {
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
      (row) => row.received !== null && row.recipient === user.value.username
    )
    .reduce((acc, value) => acc + +value.sum, 0);

  let sumOfPVZ1 = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        row.createdUser === user.value.username &&
        row.typeOfExpenditure !== "Пополнение баланса" &&
        row.type === "Нал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ2 = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        row.issuedUser === user.value.username &&
        row.type === "Нал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ3 = rows.value
    ?.filter(
      (row) =>
        row.createdUser === user.value.username &&
        !row.issuedUser &&
        row.type === "Нал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ4 = rowsDelivery.value
    ?.filter((row) => row.paid !== null)
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

  let sumOfPVZ1Cashless = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        row.createdUser === user.value.username &&
        row.typeOfExpenditure !== "Пополнение баланса" &&
        row.type === "Безнал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ2Cashless = rows.value
    ?.filter(
      (row) =>
        row.received !== null &&
        row.issuedUser === user.value.username &&
        row.type === "Безнал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ3Cashless = rows.value
    ?.filter(
      (row) =>
        row.createdUser === user.value.username &&
        !row.issuedUser &&
        row.type === "Безнал"
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
  sumOfPVZ10 = sumOfPVZ10 === undefined ? 0 : sumOfPVZ9;
  sumOfPVZ1Cashless = sumOfPVZ1Cashless === undefined ? 0 : sumOfPVZ1Cashless;
  sumOfPVZ2Cashless = sumOfPVZ2Cashless === undefined ? 0 : sumOfPVZ2Cashless;
  sumOfPVZ3Cashless = sumOfPVZ3Cashless === undefined ? 0 : sumOfPVZ3Cashless;

  switch (user.value.username) {
    case "Шведова":
      allSum.value = +sumOfPVZ - +sumOfPVZ1 + +sumOfPVZ2 - +sumOfPVZ3;
      break;
    case "Директор":
      allSum.value =
        +sumOfPVZ -
        +sumOfPVZ1 +
        +sumOfPVZ2 -
        +sumOfPVZ3 +
        +sumOfPVZ4 +
        +sumOfPVZ5 -
        +sumOfPVZ6 +
        +sumOfPVZ7 +
        +sumOfPVZ8 -
        +sumOfPVZ9 +
        +sumOfPVZ10;

      allSum2.value =
        +sumOfPVZ -
        +sumOfPVZ1Cashless +
        +sumOfPVZ2Cashless -
        +sumOfPVZ3Cashless;
      break;

    case "Власенкова":
      allSum.value =
        +sumOfPVZ -
        +sumOfPVZ1 +
        +sumOfPVZ2 -
        +sumOfPVZ3 +
        +sumOfPVZ4 +
        +sumOfPVZ5 -
        +sumOfPVZ6 +
        +sumOfPVZ7 +
        +sumOfPVZ8 -
        +sumOfPVZ9 +
        +sumOfPVZ10;

      allSum2.value =
        +sumOfPVZ -
        +sumOfPVZ1Cashless +
        +sumOfPVZ2Cashless -
        +sumOfPVZ3Cashless;
      break;
    default:
      allSum.value =
        +sumOfPVZ - +sumOfPVZ1 + +sumOfPVZ2 - +sumOfPVZ3 + +sumOfPVZ4;
      break;
  }
}

let companies = ref([
  "W/O/Я start",
  "Darom.pro",
  "Сортировка",
  "Доставка",
  "Чаевые",
]);

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

const filteredRows = ref<Array<IAdvanceReport>>([]);
let selectedTypeOfExpenditure = ref<Array<string>>([]);
function handleFilteredRows(obj: any) {
  filteredRows.value = obj[0];
  selected.value = obj[1];
  selectedType.value = obj[2];
  selectedTypeOfExpenditure.value = obj[3];
}

const selected = ref<SelectedDateRange>();

const selectedType = ref<Array<string>>([]);

const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string | null>(null);

let type = ref("");

let arrayOfExpenditure = ref<Array<IAdvanceReport>>();
let sumOfArray3 = ref(0);

function returnTotal(sum: number) {
  sumOfArray3.value = sum;
}
</script>

<template>
  <Head>
    <Title>Сводные таблицы</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="table-admin-no-pad">
        <div class="px-5 w-screen pt-5 max-sm:px-1 pb-5">
          <div v-auto-animate>
            <AdvanceReportSumTablesFilters
              @filtered-rows="handleFilteredRows"
              :rows="rows"
            />
          </div>

          <h1 class="text-xl font-bold mt-10">
            Баланс чистой прибыли торговой империи за всё время:
            <span class="text-secondary-color font-bold"
              >{{ formatNumber(sumOfArray3) }} ₽</span
            >
          </h1>

          <div v-for="company in companies" class="mt-10 mb-10">
            <h1 class="font-bold text-xl">
              {{ company }}
            </h1>
            <div>
              <AdvanceReportTableReport
                :rows="filteredRows?.filter((row) => row.company === company)"
                :user="user"
                :rows-delivery="
                  rowsDelivery?.filter((row) => row.nameOfAction === company)
                "
                :rows-balance="rowsBalance"
                :rows-our-ransom="rowsOurRansom"
                :company="company"
                :selected="selected"
                :type="selectedType"
                :selected-type-of-expenditure="selectedTypeOfExpenditure"
              />
            </div>
          </div>

          <div class="mt-10 mb-10">
            <h1 class="font-bold text-xl">
              Итог месяца прибыли <br class="hidden max-sm:block" />
              по всем проектам
            </h1>
            <div>
              <AdvanceReportTableReport
                :rows="filteredRows"
                :user="user"
                :rows-delivery="rowsDelivery"
                :rows-balance="rowsBalance"
                :rows-our-ransom="rowsOurRansom"
                :company="'Все'"
                :selected="selected"
                :type="selectedType"
                @return-total="returnTotal"
                :selected-type-of-expenditure="selectedTypeOfExpenditure"
              />
            </div>
          </div>
        </div>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="user"> </NuxtLayout>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
