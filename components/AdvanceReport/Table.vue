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
onBeforeMount(() => {
  updateCurrentPageData();
});

let returnRows = ref<Array<IAdvanceReport>>();

function updateCurrentPageData() {
  if (isDateFilter.value) {
    returnRows.value = props.rows;
    filteredRows.value = returnRows.value?.filter((row: IAdvanceReport) => {
      let rowDate: Date = new Date(row.date);
      return rowDate.getMonth() + 1 === +month.value;
    });
  } else {
    returnRows.value = props.rows;
    filteredRows.value = returnRows.value;
  }
}

let letterOfSorting = ref("M");
function changeSorting(letter: string) {
  letterOfSorting.value = letter;
}

let isDateFilter = ref(true);

watch([props.rows, totalRows, letterOfSorting, props.user], updateCurrentPageData);
watch([isDateFilter], updateCurrentPageData);

let breakpoints = {
  100: {
    slidesPerView: 1,
  },
  400: {
    slidesPerView: 2,
  },
  640: {
    slidesPerView: 3,
  },
  770: {
    slidesPerView: 5,
  },
  1024: {
    slidesPerView: 6,
  },
};

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
    <div class="flex items-center max-sm:flex-col max-sm:items-start gap-5">
      <span
        class="border-2 py-3 px-5 border-secondary-color hover:cursor-pointer hover:bg-secondary-color hover:text-white duration-200 rounded-full"
        @click="showFilters = !showFilters"
        >2024</span
      >
      <div
        v-if="showFilters"
        class="flex items-center w-full justify-between max-sm:items-start"
      >
        <select
          class="py-1 px-2 border-2 bg-transparent rounded-lg text-base"
          v-model="month"
          @change="filterRows(month)"
        >
          <option v-for="(monthName, monthNumber) in monthNames" :value="monthNumber">
            {{ monthName }}
          </option>
        </select>
        <div class="ml-2 space-x-2">
          <input type="checkbox" v-model="isDateFilter" />
          <label for="">Данные за 1 месяц?</label>
        </div>
      </div>
    </div>
    <Icon
      class="duration-200 hover:text-secondary-color cursor-pointer"
      size="40"
      name="material-symbols:sheets-add-on"
      @click="exportToExcel"
    />
  </div>

  <div
    class="relative max-h-[410px] overflow-y-auto mt-5 mb-10"
    v-if="filteredRows?.length > 0"
  >
    <table
      id="theTable"
      class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50"
      >
        <tr>
          <th
            scope="col"
            class="exclude-row border-2"
            v-if="user.username === 'Директор'"
          >
            изменение
          </th>
          <th scope="col" class="border-2">Дата</th>
          <th scope="col" class="border-2">ПВЗ</th>
          <th scope="col" class="border-2">Сумма (₽)</th>
          <th scope="col" class="border-2">Статья расхода</th>
          <th scope="col" class="border-2">Комментарий</th>
          <th scope="col" class="border-2">Компания</th>
          <th scope="col" class="border-2">Создано</th>
          <th scope="col" class="border-2">Получил</th>
          <th scope="col" class="border-2">Подтверждающий документ</th>
          <th scope="col" class="border-2">Получено</th>
          <th scope="col" class="border-2" v-if="user.username === 'Директор'">Тип</th>
          <th scope="col" class="border-2" v-if="user.username === 'Директор'">
            Удаление
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in filteredRows" class="text-center">
          <td class="border-2" v-if="user.username === 'Директор'">
            <h1
              @click="openModal(row)"
              class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
            >
              ✏️
            </h1>
          </td>
          <th scope="row" class="border-2">
            {{ storeUsers.getNormalizedDateWithoutTime(row.date) }}
          </th>
          <th scope="row" class="border-2">
            {{ row.PVZ }}
          </th>
          <td class="border-2 whitespace-nowrap">{{ row.expenditure }}</td>
          <td class="border-2 whitespace-nowrap">
            {{ row.typeOfExpenditure }}
          </td>
          <td class="border-2 whitespace-nowrap">
            {{ row.notation }}
          </td>
          <td class="border-2 whitespace-nowrap">
            {{ row.company }}
          </td>
          <td class="border-2 whitespace-nowrap">
            {{ row.createdUser }}
          </td>
          <td class="border-2 whitespace-nowrap">
            {{ row.issuedUser }}
          </td>
          <td class="border-2 whitespace-nowrap">
            <a
              target="_blank"
              class="text-secondary-color underline font-bold"
              v-if="row.supportingDocuments && row.supportingDocuments.length > 2"
              :href="`https://mgbbkkgyorhwryabwabx.supabase.co/storage/v1/object/public/image/img-${row.supportingDocuments}`"
            >
              Фото
            </a>
          </td>
          <td class="border-2 whitespace-nowrap">
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
              {{ row.received ? storeUsers.getNormalizedDate(row.received) : "" }}
            </h1>
          </td>
          <td class="border-2 whitespace-nowrap" v-if="user.username === 'Директор'">
            {{ row.type }}
          </td>
          <td
            @click="deleteRow(row.id)"
            class="border-2 whitespace-nowrap cursor-pointer"
            v-if="user.username === 'Директор'"
          >
            ❌
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="mt-10 mb-10 flex flex-col justify-center items-center">
    <h1 class="text-4xl text-center mb-5">😞</h1>
    <h1 class="text-2xl font-medium text-center">Извините, документы не были найдены!</h1>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
