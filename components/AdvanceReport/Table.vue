<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();
import { read, utils, writeFile, write } from "xlsx";

const emit = defineEmits(["openModal", "updateDeliveryRow", "deleteRow"]);

function updateDeliveryRow(row: IAdvanceReport) {
  emit("updateDeliveryRow", { row: row });
}

function deleteRow(id: number) {
  emit("deleteRow", { id });
}

function openModal(row: IAdvanceReport) {
  emit("openModal", row);
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IAdvanceReport[]> },
});

function filterRows(monthData: number) {
  month.value = monthData;
  updateCurrentPageData();
}

let month = ref(new Date().getMonth() + 1);

const filteredRows = ref(
  props.rows?.filter((row: IAdvanceReport) => {
    let rowDate: Date = new Date(row.date);
    return rowDate.getMonth() + 1 === month.value;
  })
);

let showFilters = ref(false);
let months = ref([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2]);
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

const totalRows = computed(() => Math.ceil(props.rows?.length));
onMounted(() => {
  updateCurrentPageData();
});

let returnRows = ref<Array<IAdvanceReport>>();

import Cookies from "js-cookie";

const isDateFilterCookie = Cookies.get("isDateFilter");

let isDateFilter = ref(
  isDateFilterCookie !== undefined ? JSON.parse(isDateFilterCookie) : true
);

function updateCurrentPageData() {
  if (isDateFilter.value) {
    saveIsDateFilterToCookie(true);
    returnRows.value = props.rows;
    filteredRows.value = returnRows.value?.filter((row: IAdvanceReport) => {
      let rowDate: Date = new Date(row.date);
      return rowDate.getMonth() + 1 === +month.value;
    });
  } else {
    saveIsDateFilterToCookie(false);
    returnRows.value = props.rows;
    filteredRows.value = returnRows.value;
  }
}

watch([props.rows, totalRows, props.user], updateCurrentPageData);
watch([isDateFilter], updateCurrentPageData);

function saveIsDateFilterToCookie(value: boolean) {
  Cookies.set("isDateFilter", JSON.stringify(value));
}

