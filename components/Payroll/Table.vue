<script setup lang="ts">
import type { PropType } from "vue";
import VueMultiselect from "vue-multiselect";

import { read, utils, writeFile, write } from "xlsx";
const storeAdvanceReport = useAdvanceReports();

let fullYear = ref(2025);
function editYear(year: number) {
  fullYear.value = year;
}


const emit = defineEmits([
  "openModal",
  "createReport",
  "updateReport",
  "deleteRow",
  "getMonth",
]);

function openModal(row: IPayroll) {
  let answer = true;

  if (arrayWithModifiedRows.value.length) {
    answer = confirm(
      "У Вас есть несохранные данные, в случае продолжения данные не будут сохранены. Продолжить?"
    );
  }

  if (answer) {
    emit("openModal", row);
  }
}

function getMonth() {
  emit("getMonth", month.value);
}

function deleteRow(id: number) {
  let answer = true;

  if (arrayWithModifiedRows.value.length) {
    answer = confirm(
      "У Вас есть несохранные данные, в случае продолжения данные не будут сохранены. Продолжить?"
    );
  }

  if (answer) {
    emit("deleteRow", id);
  }
}

function createReport() {
  let answer = true;

  if (arrayWithModifiedRows.value.length) {
    answer = confirm(
      "У Вас есть несохранные данные, в случае продолжения данные не будут сохранены. Продолжить?"
    );
  }

  if (answer) {
    emit("createReport", {
      rows: props.employees,
      month: month.value,
      year: fullYear.value,
    });
  }
}

function updateReport() {
  emit("updateReport", arrayWithModifiedRows.value);
  arrayWithModifiedRows.value = [];
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IPayroll[]> },
  employees: { type: Array as PropType<IEmployee[]> },
});

function filterRows(monthData: number) {
  month.value = monthData;
  updateCurrentPageData();
}

let month = ref(new Date().getMonth() + 1);

