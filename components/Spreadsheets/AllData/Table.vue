<script setup lang="ts">
import { read, utils, writeFile, write } from "xlsx";

const storeUsers = useUsersStore();

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IOurRansom[]>, required: true },
});

const perPage = ref(100);
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.ceil((props.rows?.length || 0) / perPage.value)
);
const totalRows = computed(() =>
  Math.ceil(props.rows?.filter((row) => row.deleted === null).length || 0)
);

function roundToNearestTen(num: number): number {
  const lastDigit = num % 10;
  if (lastDigit >= 5) {
    return Math.ceil(num / 10) * 10;
  } else {
    return Math.floor(num / 10) * 10;
  }
}

async function exportToExcel() {
  perPage.value = await totalRows.value;

  let table = await document.querySelector("#theTable");

  let wb = await utils.table_to_book(table);
  await writeFile(wb, "наш_выкуп.xlsx");

  perPage.value = await 100;
}

let returnRows = ref<Array<IOurRansom>>([]);
function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;
  console.log(props.rows);
  returnRows.value = props.rows.slice(startIndex, endIndex);
}

function isDateGreaterThanReference(dateString: string | Date): boolean {
  const referenceDate = new Date("2024-06-05T00:00:01");
  const inputDate = new Date(dateString);
  return inputDate > referenceDate;
}

watch([currentPage, totalRows, props.rows], updateCurrentPageData);

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
</script>

