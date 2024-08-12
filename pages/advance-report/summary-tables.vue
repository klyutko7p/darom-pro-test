<script setup lang="ts">
import Cookies from "js-cookie";
import VueMultiselect from "vue-multiselect";
import { vAutoAnimate } from "@formkit/auto-animate";
import ru from 'date-fns/locale/ru'

const storeUsers = useUsersStore();
const storeAdvanceReports = useAdvanceReports();
const storeBalance = useBalanceStore();
const storeRansom = useRansomStore();
const router = useRouter();

let user = ref({} as User);
let rows = ref<Array<IAdvanceReport>>();
let originallyRows = ref<Array<IAdvanceReport>>();
let rowsBalance = ref<Array<IBalance>>();
const token = Cookies.get("token");
let isLoading = ref(false);

let rowsBalanceOnline = ref<Array<IBalanceOnline>>();
let rowsOurRansom = ref<Array<IOurRansom>>();
let rowsDelivery = ref<Array<IDelivery>>();

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeAdvanceReports.getAdvancedReports();

  const [ rowsOurRansomValue, rowsDeliveryValue, clientRansomRowsValue, rowsBalanceValue] = await Promise.all([
    storeRansom.getRansomRowsForBalanceOurRansom(),
    storeRansom.getRansomRowsForBalanceDelivery(),
    storeRansom.getRansomRowsForBalanceClientRansom(),
    storeBalance.getBalanceRows()
]);
  originallyRows.value = rows.value;
  rowsOurRansom.value = rowsOurRansomValue;
  rowsDelivery.value = rowsDeliveryValue;

  if (user.value.role !== "ADMIN") {
    rows.value = rows.value?.filter(
      (row) =>
        row.createdUser === user.value.username || row.issuedUser === user.value.username
    );
  } else {
    rows.value = rows.value;
  }

  if (rows.value) {
    handleFilteredRows(rows.value);
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
    ?.filter((row) => row.received !== null && row.recipient === user.value.username)
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
        row.issuedUser === "" &&
        row.type === "Нал"
    )
    .reduce((acc, value) => acc + +value.expenditure, 0);

  let sumOfPVZ4 = rowsDelivery.value
    ?.filter((row) => row.paid !== null)
    .reduce((acc, value) => acc + +value.amountFromClient3, 0);

  let sumOfPVZ5 = rowsBalanceOnline.value?.reduce((acc, value) => acc + +value.sum, 0);

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
        row.issuedUser === "" &&
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
        +sumOfPVZ - +sumOfPVZ1Cashless + +sumOfPVZ2Cashless - +sumOfPVZ3Cashless;
      break;
    default:
      allSum.value = +sumOfPVZ - +sumOfPVZ1 + +sumOfPVZ2 - +sumOfPVZ3 + +sumOfPVZ4;
      break;
  }
}

let companies = ref(["W/O/Я start", "Darom.pro", "Сортировка", "Доставка", "Чаевые"]);

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

const filteredRows = ref<Array<IAdvanceReport>>();
function handleFilteredRows(filteredRowsData: IAdvanceReport[]) {
  filteredRows.value = filteredRowsData;
}

let selectedWeek = ref("март");

let month = ref(new Date().getMonth() + 1);
const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string | null>(null);

let showFilters = ref(false);
let showAllFilters = ref(false);
let monthNames: any = ref({
  3: "Март",
  4: "Апрель",
  5: "Май",
  6: "Июнь",
  7: "Июль",
  8: "Август",
  9: "Сентябрь",
  10: "Октябрь",
  11: "Ноябрь",
  12: "Декабрь",
  1: "Январь",
  2: "Февраль",
});

function filterRowsData(monthData: number) {
  month.value = monthData;
}
let type = ref("");
let isDateFilter = ref(false);

let arrayOfExpenditure = ref<Array<IAdvanceReport>>();
let sumOfArray3 = ref(0);

function returnTotal(sum: number) {
  let newStartingDate = new Date(startingDate.value);
  newStartingDate.setHours(0);
  newStartingDate.setMinutes(0);
  newStartingDate.setSeconds(0);
  newStartingDate.setMilliseconds(0);

  let newEndDate = new Date(endDate.value);
  newEndDate.setHours(23);
  newEndDate.setMinutes(59);
  newEndDate.setSeconds(59);
  newEndDate.setMilliseconds(0);

  sumOfArray3.value = sum;

  arrayOfExpenditure.value = filteredRows.value?.filter(
    (row: IAdvanceReport) =>
      row.typeOfExpenditure === "Вывод дивидендов" &&
      (!startingDate.value || new Date(row.date) >= new Date(newStartingDate)) &&
      (!endDate.value || new Date(row.date) <= new Date(newEndDate)) &&
      (!type.value || row.type === type.value)
  );

  arrayOfExpenditure.value?.forEach((row) => {
    sumOfArray3.value -= parseFloat(row.expenditure);
  });
}

