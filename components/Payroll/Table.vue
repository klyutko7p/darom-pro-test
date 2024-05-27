<script setup lang="ts">
import type { PropType } from "vue";
import { read, utils, writeFile, write } from "xlsx";
const storeAdvanceReport = useAdvanceReports();
const emit = defineEmits([
  "openModal",
  "createReport",
  "updateReport",
  "deleteRow",
  "getMonth"
]);

function openModal(row: IPayroll) {
  emit("openModal", row);
}

function getMonth() {
  emit("getMonth", month.value);
}

function deleteRow(id: number) {
  emit("deleteRow", id);
}

function createReport() {
  emit("createReport", { rows: props.employees, month: month.value });
}

function updateReport() {
  emit("updateReport", arrayWithModifiedRows.value);
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
    return rowDate.getMonth() + 1 === month.value;
  })
);

onMounted(() => {
  getMonth()
})

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

let returnRows = ref<Array<IPayroll>>();

function updateCurrentPageData() {
  returnRows.value = props.rows;
  filteredRows.value = returnRows.value?.filter((row: IPayroll) => {
    let rowDate: Date = new Date(row.date);
    return rowDate.getMonth() + 1 === +month.value;
  });
}

let arrayWithModifiedRows = ref<Array<IPayroll>>([]);
function getRowByIdFromInput(row: IPayroll) {
  arrayWithModifiedRows.value.push(row);
  arrayWithModifiedRows.value = [...new Set(arrayWithModifiedRows.value)];
}

watch([props.rows, totalRows, props.user], updateCurrentPageData);

function getAllSumAdvance() {
  return filteredRows.value?.reduce((acc, value) => acc + +value.advance, 0)
    ? filteredRows.value?.reduce((acc, value) => acc + +value.advance, 0)
    : 0;
}

function getAllSumZP() {
  return filteredRows.value?.reduce((acc, value) => {
    const payment =
      value.hours * value.paymentPerShift -
      value.advance -
      value.deductions +
      value.additionalPayment;
    return acc + payment;
  }, 0)
    ? filteredRows.value?.reduce((acc, value) => {
        const payment =
          value.hours * value.paymentPerShift -
          value.advance -
          value.deductions +
          value.additionalPayment;
        return acc + payment;
      }, 0)
    : 0;
}

function getAllSumZPMonth() {
  return filteredRows.value?.reduce((acc, value) => {
    const payment =
      value.advance +
      (value.hours * value.paymentPerShift -
        value.advance -
        value.deductions +
        value.additionalPayment);
    return acc + payment;
  }, 0)
    ? filteredRows.value?.reduce((acc, value) => {
        const payment =
          value.advance +
          (value.hours * value.paymentPerShift -
            value.advance -
            value.deductions +
            value.additionalPayment);
        return acc + payment;
      }, 0)
    : 0;
}

function exportToExcel() {
  let table = document.querySelector("#theTable");
  let wb = utils.table_to_book(table);
  writeFile(wb, "расчёт_зп.xlsx");
}

