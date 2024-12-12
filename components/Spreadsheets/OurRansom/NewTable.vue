<script setup lang="ts">
import { read, utils, writeFile, write } from "xlsx";

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();

const emit = defineEmits([
  "openModal",
  "deleteRow",
  "deleteSelectedRows",
  "updateDeliveryRows",
  "createCopyRow",
  "showDeletedRows",
  "clearRow",
]);

async function updateDeliveryRows(flag: string, allSumData: string = "0") {
  emit("updateDeliveryRows", {
    idArray: checkedRows.value,
    flag: flag,
    allSum: allSumData,
  });
  checkedRows.value = [];
  allSum.value = [];
  getAllSum.value = 0;
  getAllSumBonuses.value = 0;
  phoneNumberClient.value = "";
}

function deleteSelectedRows() {
  emit("deleteSelectedRows", checkedRows.value);
  checkedRows.value = [];
  allSum.value = [];
  getAllSum.value = 0;
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IOurRansom[]> },
});

const perPage = ref(100);
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.ceil((props.rows?.length || 0) / perPage.value)
);

const totalRows = computed(() =>
  Math.ceil(props.rows?.filter((row) => row.deleted === null).length || 0)
);

function exportToExcel() {
  let table = document.querySelector(`.${uniqueId.value}`);
  let wb = utils.table_to_book(table);
  writeFile(wb, "наш_выкуп.xlsx");
}

let returnRows = ref<Array<IOurRansom>>();

function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;

  returnRows.value = props.rows?.slice(startIndex, endIndex);
}

watch(
  [currentPage, totalRows, props.rows, returnRows.value],
  updateCurrentPageData
);

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

let isVisiblePages = ref(true);

let showOthersVariants = ref(false);

let uniqueId = ref("q");
onMounted(async () => {
  updateCurrentPageData();

  if (props.user.role === "SORTIROVKA") {
    perPage.value = 100;
    updateCurrentPageData();
  }

  await storeRansom.getSumOfRejection();

  const getRandomLetter = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    return letters[Math.floor(Math.random() * letters.length)];
  };

  uniqueId.value = getRandomLetter();
});

function roundToNearestTen(num: number): number {
  const lastDigit = num % 10;
  if (lastDigit >= 5) {
    return Math.ceil(num / 10) * 10;
  } else {
    return Math.floor(num / 10) * 10;
  }
}

function isDateGreaterThanReference(dateString: string | Date): boolean {
  const referenceDate = new Date("2024-06-05T00:00:01");
  const inputDate = new Date(dateString);
  return inputDate > referenceDate;
}

let isLoading = ref(false);

interface RowData {
  rowId: number;
  amount: number;
  issued: Date | null | string | number;
  deliveredPVZ: Date | null | string | number;
  deliveredSC: Date | null | string | number;
  orderPVZ: Date | null | string | number;
  fromName: string;
}

const allSum: Ref<RowData[]> = ref([]);
const checkedRows: Ref<number[]> = ref([]);

const getAllSum: Ref<number> = ref(0);
const getAllSumBonuses: Ref<number> = ref(0);
const showButton: Ref<boolean> = ref(true);
const showButtonPVZ: Ref<boolean> = ref(true);
const showButtonSC: Ref<boolean> = ref(true);

const isChecked = (rowId: number): boolean => {
  return checkedRows.value.includes(rowId);
};

let allSumInput = ref("");
let phoneNumberClient = ref("");
let allFromNamesEqual = ref(false);
const handleCheckboxChange = (row: IOurRansom): void => {
  phoneNumberClient.value = "";
  allSumInput.value = "";
  allFromNamesEqual.value = false;
  if (isChecked(row.id)) {
    checkedRows.value = checkedRows.value.filter((id) => id !== row.id);
    allSum.value = allSum.value.filter((obj) => obj.rowId !== row.id);
  } else {
    checkedRows.value.push(row.id);
    let amountData = 0;
    if (isDateGreaterThanReference(row.created_at)) {
      amountData = +roundToNearestTen(+row.amountFromClient1);
    } else {
      amountData = Math.ceil(+row.amountFromClient1 / 10) * 10;
    }
    allSum.value.push({
      rowId: row.id,
      amount: amountData,
      issued: row.issued,
      deliveredPVZ: row.deliveredPVZ,
      orderPVZ: row.orderPVZ,
      deliveredSC: row.deliveredSC,
      fromName: row.fromName,
    });
  }

  getAllSum.value = allSum.value
    .filter((obj) => obj.issued === null)
    .reduce((sum, obj) => sum + obj.amount, 0);

  showButton.value = allSum.value.every((obj) => obj.issued === null);
  showButtonPVZ.value = allSum.value.every((obj) => obj.deliveredPVZ === null);
  showButtonSC.value = allSum.value.every((obj) => obj.deliveredSC === null);
};