<template>
  <div class="flex items-center justify-between max-lg:block mt-10 mb-5">
    <div>
      <div
        class="flex items-center max-sm:flex-col max-sm:items-start gap-5 mb-5"
      >
        <h1 class="text-xl" v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'">
          Товаров в работе:
          <span class="text-secondary-color font-bold">{{ totalRows }}</span>
        </h1>
        <h1 class="text-xl" v-if="user.role === 'PVZ' || user.role === 'PPVZ'">
          Товаров к выдаче:
          <span class="text-secondary-color font-bold">{{ totalRows }}</span>
        </h1>
      </div>
    </div>
    <div class="flex items-end max-lg:mt-5 max-lg:justify-between gap-20">
      <div class="flex flex-col text-center">
        <h1 class="text-base">Страница:</h1>
        <h1 class="text-base mb-2">{{ currentPage }} из {{ totalPages }}</h1>
        <div class="flex items-center justify-center gap-2">
          <button
            @click="prevPage(), updateCurrentPageData()"
            :disabled="currentPage === 1"
            class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
          >
            <Icon
              name="material-symbols:arrow-back-ios-new-rounded"
              class="text-white"
            />
          </button>
          <button
            @click="nextPage(), updateCurrentPageData()"
            :disabled="currentPage === totalPages"
            class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
          >
            <Icon
              name="material-symbols:arrow-forward-ios-rounded"
              class="text-white"
            />
          </button>
        </div>
      </div>
      <UTooltip
        text="Скачать EXCEL"
        :shortcuts="['xlsx']"
        :popper="{ placement: 'right' }"
      >
        <div
          class="bg-secondary-color cursor-pointer border-2 border-secondary-color text-white hover:text-secondary-color hover:bg-transparent duration-200 px-2 pt-2 pb-1 rounded-full"
          @click="exportToExcel"
        >
          <Icon class="duration-200" size="32" name="bi:filetype-xlsx" />
        </div>
      </UTooltip>
    </div>
  </div>
  <div v-if="rows.length">
    <div class="relative mt-5 mb-10 mr-5">
      <div id="up"></div>
      <table
        id="theTable"
        class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500"
      >
        <thead
          class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50"
        >
          <tr>
            <th scope="col" class="border-2 px-3">id</th>
            <th
              scope="col"
              class="border-2"
              v-if="user.clientLink1 === 'READ' || user.clientLink1 === 'WRITE'"
            >
              ссылка для клиента
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'"
            >
              ячейка
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'"
            >
              телефон
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.productLink1 === 'READ' || user.productLink1 === 'WRITE'
              "
            >
              товар (ссылка)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.productName1 === 'READ' || user.productName1 === 'WRITE'
              "
            >
              название товара
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'"
            >
              примечание
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
            >
              стоимость сайт
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'"
            >
              предоплата
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.percentClient1 === 'READ' ||
                user.percentClient1 === 'WRITE'
              "
            >
              процент с клиента (%)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.deliveredKGT1 === 'READ' || user.deliveredKGT1 === 'WRITE'
              "
            >
              дополнительный доход
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.amountFromClient1 === 'READ' ||
                user.amountFromClient1 === 'WRITE'
              "
            >
              сумма с клиента
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'
              "
            >
              отправка в пвз
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'"
            >
              заказано на сц
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.orderAccount === 'READ' || user.orderAccount === 'WRITE'
              "
            >
              аккаунт заказа
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'
              "
            >
              доставлено на сц
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.deliveredPVZ1 === 'READ' || user.deliveredPVZ1 === 'WRITE'
              "
            >
              доставлено на пвз
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'"
            >
              выдан клиенту
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.additionally1 === 'READ' || user.additionally1 === 'WRITE'
              "
            >
              дополнительно
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.profit1 === 'READ' || user.profit1 === 'WRITE'"
            >
              прибыль (доход)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              создан (время)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              изменен (время)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              удален (время)
            </th>
            <th
              scope="col"
              class="border-2"
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
              class="border-2"
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
          <tr class="border-b text-center text-sm" v-for="row in rows">
            <th
              scope="row"
              class="border-2 font-medium underline text-secondary-color whitespace-nowrap"
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
              class="px-3 py-4 border-2 underline text-secondary-color whitespace-nowrap uppercase overflow-hidden max-w-[50px]"
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
              class="border-2"
            >
              {{ row.cell }}
            </td>
            <td
              v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'"
              class="py-4 border-2 text-secondary-color underline"
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
              class="underline border-2 text-secondary-color whitespace-nowrap overflow-hidden max-w-[30px]"
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
              class="border-2 overflow-hidden max-h-[40px]"
              v-if="
                user.productName1 === 'READ' || user.productName1 === 'WRITE'
              "
            >
              {{ row.productName }}
            </td>
            <td
              class="border-2"
              v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'"
            >
              {{ row.notation ? row.notation : "Пусто" }}
            </td>
            <td
              class="border-2"
              v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
            >
              {{ row.priceSite }}
            </td>
            <td
              class="border-2"
              v-if="user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'"
            >
              {{ row.prepayment }}
            </td>
            <td
              class="border-2"
              v-if="
                user.percentClient1 === 'READ' ||
                user.percentClient1 === 'WRITE'
              "
            >
              {{ row.percentClient }}
            </td>
            <td
              class="border-2"
              v-if="
                user.deliveredKGT1 === 'READ' || user.deliveredKGT1 === 'WRITE'
              "
            >
              {{ row.deliveredKGT }}
            </td>
            <td
              class="border-2"
              v-if="
                (user.amountFromClient1 === 'READ' ||
                  user.amountFromClient1 === 'WRITE') &&
                !isDateGreaterThanReference(row.created_at)
              "
            >
              {{ Math.ceil(row.amountFromClient1 / 10) * 10 }}
            </td>
            <td
              class="border-2"
              v-if="
                (user.amountFromClient1 === 'READ' ||
                  user.amountFromClient1 === 'WRITE') &&
                isDateGreaterThanReference(row.created_at)
              "
            >
              {{ roundToNearestTen(row.amountFromClient1) }}
            </td>
            <td
              class="px-2 py-4 border-2"
              v-if="
                user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'
              "
            >
              {{ row.dispatchPVZ }}
            </td>
            <td
              class="px-2 py-4 border-2"
              v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'"
            >
              {{ row.orderPVZ }}
            </td>
            <td
              class="px-2 py-4 border-2"
              v-if="
                user.orderAccount === 'READ' || user.orderAccount === 'WRITE'
              "
            >
              {{ row.orderAccount }}
            </td>
            <td
              class="border-2"
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
              class="border-2"
              v-if="
                user.deliveredPVZ1 === 'READ' || user.deliveredPVZ1 === 'WRITE'
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
              class="border-2"
              v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'"
            >
              <h1 class="font-bold text-green-500">
                {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
              </h1>
            </td>
            <td
              class="px-6 py-4 border-2"
              v-if="
                user.additionally1 === 'READ' || user.additionally1 === 'WRITE'
              "
            >
              {{ row.additionally ? row.additionally : "Пусто" }}
            </td>

            <td
              class="px-1 py-4 border-2"
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
              class="px-1 py-4 border-2"
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
              class="px-1 py-4 border-2"
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
              class="px-1 py-4 border-2"
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
              class="px-6 border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ storeUsers.getNormalizedDate(row.created_at) }}
            </td>
            <td
              class="px-6 border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ storeUsers.getNormalizedDate(row.updated_at) }}
            </td>
            <td
              class="px-6 border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ storeUsers.getNormalizedDate(row.deleted) }}
            </td>
            <td
              class="px-6 border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ row.createdUser }}
            </td>
            <td
              class="px-6 border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ row.updatedUser }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