function exportToExcel() {
  let table = document.querySelector("#theTable");
  let wb = utils.table_to_book(table);
  writeFile(wb, "авансовый_отчет.xlsx");
}
</script>
<template>
  <div
    class="flex items-center justify-between mt-10 max-sm:flex-col max-sm:items-start max-sm:gap-3"
  >
    <div
      class="flex items-center max-sm:items-center max-sm:justify-between max-[400px]:flex-col max-[400px]:items-start gap-5"
    >
      <span
        class="border-[1px] bg-white py-1 px-5 border-secondary-color hover:cursor-pointer hover:bg-secondary-color hover:text-white duration-200 rounded-full"
        @click="showFilters = !showFilters"
        >2024</span
      >
      <div
        v-if="showFilters"
        class="flex items-center w-full justify-between max-sm:items-start"
      >
        <select
          class="py-1 px-2 border-[1px] rounded-lg text-base border-secondary-color bg-secondary-color text-white font-bold"
          v-model="month"
          @change="filterRows(month)"
        >
          <option
            v-for="(monthName, monthNumber) in monthNames"
            :value="monthNumber"
          >
            {{ monthName }}
          </option>
        </select>
        <div class="ml-2 space-x-2">
          <input type="checkbox" v-model="isDateFilter" />
          <label for="" class="text-sm">Данные за 1 месяц?</label>
        </div>
      </div>
    </div>
    <div class="max-sm:flex max-sm:justify-end max-sm:w-full">
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
  </div>

  <div
    class="relative max-h-[410px] bg-white overflow-y-auto mt-5 mb-10"
    v-if="filteredRows?.length > 0"
  >
    <table
      id="theTable"
      class="w-full bg-white border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs bg-[#36304a] border-[1px] text-white sticky top-0 z-30 uppercase text-center"
      >
        <tr>
          <th
            scope="col"
            class="exclude-row px-3 border-[1px] h-[60px]"
            v-if="user.username === 'Директор'"
          >
            редакт.
          </th>
          <th scope="col" class="px-1 border-[1px]">Дата</th>
          <th scope="col" class="px-1 border-[1px]">ПВЗ</th>
          <th scope="col" class="px-1 border-[1px]">Сумма (₽)</th>
          <th scope="col" class="px-1 border-[1px]">Статья расхода</th>
          <th scope="col" class="px-1 border-[1px]">Комментарий</th>
          <th scope="col" class="px-1 border-[1px]">Компания</th>
          <th scope="col" class="px-1 border-[1px]">Создано</th>
          <th scope="col" class="px-1 border-[1px]">Получил</th>
          <th scope="col" class="px-1 border-[1px]">Документ</th>
          <th scope="col" class="px-1 border-[1px]">Получено</th>
          <th
            scope="col"
            class="px-1 border-[1px]"
            v-if="user.username === 'Директор'"
          >
            Тип
          </th>
          <th
            scope="col"
            class="px-1 border-[1px]"
            v-if="user.username === 'Директор'"
          >
            Дата создания
          </th>
          <th
            scope="col"
            class="px-1 border-[1px]"
            v-if="user.username === 'Директор'"
          >
            Удаление
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in filteredRows"
          class="text-center h-[50px] border-[1px]"
        >
          <td class="border-[1px]" v-if="user.username === 'Директор'">
            <div
              @click="openModal(row)"
              class="bg-green-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
            >
            <div
              @click="openModal(row)"
              class="bg-green-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
            >
              <Icon
                class="text-green-500"
                name="ic:baseline-mode-edit"
                size="18"
              />
            </div>
            </div>
          </td>
          <th scope="row" class="border-[1px] px-2">
            {{ storeUsers.getNormalizedDateWithoutTime(row.date) }}
          </th>
          <th scope="row" class="border-[1px]">
            {{ row.PVZ ? row.PVZ : "—" }}
          </th>
          <td class="whitespace-nowrap">{{ row.expenditure }}</td>
          <td class="whitespace-nowrap px-2 border-[1px]">
            {{ row.typeOfExpenditure }}
          </td>
          <td class="px-2 border-[1px]">
            {{ row.notation ? row.notation : "—" }}
          </td>
          <td class="whitespace-nowrap px-2 border-[1px]">
            {{ row.company ? row.company : "—" }}
          </td>
          <td class="whitespace-nowrap px-2 border-[1px]">
            {{ row.createdUser }}
          </td>
          <td class="whitespace-nowrap border-[1px]">
            {{ row.issuedUser ? row.issuedUser : "—" }}
          </td>
          <td class="whitespace-nowrap border-[1px]">
            <a
              target="_blank"
              class="text-secondary-color hover:opacity-60 duration-200 font-bold"
              v-if="
                row.supportingDocuments && row.supportingDocuments.length > 2
              "
              :href="`https://fomoljxhkywsdgnchewy.supabase.co/storage/v1/object/public/image/img-${row.supportingDocuments}`"
            >
              Фото
            </a>
            <h1 v-else>—</h1>
          </td>
          <td class="whitespace-nowrap border-[1px]">
            <Icon
              @click="updateDeliveryRow(row)"
              v-if="
                (user.username === row.issuedUser && !row.received) ||
                (user.username === 'Директор' &&
                  row.issuedUser === 'Директор (С)' &&
                  !row.received)
              "
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle"
              size="32"
            />
            <h1 class="font-bold text-green-500">
              {{
                row.received ? storeUsers.getNormalizedDate(row.received) : ""
              }}
            </h1>
            <h1 v-if="!row.received && !row.issuedUser">—</h1>
          </td>
          <td
            class="whitespace-nowrap px-2 border-[1px]"
            v-if="user.username === 'Директор'"
          >
            {{ row.type }}
          </td>
          <td
            class="whitespace-nowrap px-2 border-[1px]"
            v-if="user.username === 'Директор'"
          >
            {{ storeUsers.getNormalizedDate(row.created_at) }}
          </td>
          <td
            class="whitespace-nowrap border-[1px]"
            v-if="user.username === 'Директор'"
          >
            <div
              @click="deleteRow(row.id)"
              class="bg-red-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
            >
              <Icon class="text-red-600" name="ic:round-delete" size="18" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="mt-10 mb-10 flex flex-col justify-center items-center">
    <h1 class="text-4xl text-center mb-5">😞</h1>
    <h1 class="text-2xl font-medium text-center">
      Извините, документы не были найдены!
    </h1>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
  /* Цвет для четных строк */
}
</style>
