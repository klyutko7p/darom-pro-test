import type updateDelivery from "~/server/api/ransom/update-delivery"; import type {
userInfo } from "os";
<script setup lang="ts">
import type { PropType } from "vue";
import { useToast } from "vue-toastification";
import { read, utils, writeFile } from "xlsx";

const toast = useToast();

const storeUsers = useUsersStore();

const props = defineProps({
  rows: {
    type: Array as PropType<IOurRansom[] | IClientRansom[]>,
    required: true,
  },
  user: { type: Object as PropType<Client> },
  link: { type: String },
});

function exportToExcel() {
  let table = document.querySelector("#theTable");

  let wb = utils.table_to_book(table);

  writeFile(wb, "информация_о_заказе.xlsx");
}
let isShowWarning = ref(false);

function isExpired(row: any) {
  if (row.deliveredSC !== null && row.deliveredPVZ !== null && row.issued === null) {
    const currentDate = new Date();

    const deliveredDate = new Date(row.deliveredPVZ);

    const difference = currentDate - deliveredDate;

    const daysDifference = difference / (1000 * 3600 * 24);

    if (daysDifference >= 7) {
      isShowWarning.value = true;
      return daysDifference >= 7;
    }
  }
}

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
</script>

<template>
  <h1 v-if="isShowWarning" class="mt-3 font-bold text-xl max-sm:text-center text-red-500">
    Некоторые товары скоро будут отправлены в возврат, рекомендуем забрать заказ в
    ближайшее время!
  </h1>
  <div class="flex justify-end">
    <UTooltip text="Скачать EXCEL" :shortcuts="['xlsx']" :popper="{ placement: 'right' }">
      <div
        class="bg-secondary-color cursor-pointer border-[1px] border-secondary-color text-white hover:text-secondary-color hover:bg-transparent duration-200 px-2 pt-2 pb-1 rounded-full"
        @click="exportToExcel"
      >
        <Icon class="duration-200" size="32" name="bi:filetype-xlsx" />
      </div>
    </UTooltip>
  </div>
  <div class="relative max-h-[700px] rounded-xl mt-5 mb-10" v-if="rows">
    <table
      id="theTable"
      class="w-full border-[1px] border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead class="text-xs bg-[#36304a] text-white sticky top-0 z-30 uppercase text-center">
        <tr>
          <th scope="col" class="border-[1px]">номер</th>
          <th
            scope="col"
            class="border-[1px]"
            v-if="link?.startsWith('1') || link?.startsWith('2')"
          >
            ячейка
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('3')">имя</th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('3')">название</th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('1')">
            товар (ссылка)
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('2')">маркетплейс</th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('1')">
            название товара
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('2')">
            количество товаров
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('3')">
            сумма выкупа товара
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('3')">
            процент с клиента (%)
          </th>
          <th scope="col" class="border-[1px]">сумма с клиента</th>
          <th
            scope="col"
            class="border-[1px]"
            v-if="link?.startsWith('1') || link?.startsWith('2')"
          >
            предоплата
          </th>
          <th
            scope="col"
            class="border-[1px]"
            v-if="link?.startsWith('1') || link?.startsWith('2')"
          >
            доставлено на сц
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('3')">отсортировано</th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('3')">оплачено</th>
          <th
            scope="col"
            class="border-[1px]"
            v-if="link?.startsWith('1') || link?.startsWith('2')"
          >
            готов к выдаче
          </th>
          <th
            scope="col"
            class="border-[1px]"
            v-if="link?.startsWith('1') || link?.startsWith('2')"
          >
            выдано
          </th>
          <th
            scope="col"
            class="border-[1px]"
            v-if="link?.startsWith('1') || link?.startsWith('2')"
          >
            дополнительно
          </th>
          <th
            scope="col"
            class="border-[1px]"
            v-if="link?.startsWith('1') || link?.startsWith('2')"
          >
            создан (время)
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          :class="{ 'bg-red-500': isExpired(row) }"
          class="bg-white border-b text-center text-sm"
          v-for="(row, index) in rows"
          :key="index"
        >
          <td class="border-[1px]">
            {{ index + 1 }}
          </td>
          <td class="border-[1px]" v-if="link?.startsWith('1') || link?.startsWith('2')">
            {{ row.cell }}
          </td>
          <td class="px-2 border-[1px]" v-if="link?.startsWith('3')">
            {{ row.name }}
          </td>
          <td class="px-2 border-[1px]" v-if="link?.startsWith('3')">
            {{ row.nameOfAction }}
          </td>
          <td
            v-if="link?.startsWith('1')"
            class="underline border-[1px] text-secondary-color whitespace-nowrap overflow-hidden max-w-[100px]"
          >
            <a
              :href="row.productLink"
              target="_blank"
              class="hover:text-orange-200 duration-200"
            >
              {{ row.productLink }}
            </a>
          </td>
          <td
            v-if="link?.startsWith('2')"
            class="border-[1px] whitespace-nowrap overflow-hidden max-w-[100px]"
          >
            {{ row.productLink }}
          </td>
          <td v-if="link?.startsWith('1') || link?.startsWith('2')" class="border-[1px]">
            {{ row.productName }}
          </td>
          <td
            v-if="
              (row.amountFromClient1 ||
                row.amountFromClient1 === null ||
                row.amountFromClient1 === 0) &&
              !isDateGreaterThanReference(row.created_at)
            "
            class="border-[1px]"
          >
            {{ Math.ceil(row.amountFromClient1 / 10) * 10 }}
          </td>
          <td
            v-if="
              (row.amountFromClient1 ||
                row.amountFromClient1 === null ||
                row.amountFromClient1 === 0) &&
              isDateGreaterThanReference(row.created_at)
            "
            class="border-[1px]"
          >
            {{ roundToNearestTen(row.amountFromClient1) }}
          </td>
          <td
            v-if="
              row.amountFromClient2 ||
              row.amountFromClient2 === null ||
              row.amountFromClient2 === 0
            "
            class="border-[1px]"
          >
            {{ Math.ceil(row.amountFromClient2 / 10) * 10 }}
          </td>
          <td v-if="link?.startsWith('3')" class="border-[1px]">
            {{ row.purchaseOfGoods }}
          </td>
          <td v-if="link?.startsWith('3')" class="border-[1px]">
            {{ row.percentClient }}
          </td>
          <td
            v-if="
              row.amountFromClient3 ||
              row.amountFromClient3 === null ||
              row.amountFromClient3 === 0
            "
            class="border-[1px]"
          >
            {{ row.amountFromClient3 }}
          </td>
          <td v-if="link?.startsWith('1') || link?.startsWith('2')" class="border-[1px]">
            {{ row.prepayment }}
          </td>
          <td class="border-[1px]" v-if="link?.startsWith('3')">
            <h1 class="font-bold text-green-500">
              {{ row.sorted ? storeUsers.getNormalizedDate(row.sorted) : "" }}
            </h1>
          </td>
          <td class="border-[1px]" v-if="link?.startsWith('1') || link?.startsWith('2')">
            <h1 class="font-medium text-gray-400 text-xs" v-if="row.orderPVZ !== null">
              {{
                row.deliveredSC
                  ? storeUsers.getNormalizedDate(row.deliveredSC)
                  : "Товар в пути"
              }}
            </h1>
            <h1 class="font-medium text-gray-400 text-xs" v-else>
              {{ "В обработке" }}
            </h1>
          </td>
          <td class="border-[1px]" v-if="link?.startsWith('3')">
            <h1 class="font-bold text-green-500">
              {{ row.paid ? storeUsers.getNormalizedDate(row.paid) : "" }}
            </h1>
          </td>
          <td class="border-[1px]" v-if="link?.startsWith('1') || link?.startsWith('2')">
            <h1 class="font-bold text-green-500">
              {{ row.deliveredPVZ ? storeUsers.getNormalizedDate(row.deliveredPVZ) : "" }}
            </h1>
          </td>
          <td class="border-[1px]" v-if="link?.startsWith('1') || link?.startsWith('2')">
            <h1 class="font-bold text-green-500">
              {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
            </h1>
          </td>
          <td class="border-[1px]" v-if="link?.startsWith('1') || link?.startsWith('2')">
            {{ row.additionally ? row.additionally : "Пусто" }}
          </td>
          <td
            class="px-6 py-4 border-[1px]"
            v-if="link?.startsWith('1') || link?.startsWith('2')"
          >
            {{ storeUsers.getNormalizedDate(row.created_at) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