const selectedTypeOfExpenditure = ref<Array<string>>([]);

const uniqueTypeOfExpenditure = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(rows.value, "typeOfExpenditure");
});

function clearFields() {
  selectedTypeOfExpenditure.value = [];
  startingDate.value = ""
  endDate.value = ""
  selected.value.start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  selected.value.end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  filterRows();
}

// let watchSelectedValueStart = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
// let watchSelectedValueEnd = ref(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))


const filterRows = async () => {
  // watchSelectedValueStart.value = selected.value.start;
  // watchSelectedValueEnd.value = selected.value.end;
  filteredRows.value = rows.value?.slice();
  filteredRows.value = rows.value?.filter((row) => {
    return (
      !selectedTypeOfExpenditure.value.length ||
      selectedTypeOfExpenditure.value.includes(row.typeOfExpenditure)
    );
  });
};

watch([selectedTypeOfExpenditure], filterRows);

import { sub, format, isSameDay, type Duration } from 'date-fns'

const ranges = [
  { label: 'Текущий месяц', duration: { month: 'current' } },
  { label: 'Сегодня', duration: { days: 0 } },
  { label: 'Последние 7 дней', duration: { days: 7 } },
  { label: 'Последние 14 дней', duration: { days: 14 } },
  { label: 'Последние 30 дней', duration: { days: 30 } },
  { label: 'Последние 3 месяца', duration: { months: 3 } },
  { label: 'Последние 6 месяцев', duration: { months: 6 } },
  { label: 'Последний год', duration: { years: 1 } }
]

const selected = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
})

function isRangeSelected(duration: Duration) {
  if (duration.month === 'current') {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    return isSameDay(selected.value.start, startOfMonth) && isSameDay(selected.value.end, endOfMonth)
  }
  return isSameDay(selected.value.start, sub(new Date(), duration)) && isSameDay(selected.value.end, new Date())
}

function selectRange(duration: Duration) {
  if (duration.month === 'current') {
    selected.value = {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    }
  } else {
    selected.value = { start: sub(new Date(), duration), end: new Date() }
  }
}
</script>

