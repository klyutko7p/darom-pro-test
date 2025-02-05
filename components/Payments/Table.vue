<script setup lang="ts">
import type { PropType } from "vue";
import VueMultiselect from "vue-multiselect";

import { read, utils, writeFile, write } from "xlsx";
const storeAdvanceReport = useAdvanceReports();

let fullYear = ref(2025);
function editYear(year: number) {
  fullYear.value = year;
  localStorage.setItem("yearPayment", JSON.stringify(fullYear.value));
}

const emit = defineEmits([
  "openModal",
  "deleteRow",
  "getMonth",
  "createAdvanceReport",
  "getRowByIdFromInput",
]);

function openModal(row: MonthlyPayment) {
  emit("openModal", row);
}

function getMonth() {
  emit("getMonth", month.value);
}

function deleteRow(id: number) {
  emit("deleteRow", id);
}

function createAdvanceReport(row: MonthlyPayment, createdUser: string) {
  emit("createAdvanceReport", { row, createdUser });
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<MonthlyPayment[]>, required: true },
  advanceRows: { type: Array as PropType<IAdvanceReport[]>, required: true },
});

function filterRows(monthData: number) {
  month.value = monthData;
  updateCurrentPageData();
}

let month = ref(new Date().getMonth() + 1);

const filteredRows = ref(
  props.rows?.filter((row: MonthlyPayment) => {
    let rowDate: Date = new Date(row.date);
    return (
      rowDate.getMonth() + 1 === month.value &&
      rowDate.getFullYear() === fullYear.value
    );
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

const handleBeforeUnload = (event: any) => {
  event.preventDefault();
  event.returnValue = "";
};

onMounted(() => {
  getMonth();

  const storedYearData = loadFromLocalStorage("yearPayroll");
  if (storedYearData !== null) {
    fullYear.value = storedYearData;
  }

  const storedMonthData = loadFromLocalStorage("monthDataPayroll");
  if (storedMonthData !== null) {
    month.value = storedMonthData;
  }

  updateCurrentPageData();

  if (
    props.user.username !== "Директор" &&
    props.user.username !== "Власенкова"
  ) {
    columns.splice(columns.length - 1, 1);
  }
});

let returnRows = ref<Array<MonthlyPayment>>([]);

function updateCurrentPageData() {
  returnRows.value = props.rows;
  returnRows.value = returnRows.value?.map((row) => {
    return {
      ...row,
      date: new Date(fullYear.value, month.value - 1, 2),
    };
  });

  returnRows.value = returnRows.value.filter((row) => {
    return !props.advanceRows.some((aRows) => {
      return (
        row.PVZ === aRows.PVZ &&
        row.company === aRows.company &&
        new Date(row.date).getFullYear() ===
          new Date(aRows.date).getFullYear() &&
        new Date(row.date).getMonth() === new Date(aRows.date).getMonth() &&
        new Date(row.date).getDate() === new Date(aRows.date).getDate() &&
        row.expenditure === aRows.expenditure.toString() &&
        row.typeOfExpenditure === aRows.typeOfExpenditure &&
        row.type === aRows.type &&
        row.notation === aRows.notation
      );
    });
  });

  filteredRows.value = returnRows.value?.filter((row: MonthlyPayment) => {
    let rowDate: Date = new Date(row.date);
    return (
      rowDate.getMonth() + 1 === +month.value &&
      rowDate.getFullYear() === fullYear.value
    );
  });

  // filterRowsCompanyAndPVZ();
}

const storePayments = usePaymentsStore();

let arrayWithModifiedRows = ref<Array<MonthlyPayment>>([]);

async function getRowByIdFromInput(row: MonthlyPayment) {
  arrayWithModifiedRows.value.push(row);
  arrayWithModifiedRows.value = [...new Set(arrayWithModifiedRows.value)];

  emit("getRowByIdFromInput", arrayWithModifiedRows.value);
}

const storeAdvanceReports = useAdvanceReports();
let selectedCompany = ref("");
let selectedPVZ = ref("");

let pvzs = ref([
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
  "ПВЗ_1",
  "ПВЗ_2",
  "ПВЗ_3",
  "ПВЗ_4",
  "ППВЗ_5",
  "ППВЗ_7",
  "ПВЗ_8",
  "ППВЗ_9",
  "ПВЗ_10",
  "ПВЗ_11",
  "ППВЗ_12",
  "ПВЗ_13",
  "ПВЗ_14",
  "Магазин",
  "Офис",
  "НаДом",
]);

const filterRowsCompanyAndPVZ = () => {
  filteredRows.value = props.rows?.slice();
  filteredRows.value = props.rows?.filter((row) => {
    return !selectedPVZ.value.length || selectedPVZ.value.includes(row.PVZ);
  });

  filteredRows.value = filteredRows.value?.map((row) => {
    return {
      ...row,
      date: new Date(fullYear.value, month.value - 1, 2),
    };
  });

  filteredRows.value = filteredRows.value.filter((row) => {
    return !props.advanceRows.some((aRows) => {
      return (
        row.PVZ === aRows.PVZ &&
        row.company === aRows.company &&
        new Date(row.date).getFullYear() ===
          new Date(aRows.date).getFullYear() &&
        new Date(row.date).getMonth() === new Date(aRows.date).getMonth() &&
        new Date(row.date).getDate() === new Date(aRows.date).getDate() &&
        row.expenditure === aRows.expenditure.toString() &&
        row.typeOfExpenditure === aRows.typeOfExpenditure &&
        row.type === aRows.type &&
        row.notation === aRows.notation
      );
    });
  });

  filteredRows.value = filteredRows.value?.filter((row: MonthlyPayment) => {
    let rowDate: Date = new Date(row.date);
    return (
      rowDate.getMonth() + 1 === +month.value &&
      rowDate.getFullYear() === fullYear.value
    );
  });
};

function saveToLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocalStorage(key: string) {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : null;
}

function saveFiltersToLocalStorage() {
  saveToLocalStorage("monthDataPayroll", month.value);
}

watch([props.rows, totalRows, props.user], updateCurrentPageData);
watch([selectedPVZ], filterRowsCompanyAndPVZ);
watch(month, saveFiltersToLocalStorage);

const columns = [
  {
    key: "paid",
    label: "Оплачено",
  },
  {
    key: "date",
    label: "Дата",
  },
  {
    key: "PVZ",
    label: "ПВЗ",
    sortable: true,
  },
  {
    key: "expenditure",
    label: "Расход",
  },
  {
    key: "typeOfExpenditure",
    label: "Статья расхода",
  },
  {
    key: "notation",
    label: "Комментарий",
  },
  {
    key: "company",
    label: "Компания",
    sortable: true,
  },
  {
    key: "type",
    label: "Тип",
  },
  {
    key: "actions",
  },
];

const items = (row: MonthlyPayment) => [
  [
    {
      label: "Изменить",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => openModal(row),
    },
  ],
  [
    {
      label: "Удалить",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteRow(row.id),
    },
  ],
];

const dropdownStates = ref({} as any);

const toggleDropdown = (rowId: any) => {
  dropdownStates.value = {};

  dropdownStates.value[rowId] = !dropdownStates.value[rowId];
};

const storeUsers = useUsersStore();
</script>
<template>
  <div class="my-10 flex items-center gap-5">
    <span
      :class="{ 'bg-secondary-color text-white': fullYear === 2025 }"
      class="border-[1px] py-1 px-5 border-secondary-color hover:cursor-pointer duration-200 rounded-full"
      @click="
        (showFilters = true), editYear(2025), filterRows(month), getMonth()
      "
      >2025</span
    >
    <div
      v-if="showFilters"
      class="flex items-center w-full justify-between max-sm:flex-col gap-3 max-sm:items-end"
    >
      <select
        class="py-1 px-2 border-[1px] rounded-lg text-base border-secondary-color bg-secondary-color text-white font-bold"
        v-model="month"
        @change="filterRows(month), getMonth()"
      >
        <option
          v-for="(monthName, monthNumber) in monthNames"
          :value="monthNumber"
        >
          {{ monthName }}
        </option>
      </select>
    </div>
  </div>

  <div class="w-full max-w-[500px] max-lg:max-w-none">
    <div>
      <h1 class="text-lg mb-1 font-bold mt-3">Фильтр по ПВЗ</h1>
      <VueMultiselect
        v-model="selectedPVZ"
        :options="pvzs"
        :multiple="true"
        :close-on-select="true"
        placeholder="Выберите ПВЗ"
      />
    </div>
  </div>

  <UTable
    class="w-full mx-auto text-center bg-white border-[1px] rounded-md mt-5 max-h-[500px]"
    :ui="{
  td: {
    base: 'border-[1px] text-center whitespace-normal',
    padding: 'px-3 py-2',
  },
  th: {
    base: 'text-center uppercase sticky top-0 z-[20] bg-white',
    padding: 'px-1',
    size: 'text-xs'
  },
  default:
  {
    checkbox:
      { color: 'gray' as any }
  },
    }"
    :rows="filteredRows"
    :columns="columns"
    sort-asc-icon="i-heroicons-arrow-up"
    sort-desc-icon="i-heroicons-arrow-down"
  >
    <template #paid-data="{ row }">
      <Icon
        @click="createAdvanceReport(row, user.username)"
        class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
        name="mdi:checkbox-multiple-marked-circle"
        size="32"
      />
    </template>

    <template #expenditure-data="{ row }">
      <input
        @blur="getRowByIdFromInput(row)"
        v-model="row.expenditure"
        class="min-w-[170px] w-full relative block disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-textarea rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
        type="text"
      />
      <span class="hidden">{{ row.expenditure }} </span>
    </template>

    <template #date-data="{ row }">
      {{ storeUsers.getNormalizedDateWithoutTime(row.date) }}
    </template>

    <template
      v-if="user.username === 'Власенкова' || user.username === 'Директор'"
      #actions-data="{ row }"
    >
      <UDropdown :open="dropdownStates[row.id]" :items="items(row)">
        <UButton
          variant="ghost"
          color="gray"
          class="text-sm duration-200"
          @touchstart.stop="toggleDropdown(row.id)"
        >
          ...
        </UButton>
      </UDropdown>
    </template>
  </UTable>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>