let showPayRejectClient = ref(false);
</script>

<template>
  <div v-if="!isLoading">
    <div v-if="returnRows?.length" class="flex items-end justify-between mt-5">
      <UTooltip
        text="Скачать EXCEL"
        :shortcuts="['xlsx']"
        :popper="{ placement: 'right' }"
      >
        <div
          class="bg-secondary-color cursor-pointer border-[1px] border-secondary-color text-white hover:text-secondary-color hover:bg-transparent duration-200 px-2 pt-2 pb-1 rounded-full"
          @click="exportToExcel"
        >
          <Icon class="duration-200" size="32" name="bi:filetype-xlsx" />
        </div>
      </UTooltip>
    </div>

    <div
      class="bg-opacity-80 shadow-xl border-[1px] bg-gray-100 rounded-xl px-5 py-3 flex flex-col gap-3 fixed top-96 z-40 left-1/2 translate-x-[-50%] translate-y-[-50%]"
      v-if="checkedRows.length > 0"
    >
      <UIActionButton
        v-if="
          user.role === 'ADMIN' ||
          user.role === 'ADMINISTRATOR' ||
          (user.role === 'RMANAGER' && user.dataOurRansom === 'WRITE')
        "
        @click="deleteSelectedRows"
        >Удалить выделенные записи</UIActionButton
      >
      <UIActionButton v-if="showButtonPVZ" @click="updateDeliveryRows('PVZ')"
        >Доставить на пвз
      </UIActionButton>
      <UIActionButton
        v-if="
          (user.username === 'Шведова' ||
            user.username === 'Директор' ||
            user.username === 'Мешков') &&
          showButtonSC
        "
        @click="updateDeliveryRows('SC')"
        >Доставить на сц
      </UIActionButton>
      <UIActionButton
        v-if="showButton"
        @click="showOthersVariants = !showOthersVariants"
      >
        Выдать клиенту
      </UIActionButton>
      <div v-if="showOthersVariants" class="flex flex-col gap-3">
        <UIActionButton2 @click="updateDeliveryRows('additionally3')"
          >Оплата наличными
        </UIActionButton2>
        <UIActionButton2 @click="updateDeliveryRows('additionally', getAllSum)"
          >Оплата онлайн
        </UIActionButton2>
        <UIActionButton2 @click="showPayRejectClient = !showPayRejectClient"
          >Отказ клиент
        </UIActionButton2>
        <div v-if="showPayRejectClient" class="flex flex-col gap-3">
          <UIActionButton2 @click="updateDeliveryRows('additionally1-1')"
            >Отказ клиент онлайн</UIActionButton2
          >
          <UIActionButton2 @click="updateDeliveryRows('additionally1-2')"
            >Отказ клиент наличные</UIActionButton2
          >
        </div>
        <UIActionButton2 @click="updateDeliveryRows('additionally2')"
          >Отказ брак
        </UIActionButton2>
      </div>
    </div>

    <div v-if="returnRows?.length" class="mt-5 mb-10">
      <div id="up"></div>
      <table
        :class="`${uniqueId}`"
        class="w-full border-x-[1px] border-gray-50 text-sm text-left rtl:text-right text-gray-500"
      >
        <thead
          class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50"
        >
          <tr>
            <th
              scope="col"
              class="border-[1px]"
              v-if="user.dataOurRansom === 'WRITE'"
            >
              Выделение
            </th>
            <th scope="col" class="border-[1px] px-3">id</th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="user.clientLink1 === 'READ' || user.clientLink1 === 'WRITE'"
            >
              сс. клиента
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'"
            >
              ячейка
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'"
            >
              телефон
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.productLink1 === 'READ' || user.productLink1 === 'WRITE'
              "
            >
              товар (ссылка)
            </th>
            <th
              scope="col"
              class="border-[1px] px-10"
              v-if="
                user.productName1 === 'READ' || user.productName1 === 'WRITE'
              "
            >
              название товара
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'"
            >
              примечание
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
            >
              стоимость
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'"
            >
              предоплата
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.percentClient1 === 'READ' ||
                user.percentClient1 === 'WRITE'
              "
            >
              процент (%)
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.deliveredKGT1 === 'READ' || user.deliveredKGT1 === 'WRITE'
              "
            >
              доп. доход
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.amountFromClient1 === 'READ' ||
                user.amountFromClient1 === 'WRITE'
              "
            >
              сумма
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'
              "
            >
              ПВЗ
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'"
            >
              СЦ
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.orderAccount === 'READ' || user.orderAccount === 'WRITE'
              "
            >
              Аккаунт
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'
              "
            >
              дост. на сц
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                (user.deliveredPVZ1 === 'READ' ||
                  user.deliveredPVZ1 === 'WRITE') &&
                user.role !== 'SORTIROVKA'
              "
            >
              дост. на пвз
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'"
            >
              выдан
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.additionally1 === 'READ' || user.additionally1 === 'WRITE'
              "
            >
              доп
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="user.profit1 === 'READ' || user.profit1 === 'WRITE'"
            >
              доход
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              создан
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              изменен
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              удален
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              создан
            </th>
            <th
              scope="col"
              class="border-[1px]"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              изменен
            </th>
          </tr>
        </thead>
        <tbody>
          <div id="left"></div>
          <tr
            :class="{
              'bg-orange-100': isChecked(row.id),
            }"
            class="border-b text-center text-sm"
            v-for="row in returnRows"
          >
            <td
              v-if="user.dataOurRansom === 'WRITE'"
              class="border-[1px] text-secondary-color"
            >
              <input
                type="checkbox"
                :value="row.id"
                :checked="isChecked(row.id)"
                @change="handleCheckboxChange(row)"
                :disabled="
                  user.username === 'Кожемякина' || user.username === 'Гриценко'
                "
              />
            </td>
            <th
              scope="row"
              class="border-[1px] font-medium underline text-secondary-color whitespace-nowrap"
            >
              <NuxtLink
                v-if="
                  user.role !== 'PVZ' &&
                  user.role !== 'ADMINISTRATOR' &&
                  user.role !== 'RMANAGER' &&
                  user.role !== 'PPVZ'
                "
                class="cursor-pointer hover:text-orange-200 duration-200"
                :to="`/spreadsheets/record/1/${row.id}`"
              >
                {{ row.id }}
              </NuxtLink>
              <h1 v-else>{{ row.id }}</h1>
            </th>
            <td
              class="px-3 py-4 border-[1px] underline text-secondary-color whitespace-nowrap uppercase overflow-hidden max-w-[50px]"
              v-if="user.clientLink1 === 'READ' || user.clientLink1 === 'WRITE'"
            >
              <NuxtLink
                target="_blank"
                class="cursor-pointer hover:text-orange-200 duration-200"
                :to="`/spreadsheets/order/${row.clientLink1}`"
              >
                {{ row.clientLink1 }}
              </NuxtLink>
            </td>
            <td
              v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'"
              class="border-[1px]"
            >
              {{ row.cell }}
            </td>
            <td
              v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'"
              class="py-4 border-[1px] text-secondary-color underline"
            >
              <NuxtLink
                v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'"
                class="cursor-pointer hover:text-orange-200 duration-200"
                :to="`/phone/${row.fromName}`"
              >
                {{ row.fromName }}
              </NuxtLink>
            </td>
            <td
              class="underline border-[1px] text-secondary-color whitespace-nowrap overflow-hidden max-w-[30px]"
              v-if="
                user.productLink1 === 'READ' || user.productLink1 === 'WRITE'
              "
            >
              <a
                :href="row.productLink"
                target="_blank"
                class="hover:text-orange-200 duration-200"
                >{{ row.productLink }}</a
              >
            </td>
            <td
              class="border-[1px] break-words whitespace-normal max-w-[200px]"
              v-if="
                user.productName1 === 'READ' || user.productName1 === 'WRITE'
              "
            >
              {{ row.productName }}
            </td>
            <td
              class="border-[1px]"
              v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'"
              :class="{
                'bg-yellow-300 text-white font-semibold': row.notation,
              }"
            >
              {{ row.notation ? row.notation : "Пусто" }}
            </td>
            <td
              class="border-[1px]"
              v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
            >
              {{ row.priceSite }}
            </td>
            <td
              class="border-[1px]"
              v-if="user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'"
            >
              {{ row.prepayment }}
            </td>
            <td
              class="border-[1px]"
              v-if="
                user.percentClient1 === 'READ' ||
                user.percentClient1 === 'WRITE'
              "
            >
              {{ row.percentClient }}
            </td>
            <td
              class="border-[1px]"
              v-if="
                user.deliveredKGT1 === 'READ' || user.deliveredKGT1 === 'WRITE'
              "
            >
              {{ row.deliveredKGT }}
            </td>
            <td
              class="border-[1px]"
              v-if="
                (user.amountFromClient1 === 'READ' ||
                  user.amountFromClient1 === 'WRITE') &&
                !isDateGreaterThanReference(row.created_at)
              "
            >
              {{ Math.ceil(+row.amountFromClient1 / 10) * 10 }}
            </td>
            <td
              class="border-[1px]"
              v-if="
                (user.amountFromClient1 === 'READ' ||
                  user.amountFromClient1 === 'WRITE') &&
                isDateGreaterThanReference(row.created_at)
              "
            >
              {{ +roundToNearestTen(+row.amountFromClient1) }}
            </td>
            <td
              class="px-2 py-4 border-[1px]"
              v-if="
                user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'
              "
            >
              {{ row.dispatchPVZ }}
            </td>
            <td
              class="px-2 py-4 border-[1px]"
              v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'"
            >
              {{ row.orderPVZ }}
            </td>
            <td
              class="px-2 py-4 border-[1px]"
              v-if="
                user.orderAccount === 'READ' || user.orderAccount === 'WRITE'
              "
            >
              {{ row.orderAccount }}
            </td>
            <td
              class="border-[1px]"
              v-if="
                user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'
              "
            >
              <h1 class="font-bold text-green-500">
                {{
                  row.deliveredSC
                    ? storeUsers.getNormalizedDate(row.deliveredSC)
                    : ""
                }}
              </h1>
            </td>
            <td
              class="border-[1px]"
              v-if="
                (user.deliveredPVZ1 === 'READ' ||
                  user.deliveredPVZ1 === 'WRITE') &&
                user.role !== 'SORTIROVKA'
              "
            >
              <h1 class="font-bold text-green-500">
                {{
                  row.deliveredPVZ
                    ? storeUsers.getNormalizedDate(row.deliveredPVZ)
                    : ""
                }}
              </h1>
            </td>
            <td
              class="border-[1px]"
              v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'"
            >
              <h1 class="font-bold text-green-500">
                {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
              </h1>
            </td>
            <td
              class="px-6 py-4 border-[1px]"
              v-if="
                user.additionally1 === 'READ' || user.additionally1 === 'WRITE'
              "
            >
              {{ row.additionally ? row.additionally : "Пусто" }}
            </td>

            <td
              class="px-1 py-4 border-[1px]"
              v-if="
                (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
                row.additionally !== 'Отказ клиент' &&
                row.additionally !== 'Отказ клиент онлайн' &&
                row.additionally !== 'Отказ клиент наличные' &&
                row.additionally !== 'Отказ брак' &&
                !row.prepayment &&
                !isDateGreaterThanReference(row.created_at)
              "
            >
              {{
                Math.ceil(row.amountFromClient1 / 10) * 10 -
                row.priceSite +
                row.deliveredKGT
              }}
            </td>

            <td
              class="px-1 py-4 border-[1px]"
              v-if="
                (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
                row.additionally !== 'Отказ клиент' &&
                row.additionally !== 'Отказ клиент онлайн' &&
                row.additionally !== 'Отказ клиент наличные' &&
                row.additionally !== 'Отказ брак' &&
                !row.prepayment &&
                isDateGreaterThanReference(row.created_at)
              "
            >
              {{
                roundToNearestTen(row.amountFromClient1) -
                row.priceSite +
                row.deliveredKGT
              }}
            </td>

            <td
              class="px-1 py-4 border-[1px]"
              v-if="
                (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
                row.additionally !== 'Отказ клиент' &&
                row.additionally !== 'Отказ клиент онлайн' &&
                row.additionally !== 'Отказ клиент наличные' &&
                row.additionally !== 'Отказ брак' &&
                row.prepayment
              "
            >
              {{
                row.percentClient !== 0
                  ? Math.ceil(
                      (row.priceSite * row.percentClient) / 100 +
                        row.deliveredKGT
                    )
                  : row.deliveredKGT
              }}
            </td>

            <td
              class="px-1 py-4 border-[1px]"
              v-if="
                (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
                (row.additionally === 'Отказ клиент' ||
                  row.additionally === 'Отказ клиент онлайн' ||
                  row.additionally === 'Отказ клиент наличные' ||
                  row.additionally === 'Отказ брак')
              "
            >
              {{ row.profit1 }}
            </td>

            <td
              class="px-6 border-[1px]"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ storeUsers.getNormalizedDate(row.created_at) }}
            </td>
            <td
              class="px-6 border-[1px]"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ storeUsers.getNormalizedDate(row.updated_at) }}
            </td>
            <td
              class="px-6 border-[1px]"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ storeUsers.getNormalizedDate(row.deleted) }}
            </td>
            <td
              class="px-6 border-[1px]"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ row.createdUser }}
            </td>
            <td
              class="px-6 border-[1px]"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ row.updatedUser }}
            </td>
            <div id="right"></div>
          </tr>
        </tbody>
      </table>
      <div id="down"></div>
    </div>

    <div v-else>
      <h1 class="text-center text-xl bg-gray-100 py-10 mt-5">Таблица пуста!</h1>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