<template>
  <Head>
    <Title>Сводные таблицы</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-10">
          <div v-auto-animate>
            <div class="flex items-center gap-3 mt-14 max-xl:mt-0">
              <h1 class="text-xl font-bold">Фильтры</h1>
              <Icon
                @click="showAllFilters = !showAllFilters"
                class="cursor-pointer duration-200 hover:text-secondary-color"
                name="material-symbols:settings-rounded"
                size="24"
              />
            </div>

            <div
              v-if="showAllFilters"
              class="border-2 border-secondary-color border-dashed py-10 px-10 max-sm:px-5 shadow-2xl mt-3"
            >
              <div
                class="duration-200 flex items-center justify-between max-lg:flex-col max-lg:space-y-5 max-lg:items-start"
              >
                <div class="w-full">
                  <div class="flex items-start space-y-2 flex-col mt-5 text-center">
                    <h1>Статья расхода</h1>
                    <VueMultiselect
                      class=""
                      v-model="selectedTypeOfExpenditure"
                      :options="uniqueTypeOfExpenditure"
                      :multiple="true"
                      :close-on-select="true"
                      placeholder="Выберите статью расхода"
                    />
                  </div>
                </div>
              </div>

              <div
                v-auto-animate
                class="my-10 flex items-center gap-5 max-lg:flex-col max-lg:items-start"
              >
                <span
                  class="border-2 bg-white py-1 px-5 border-secondary-color hover:cursor-pointer hover:bg-secondary-color hover:text-white duration-200 rounded-full"
                  @click="showFilters = !showFilters"
                  >2024</span
                >
                <div v-auto-animate v-if="showFilters" class="flex flex-col">
                  <div
                    v-auto-animate
                    class="flex items-center w-full gap-3 max-sm:items-start max-sm:flex-col"
                  >
                    <div v-auto-animate class="space-x-3 flex">
                      <select
                        class="py-1 px-2 border-2 rounded-lg text-base border-secondary-color bg-secondary-color text-white font-bold"
                        v-model="month"
                        @change="filterRowsData(month)"
                      >
                        <option
                          v-for="(monthName, monthNumber) in monthNames"
                          :value="monthNumber"
                        >
                          {{ monthName }}
                        </option>
                      </select>
                      <select
                        class="py-1 px-1 border-2 bg-white rounded-lg text-base"
                        v-model="type"
                      >
                        <option value="Нал">Нал</option>
                        <option value="Безнал">Безнал</option>
                        <option value="">Нал + Безнал</option>
                      </select>
                    </div>

                    <div class="ml-2 space-x-2">
                      <input type="checkbox" v-model="isDateFilter" />
                      <label for="">Данные за всё время?</label>
                    </div>
                  </div>
                </div>
                <UPopover class="block max-sm:hidden" :popper="{ placement: 'auto' }">
                  <UButton
                    :overlay="true"
                    type="button"
                    icon="i-heroicons-calendar-days-20-solid"
                    color="orange"
                  >
                    {{ format(selected.start, "dd MMM yyy", { locale: ru }) }} —
                    {{ format(selected.end, "dd MMM yyy", { locale: ru }) }}
                  </UButton>

                  <template #panel="{ close }">
                    <div
                      class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800"
                    >
                      <div class="hidden sm:flex flex-col py-4">
                        <UButton
                          v-for="(range, index) in ranges"
                          :key="index"
                          :label="range.label"
                          color="white"
                          variant="ghost"
                          class="rounded-none px-6"
                          :class="[
                            isRangeSelected(range.duration)
                              ? 'bg-gray-100 dark:bg-gray-800'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                          ]"
                          truncate
                          @click="selectRange(range.duration)"
                        />
                      </div>

                      <DatePicker v-model="selected" @close="close" />
                    </div>
                  </template>
                </UPopover>
                <UPopover
                  class="hidden max-sm:block"
                  :overlay="true"
                  :popper="{ placement: 'auto' }"
                >
                  <UButton
                    type="button"
                    icon="i-heroicons-calendar-days-20-solid"
                    color="orange"
                  >
                    {{ format(selected.start, "dd MMM yyy", { locale: ru }) }} —
                    {{ format(selected.end, "dd MMM yyy", { locale: ru }) }}
                  </UButton>

                  <template #panel="{ close }">
                    <div
                      class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800"
                    >
                      <div class="hidden sm:flex flex-col py-4">
                        <UButton
                          v-for="(range, index) in ranges"
                          :key="index"
                          :label="range.label"
                          color="white"
                          variant="ghost"
                          class="rounded-none px-6"
                          :class="[
                            isRangeSelected(range.duration)
                              ? 'bg-gray-100 dark:bg-gray-800'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                          ]"
                          truncate
                          @click="selectRange(range.duration)"
                        />
                      </div>

                      <DatePickerSingleMonth v-model="selected" @close="close" />
                    </div>
                  </template>
                </UPopover>
              </div>

              <div class="flex justify-end gap-3 mt-3">
                <UIMainButton @click="filterRows(), (showAllFilters = !showAllFilters)"
                  >Принять</UIMainButton
                >
                <UIActionButton @click="clearFields">Очистить фильтры</UIActionButton>
              </div>
            </div>
          </div>

          <div class="flex justify-end my-3" v-if="user.role === 'ADMIN'">
            <h1
              @click="router.push('/advance-report')"
              class="bg-orange-500 px-5 py-2 text-white rounded-full text-secondary-color font-bold text-base hover:opacity-50 duration-200 cursor-pointer"
            >
              Перейти к авансовому отчету
            </h1>
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
                :week="selectedWeek"
                :month="month"
                :type="type"
                :isDateFilter="isDateFilter"
                :rows-delivery="
                  rowsDelivery?.filter((row) => row.nameOfAction === company)
                "
                :rows-balance="rowsBalance"
                :rows-our-ransom="rowsOurRansom"
                :company="company"
                :startingDate="selected.start"
                :endDate="selected.end"
                :selectedTypeOfExpenditure="selectedTypeOfExpenditure"
              />
            </div>
          </div>

          <div class="mt-10 mb-10" v-if="!selectedWeek.includes('неделя')">
            <h1 class="font-bold text-xl">
              Итог месяца прибыли <br class="hidden max-sm:block" />
              по всем проектам
            </h1>
            <div>
              <AdvanceReportTableReport
                :rows="filteredRows"
                :user="user"
                :week="selectedWeek"
                :month="month"
                :type="type"
                :rows-balance="rowsBalance"
                :rows-delivery="rowsDelivery"
                :rows-our-ransom="rowsOurRansom"
                :company="'Все'"
                :startingDate="selected.start"
                :endDate="selected.end"
                :isDateFilter="isDateFilter"
                @return-total="returnTotal"
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