const filteredRows = ref(
  props.rows?.filter((row: IPayroll) => {
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

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

onBeforeRouteLeave((to, from, next) => {
  if (arrayWithModifiedRows.value.length) {
    const answer = window.confirm(
      "Вы точно хотите покинуть эту страницу? У Вас есть несохраненные данные."
    );

    if (answer) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
  getMonth();

  const storedMonthData = loadFromLocalStorage("monthDataPayroll");
  if (storedMonthData !== null) {
    month.value = storedMonthData;
  }

  updateCurrentPageData();
});

let returnRows = ref<Array<IPayroll>>();

function updateCurrentPageData() {
  returnRows.value = props.rows;
  filteredRows.value = returnRows.value?.filter((row: IPayroll) => {
    let rowDate: Date = new Date(row.date);
    return (
      rowDate.getMonth() + 1 === +month.value &&
      rowDate.getFullYear() === fullYear.value
    );
  });

  filterRowsCompanyAndPVZ();
}

let arrayWithModifiedRows = ref<Array<IPayroll>>([]);
function getRowByIdFromInput(row: IPayroll) {
  arrayWithModifiedRows.value.push(row);
  arrayWithModifiedRows.value = [...new Set(arrayWithModifiedRows.value)];
}

function getAllSumAdvance() {
  return (
    filteredRows.value?.reduce((acc, value) => {
      return acc + (+value.advance || 0) + (+value.advanceFourssan || 0);
    }, 0) || 0
  );
}

function getAllSumZP() {
  return filteredRows.value?.reduce((acc, row) => {
    const payment =
      row.hours * row.paymentPerShift -
      row.advance -
      row.advanceFourssan -
      row.salaryFourssan -
      row.deductions +
      row.additionalPayment;
    return acc + payment;
  }, 0)
    ? filteredRows.value?.reduce((acc, row) => {
        const payment =
          row.hours * row.paymentPerShift -
          row.advance -
          row.advanceFourssan -
          row.salaryFourssan -
          row.deductions +
          row.additionalPayment;
        return acc + payment;
      }, 0)
    : 0;
}

function getAllSumZPMonth() {
  return filteredRows.value?.reduce((acc, row) => {
    const payment =
      row.advance +
      row.advanceFourssan +
      row.salaryFourssan +
      (row.hours * row.paymentPerShift -
        row.advance -
        row.advanceFourssan -
        row.salaryFourssan -
        row.deductions +
        row.additionalPayment);
    return acc + payment;
  }, 0)
    ? filteredRows.value?.reduce((acc, row) => {
        const payment =
          row.advance +
          row.advanceFourssan +
          row.salaryFourssan +
          (row.hours * row.paymentPerShift -
            row.advance -
            row.advanceFourssan -
            row.salaryFourssan -
            row.deductions +
            row.additionalPayment);
        return acc + payment;
      }, 0)
    : 0;
}

function getAllSumZPMonthWithoutDeductions() {
  return filteredRows.value?.reduce((acc, row) => {
    const payment =
      row.advance +
      row.advanceFourssan +
      row.salaryFourssan +
      (row.hours * row.paymentPerShift -
        row.advance -
        row.advanceFourssan -
        row.salaryFourssan +
        row.additionalPayment);
    return acc + payment;
  }, 0)
    ? filteredRows.value?.reduce((acc, row) => {
        const payment =
          row.advance +
          row.advanceFourssan +
          row.salaryFourssan +
          (row.hours * row.paymentPerShift -
            row.advance -
            row.advanceFourssan -
            row.salaryFourssan +
            row.additionalPayment);
        return acc + payment;
      }, 0)
    : 0;
}

async function exportToExcel() {
  await hideHiddenFields();
  let table = document.querySelector(".table-fixed");
  let wb = utils.table_to_book(table);
  await writeFile(wb, "расчёт_зп.xlsx");
  await showHiddenFields();
}

async function createAdvanceReportAdvance() {
  let rows = filteredRows.value?.filter((row) => row.advance);
  let rowsFourssan = filteredRows.value?.filter((row) => row.advanceFourssan);

  let groupedRows = rows?.reduce((acc: any, row: any) => {
    const key = `${row.PVZ}_${row.company}`;
    if (!acc[key]) {
      acc[key] = {
        PVZ: row.PVZ,
        company: row.company,
        expenditureSum: 0,
      };
    }
    acc[key].expenditureSum += parseFloat(row.advance);
    return acc;
  }, {});

  const selectedMonth = month.value;

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const date = new Date();

  let resultRows = Object.values(groupedRows).map((groupedRow: any) => ({
    PVZ: groupedRow.PVZ,
    expenditure: Math.ceil(groupedRow.expenditureSum).toString(),
    typeOfExpenditure: "Оплата ФОТ",
    company: groupedRow.company,
    createdUser: "Директор",
    type: "Нал",
    date: date,
    issuedUser: "",
  }));

  let groupedRowsFourssan = rowsFourssan?.reduce((acc: any, row: any) => {
    const key = `${row.PVZ}_${row.company}`;
    if (!acc[key]) {
      acc[key] = {
        PVZ: row.PVZ,
        company: row.company,
        expenditureSum: 0,
      };
    }
    acc[key].expenditureSum += parseFloat(row.advanceFourssan);
    return acc;
  }, {});

  let resultRowsFourssan = Object.values(groupedRowsFourssan).map(
    (groupedRow: any) => ({
      PVZ: groupedRow.PVZ,
      expenditure: Math.ceil(groupedRow.expenditureSum).toString(),
      typeOfExpenditure: "Оплата ФОТ",
      company: groupedRow.company,
      createdUser: "Директор",
      type: "Безнал",
      date: date,
      issuedUser: "",
    })
  );

  let answer = confirm("Вы точно хотите создать отчет по авансу?");
  if (answer) {
    await storeAdvanceReport.createAdvanceReports(resultRows);
    await storeAdvanceReport.createAdvanceReports(resultRowsFourssan);
  }
}

async function createAdvanceReportZP() {
  let rows = filteredRows.value?.filter((row) => {
    return (
      row.hours * row.paymentPerShift -
      row.advance -
      row.advanceFourssan -
      row.salaryFourssan -
      row.deductions +
      row.additionalPayment
    );
  });

  let groupedRows = rows?.reduce((acc: any, row: any) => {
    const key = `${row.PVZ}_${row.company}`;
    if (!acc[key]) {
      acc[key] = {
        PVZ: row.PVZ,
        company: row.company,
        expenditureSum: 0,
      };
    }
    const expenditure =
      row.hours * row.paymentPerShift -
      row.advance -
      row.advanceFourssan -
      row.salaryFourssan -
      row.deductions +
      row.additionalPayment;
    acc[key].expenditureSum += expenditure;
    return acc;
  }, {});

  const selectedMonth = month.value;

  const currentDate = new Date();
  const year = fullYear.value;
  const date = new Date(year, selectedMonth - 1, 30);
  date.setHours(15);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  let resultRows = Object.values(groupedRows).map((groupedRow: any) => ({
    PVZ: groupedRow.PVZ,
    expenditure: Math.ceil(groupedRow.expenditureSum).toString(),
    typeOfExpenditure: "Оплата ФОТ",
    company: groupedRow.company,
    createdUser: "Директор",
    type: "Нал",
    date: date,
    issuedUser: "",
  }));

  let rowsFourssan = filteredRows.value?.filter((row) => {
    return row.salaryFourssan;
  });

  let groupedRowsFourssan = rowsFourssan?.reduce((acc: any, row: any) => {
    const key = `${row.PVZ}_${row.company}`;
    if (!acc[key]) {
      acc[key] = {
        PVZ: row.PVZ,
        company: row.company,
        expenditureSum: 0,
      };
    }
    const expenditure = row.salaryFourssan;
    acc[key].expenditureSum += expenditure;
    return acc;
  }, {});

  let resultRowsFourssan = Object.values(groupedRowsFourssan).map(
    (groupedRow: any) => ({
      PVZ: groupedRow.PVZ,
      expenditure: Math.ceil(groupedRow.expenditureSum).toString(),
      typeOfExpenditure: "Оплата ФОТ",
      company: groupedRow.company,
      createdUser: "Директор",
      type: "Безнал",
      date: date,
      issuedUser: "",
    })
  );

  let rowsDeductions = filteredRows.value?.filter((row) => {
    return row.deductions;
  });

  let groupedRowsDeductions = rowsDeductions?.reduce((acc: any, row: any) => {
    const key = `${row.PVZ}_${row.company}`;
    if (!acc[key]) {
      acc[key] = {
        PVZ: row.PVZ,
        company: row.company,
        expenditureSum: 0,
      };
    }
    const expenditure = row.deductions;
    acc[key].expenditureSum += expenditure;
    return acc;
  }, {});

  let resultRowsDeductions = Object.values(groupedRowsDeductions).map(
    (groupedRow: any) => ({
      PVZ: groupedRow.PVZ,
      expenditure: Math.ceil(groupedRow.expenditureSum).toString(),
      typeOfExpenditure: "Удержания с сотрудников",
      company: groupedRow.company,
      createdUser: "Директор",
      type: "Нал",
      date: date,
      issuedUser: "",
    })
  );

  let answer = confirm("Вы точно хотите создать отчет по выплате ЗП?");
  if (answer) {
    await storeAdvanceReport.createAdvanceReports(resultRows);
    await storeAdvanceReport.createAdvanceReports(resultRowsFourssan);
    await storeAdvanceReport.createAdvanceReports(resultRowsDeductions);
  }
}

const storeAdvanceReports = useAdvanceReports();
let selectedCompany = ref("");
let selectedPVZ = ref("");

const uniqueCompany = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "company");
});

const uniquePVZ = computed(() => {
  return storeAdvanceReports.getUniqueNonEmptyValues(props.rows, "PVZ");
});

const filterRowsCompanyAndPVZ = () => {
  filteredRows.value = props.rows?.slice();
  filteredRows.value = props.rows?.filter((row) => {
    return (
      (!selectedCompany.value.length ||
        selectedCompany.value.includes(row.company)) &&
      (!selectedPVZ.value.length || selectedPVZ.value.includes(row.PVZ))
    );
  });
  filteredRows.value = filteredRows.value?.filter((row: IPayroll) => {
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
watch([selectedCompany, selectedPVZ], filterRowsCompanyAndPVZ);
watch(month, saveFiltersToLocalStorage);

let isHidden = ref(true);

function showHiddenFields() {
  isHidden.value = true;
  selectedColumns.value = columns.toSpliced(3, 3);
}

function hideHiddenFields() {
  isHidden.value = false;
  selectedColumns.value = columns;
}

const columns = [
  {
    key: "PVZ",
    label: "ПВЗ",
    sortable: true,
  },
  {
    key: "company",
    label: "Компания",
    sortable: true,
  },
  {
    key: "fullname",
    label: "ФИО",
    sortable: true,
  },
  {
    key: "job",
    label: "Должность",
  },
  {
    key: "phone",
    label: "Телефон/Карта",
  },
  {
    key: "bank",
    label: "Банк",
  },
  {
    key: "paymentPerShift",
    label: "Оплата в час",
  },
  {
    key: "advanceFourssan",
    label: "Ав. ФОССАН",
  },
  {
    key: "advance",
    label: "Аванс",
  },
  {
    key: "hours",
    label: "Кол-во часов",
  },
  {
    key: "deductions",
    label: "Удержания",
  },
  {
    key: "additionalPayment",
    label: "Доплата",
  },
  {
    key: "salaryFourssan",
    label: "ЗП ФОССАН",
  },
  {
    key: "totalPayroll",
    label: "ЗП к начислению",
  },
  {
    key: "totalPayrollMonthWithoutDeductions",
    label: "Итого до удержаний",
  },
  {
    key: "totalPayrollMonth",
    label: "Итого начислено за месяц",
  },
  {
    key: "notation",
    label: "Примечание",
    sortable: true,
  },
  {
    key: "actions",
  },
];

const items = (row: IPayroll) => [
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

const selectedColumns = ref(columns.toSpliced(3, 4));
const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);

const dropdownStates = ref({} as any);

const toggleDropdown = (rowId: any) => {
  dropdownStates.value = {};

  dropdownStates.value[rowId] = !dropdownStates.value[rowId];
};


</script>
<template>
  <div class="my-10 flex items-center gap-5">
    <span
      :class="{ 'bg-secondary-color text-white': fullYear === 2024 }"
      class="border-[1px] py-1 px-5 border-secondary-color hover:cursor-pointer duration-200 rounded-full"
      @click="(showFilters = true), editYear(2024)"
      >2024</span
    >
    <span
      :class="{ 'bg-secondary-color text-white': fullYear === 2025 }"
      class="border-[1px] py-1 px-5 border-secondary-color hover:cursor-pointer duration-200 rounded-full"
      @click="(showFilters = true), editYear(2025)"
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
      <UIActionButton @click="createReport()"
        >Создать отчет за {{ monthNames[month] }}</UIActionButton
      >
    </div>
  </div>
  <div
    class="flex justify-between items-center mb-3 gap-3 max-sm:items-end max-sm:gap-5 max-sm:flex-col"
  >
    <div
      class="flex items-center gap-3 max-sm:flex-col max-sm:w-full max-sm:items-start"
    >
      <UIMainButton
        class="max-sm:w-full max-sm:max-w-[400px] mx-auto"
        @click="createAdvanceReportAdvance"
        >создать отчет по авансу</UIMainButton
      >
      <UIMainButton
        class="max-sm:w-full max-sm:max-w-[400px] mx-auto"
        @click="createAdvanceReportZP"
        >создать отчет по выплате зп</UIMainButton
      >
    </div>
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
    class="mb-5 flex items-center justify-between max-lg:flex-col max-lg:items-start max-lg:gap-5"
  >
    <div>
      <h1 class="font-bold text-4xl mb-3">Итого</h1>
      <div>
        <h1 class="font-medium text-lg max-sm:text-base">
          Выплачен аванс по ЗП:
          {{
            typeof getAllSumAdvance() === "number"
              ? getAllSumAdvance().toFixed(0)
              : 0
          }}
          ₽
        </h1>
        <h1 class="font-medium text-lg max-sm:text-base">
          Выплачено ЗП:
          {{ typeof getAllSumZP() === "number" ? getAllSumZP().toFixed(0) : 0 }}
          ₽
        </h1>
        <h1 class="font-medium text-lg max-sm:text-base">
          Итого выплачено за месяц до удержаний:
          {{
            typeof getAllSumZPMonthWithoutDeductions() === "number"
              ? getAllSumZPMonthWithoutDeductions().toFixed(0)
              : 0
          }}
          ₽
        </h1>
        <h1 class="font-medium text-lg max-sm:text-base">
          Итого выплачено за месяц после удержаний:
          {{
            typeof getAllSumZPMonth() === "number"
              ? getAllSumZPMonth().toFixed(0)
              : 0
          }}
          ₽
        </h1>
      </div>
    </div>

    <div class="w-full max-w-[500px] max-lg:max-w-none">
      <div>
        <h1 class="text-lg mb-1 font-bold">Фильтр по компании</h1>
        <VueMultiselect
          v-model="selectedCompany"
          :options="uniqueCompany"
          :multiple="true"
          :close-on-select="true"
          placeholder="Выберите компанию"
        />
      </div>

      <div>
        <h1 class="text-lg mb-1 font-bold mt-3">Фильтр по ПВЗ</h1>
        <VueMultiselect
          v-model="selectedPVZ"
          :options="uniquePVZ"
          :multiple="true"
          :close-on-select="true"
          placeholder="Выберите ПВЗ"
        />
      </div>
    </div>
  </div>

  <div class="flex mb-3">
    <UIActionButton
      @click="updateReport()"
      v-if="arrayWithModifiedRows.length > 0"
    >
      Сохранить
    </UIActionButton>
  </div>

  <div class="w-full flex items-end justify-end z-[50]">
    <USelectMenu
      class="w-[200px] z-[50]"
      v-model="selectedColumns"
      :options="columns"
      multiple
    >
      <UButton
        class="w-[200px] z-[50]"
        icon="i-heroicons-view-columns"
        color="gray"
        size="xs"
      >
        Столбцы
      </UButton>
    </USelectMenu>
  </div>

  <UTable
    class="w-full mx-auto text-center bg-white border-[1px] rounded-md mt-5 max-h-[500px]"
    :ui="{
  td: {
    base: 'border-r-[1px] border-b-[1px] text-center whitespace-normal',
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
    :columns="columnsTable"
    sort-asc-icon="i-heroicons-arrow-up"
    sort-desc-icon="i-heroicons-arrow-down"
  >
    <template #PVZ-data="{ row }">
      <p class="max-w-[65px] overflow-hidden">{{ row.PVZ }}</p>
    </template>
    <template #advanceFourssan-data="{ row }">
      <UInput
        class="w-[85px] mx-1 text-center bg-gray-100"
        @input="getRowByIdFromInput(row)"
        v-model="row.advanceFourssan"
        type="number"
      />
      <span class="hidden">{{ row.advanceFourssan }} ₽</span>
    </template>
    <template #advance-data="{ row }">
      <UInput
        class="w-[85px] mx-1 text-center bg-gray-100"
        @input="getRowByIdFromInput(row)"
        v-model="row.advance"
        type="number"
      />
      <span class="hidden">{{ row.advance }} ₽</span>
    </template>
    <template #hours-data="{ row }">
      <UInput
        class="w-[85px] mx-1 text-center bg-gray-100"
        @input="getRowByIdFromInput(row)"
        v-model="row.hours"
        type="number"
      />
      <span class="hidden">{{ row.hours }} ₽</span>
    </template>
    <template #deductions-data="{ row }">
      <UInput
        class="w-[85px] mx-1 text-center bg-gray-100"
        @input="getRowByIdFromInput(row)"
        v-model="row.deductions"
        type="number"
      />
      <span class="hidden">{{ row.deductions }} ₽</span>
    </template>
    <template #additionalPayment-data="{ row }">
      <UInput
        class="w-[85px] mx-1 text-center bg-gray-100"
        @input="getRowByIdFromInput(row)"
        v-model="row.additionalPayment"
        type="number"
      />
      <span class="hidden">{{ row.additionalPayment }} ₽</span>
    </template>
    <template #salaryFourssan-data="{ row }">
      <UInput
        class="w-[85px] mx-1 text-center bg-gray-100"
        @input="getRowByIdFromInput(row)"
        v-model="row.salaryFourssan"
        type="number"
      />
      <span class="hidden">{{ row.salaryFourssan }} ₽</span>
    </template>
    <template #totalPayroll-data="{ row }">
      <p
        v-if="
          row.hours !== '' &&
          row.paymentPerShift !== '' &&
          row.advance !== '' &&
          row.advanceFourssan !== '' &&
          row.deductions !== '' &&
          row.additionalPayment !== '' &&
          row.salaryFourssan !== ''
        "
      >
        {{
          (
            row.hours * row.paymentPerShift -
            row.advance -
            row.advanceFourssan -
            row.salaryFourssan -
            row.deductions +
            row.additionalPayment
          ).toFixed(0)
        }}
      </p>
      <p v-else>0</p>
    </template>
    <template #totalPayrollMonth-data="{ row }">
      <p
        :class="{
          'bg-red-500 text-black': row.notation === 'Нам должны',
          'bg-pink-900 text-white':
            row.notation === 'Расчёт уволенных сотрудников',
          'bg-yellow-400 text-black': row.notation === 'Оплачено',
        }"
        v-if="
          row.hours !== '' &&
          row.paymentPerShift !== '' &&
          row.advance !== '' &&
          row.advanceFourssan !== '' &&
          row.deductions !== '' &&
          row.additionalPayment !== '' &&
          row.salaryFourssan !== ''
        "
      >
        {{
          (
            row.advance +
            row.advanceFourssan +
            row.salaryFourssan +
            (row.hours * row.paymentPerShift -
              row.advance -
              row.advanceFourssan -
              row.salaryFourssan -
              row.deductions +
              row.additionalPayment)
          ).toFixed(0)
        }}
        ₽
      </p>
      <p v-else>0</p>
    </template>
    <template #totalPayrollMonthWithoutDeductions-data="{ row }">
      <p
        :class="{
          'bg-red-500 text-black': row.notation === 'Нам должны',
          'bg-pink-900 text-white':
            row.notation === 'Расчёт уволенных сотрудников',
          'bg-yellow-400 text-black': row.notation === 'Оплачено',
        }"
        v-if="
          row.hours !== '' &&
          row.paymentPerShift !== '' &&
          row.advance !== '' &&
          row.advanceFourssan !== '' &&
          row.additionalPayment !== '' &&
          row.salaryFourssan !== ''
        "
      >
        {{
          (
            row.advance +
            row.advanceFourssan +
            row.salaryFourssan +
            (row.hours * row.paymentPerShift -
              row.advance -
              row.advanceFourssan -
              row.salaryFourssan +
              row.additionalPayment)
          ).toFixed(0)
        }}
        ₽
      </p>
      <p v-else>0</p>
    </template>
    <template #actions-data="{ row }">
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