async function createAdvanceReportAdvance() {
  let rows = filteredRows.value?.filter((row) => row.advance);

  let groupedRows = rows.reduce((acc, row) => {
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
  const date = new Date()

  let resultRows = Object.values(groupedRows).map((groupedRow) => ({
    PVZ: groupedRow.PVZ,
    expenditure: Math.ceil(groupedRow.expenditureSum).toString(),
    typeOfExpenditure: "Оплата ФОТ",
    company: groupedRow.company,
    createdUser: "Директор",
    type: "Нал",
    date: date,
    issuedUser: "",
  }));

  let answer = confirm("Вы точно хотите создать отчет по авансу?");
  if (answer) {
    await storeAdvanceReport.createAdvanceReports(resultRows);
  } 
}

async function createAdvanceReportZP() {
  let rows = filteredRows.value?.filter((row) => {
    return (
      row.hours * row.paymentPerShift -
      row.advance -
      row.deductions +
      row.additionalPayment
    );
  });

  let groupedRows = rows.reduce((acc, row) => {
    const key = `${row.PVZ}_${row.company}`;
    if (!acc[key]) {
      acc[key] = {
        PVZ: row.PVZ,
        company: row.company,
        expenditureSum: 0,
      };
    }
    const expenditure = row.hours * row.paymentPerShift - row.advance - row.deductions + row.additionalPayment;
    acc[key].expenditureSum += expenditure;
    return acc;
  }, {});

  const selectedMonth = month.value; 

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const date = new Date(year, selectedMonth - 1, 31)

  let resultRows = Object.values(groupedRows).map((groupedRow) => ({
    PVZ: groupedRow.PVZ,
    expenditure: Math.ceil(groupedRow.expenditureSum).toString(),
    typeOfExpenditure: "Оплата ФОТ",
    company: groupedRow.company,
    createdUser: "Директор",
    type: "Нал",
    date: date,
    issuedUser: "",
  }));

  let answer = confirm("Вы точно хотите создать отчет по выплате ЗП?");
  if (answer) {
    await storeAdvanceReport.createAdvanceReports(resultRows);
  } 
}
</script>
<template>
  <div class="my-10 flex items-center gap-5">
    <span
      class="border-2 py-3 px-5 border-secondary-color hover:cursor-pointer hover:bg-secondary-color hover:text-white duration-200 rounded-full"
      @click="showFilters = !showFilters"
      >2024</span
    >
    <div
      v-if="showFilters"
      class="flex items-center w-full justify-between max-sm:flex-col gap-3 max-sm:items-end"
    >
      <select
        class="py-1 px-2 border-2 bg-transparent rounded-lg text-base"
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
      <UIMainButton @click="createReport()"
        >Создать отчет за {{ monthNames[month] }}</UIMainButton
      >
    </div>
  </div>
  <div class="flex justify-between items-center mb-3 gap-3 max-sm:items-end">
    <div
      class="flex items-center gap-3 max-sm:flex-col max-sm:w-full max-sm:items-start"
    >
      <UIMainButton @click="createAdvanceReportAdvance"
        >создать отчет по авансу</UIMainButton
      >
      <UIMainButton @click="createAdvanceReportZP"
        >создать отчет по выплате зп</UIMainButton
      >
    </div>
    <Icon
      class="duration-200 hover:text-secondary-color cursor-pointer"
      size="40"
      name="material-symbols:sheets-add-on"
      @click="exportToExcel"
    />
  </div>

  <div class="mb-10">
    <h1 class="font-bold text-4xl mb-3">Итого</h1>
    <div>
      <h1 class="font-medium text-xl">
        Выплачен аванс:
        {{
          typeof getAllSumAdvance() === "number"
            ? getAllSumAdvance().toFixed(0)
            : 0
        }}
        ₽
      </h1>
      <h1 class="font-medium text-xl">
        ЗП к начислению:
        {{ typeof getAllSumZP() === "number" ? getAllSumZP().toFixed(0) : 0 }} ₽
      </h1>
      <h1 class="font-medium text-xl">
        Итого начислено за месяц:
        {{
          typeof getAllSumZPMonth() === "number"
            ? getAllSumZPMonth().toFixed(0)
            : 0
        }}
        ₽
      </h1>
    </div>
  </div>

  <div class="flex">
    <UIActionButton
      @click="updateReport()"
      v-if="arrayWithModifiedRows.length > 0"
    >
      Сохранить
    </UIActionButton>
  </div>

  <div class="relative max-h-[610px] mt-5 mb-10 mr-5">
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
            v-if="
              user.dataDelivery === 'WRITE' ||
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR' || user.role === 'RMANAGER' 
            "
          >
            изменение
          </th>
          <th scope="col" class="border-2">ПВЗ</th>
          <th scope="col" class="border-2">Компания</th>
          <th scope="col" class="border-2">ФИО</th>
          <th scope="col" class="border-2">Телефон</th>
          <th scope="col" class="border-2">Банк</th>
          <th scope="col" class="border-2">оплата в час</th>
          <th scope="col" class="border-2">Аванс</th>
          <th scope="col" class="border-2">Кол-во часов</th>
          <th scope="col" class="border-2">Удержания</th>
          <th scope="col" class="border-2">Доплата</th>
          <th scope="col" class="border-2">ЗП к начислению</th>
          <th scope="col" class="border-2">Итого начислено за месяц</th>
          <th scope="col" class="border-2">Примечание</th>
          <th scope="col" class="border-2">удаление</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in filteredRows" class="text-center" :class="{'bg-red-500 text-black': row.notation === 'Нам должны', 'bg-pink-900 text-white': row.notation === 'Расчёт уволенных сотрудников', 'bg-yellow-400 text-black': row.notation === 'Оплачено'}">
          <td class="border-2" v-if="user.role === 'ADMIN'">
            <h1
              @click="openModal(row)"
              class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
            >
              ✏️
            </h1>
          </td>
          <th scope="row" class="border-2">
            {{ row.PVZ }}
          </th>
          <th scope="row" class="border-2">
            {{ row.company }}
          </th>
          <td class="border-2">{{ row.fullname }}</td>
          <td class="border-2">
            {{ row.phone }}
          </td>
          <td class="border-2">
            {{ row.bank }}
          </td>
          <td class="border-2">
            {{ row.paymentPerShift ? row.paymentPerShift : 0 }} ₽
          </td>
          <td class="border-2">
            <input
              class="max-w-[70px] text-center"
              type="number"
              @input="getRowByIdFromInput(row)"
              v-model="row.advance"
            />
            <span class="hidden">{{ row.advance }} ₽</span>
          </td>
          <td class="border-2">
            <input
              class="max-w-[70px] text-center"
              type="number"
              @input="getRowByIdFromInput(row)"
              v-model="row.hours"
            />
            <span class="hidden">{{ row.hours }} ₽</span>
          </td>
          <td class="border-2">
            <input
              class="max-w-[70px] text-center"
              type="number"
              @input="getRowByIdFromInput(row)"
              v-model="row.deductions"
            />
            <span class="hidden">{{ row.deductions }} ₽</span>
          </td>
          <td class="border-2">
            <input
              class="max-w-[70px] text-center"
              type="number"
              @input="getRowByIdFromInput(row)"
              v-model="row.additionalPayment"
            />
            <span class="hidden">{{ row.additionalPayment }} ₽</span>
          </td>
          <td
            class="border-2"
            v-if="
              row.hours !== '' &&
              row.paymentPerShift !== '' &&
              row.advance !== '' &&
              row.deductions !== '' &&
              row.additionalPayment !== ''
            "
          >
            {{
              (
                row.hours * row.paymentPerShift -
                row.advance -
                row.deductions +
                row.additionalPayment
              ).toFixed(0)
            }}
          </td>
          <td class="border-2" v-else>0 </td>
          <td
            class="border-2"
            v-if="
              row.hours !== '' &&
              row.paymentPerShift !== '' &&
              row.advance !== '' &&
              row.deductions !== '' &&
              row.additionalPayment !== ''
            "
          >
            {{
              (
                row.advance +
                (row.hours * row.paymentPerShift -
                  row.advance -
                  row.deductions +
                  row.additionalPayment)
              ).toFixed(0)
            }}
            ₽
          </td>
          <td class="border-2" v-else>0 ₽</td>
          <td class="border-2"> {{ row.notation }} </td>
          <td
            class="px-6 py-4 border-2"
            v-if="
              (user.dataOurRansom === 'WRITE' && user.role === 'ADMIN') ||
              user.role === 'ADMINISTRATOR' || user.role === 'RMANAGER' 
            "
          >
            <Icon
              @click="deleteRow(row.id)"
              class="text-red-600 cursor-pointer hover:text-red-300 duration-200"
              name="material-symbols:playlist-remove-rounded"
              size="32"
            />
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
