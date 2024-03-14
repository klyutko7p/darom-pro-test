<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IAdvanceReport[]> },
  week: { type: String, required: true },
});

let month = ref(new Date().getMonth() + 1);

const filteredRows = ref(
  props.rows?.filter((row: IAdvanceReport) => {
    let rowDate: Date = new Date(row.date);
    return rowDate.getMonth() + 1 === month.value;
  })
);

const totalRows = computed(() => Math.ceil(props.rows?.length));
onBeforeMount(() => {
  updateCurrentPageData();
});

let returnRows = ref<Array<IAdvanceReport>>();

let arrayOfReceipts = ref<Array<IAdvanceReport>>();
let arrayOfExpenditure = ref<Array<IAdvanceReport>>();
let arrayOfTotal = ref<Array<IAdvanceReport>>();

let expenditureByPVZ: { [PVZ: string]: number } = {};
let receiptsByPVZ: { [PVZ: string]: number } = {};
let differenceByPVZ: { [PVZ: string]: number } = {};

let sumOfArray1 = ref(0);
let sumOfArray2 = ref(0);
let sumOfArray3 = ref(0);

function updateCurrentPageData() {
  returnRows.value = props.rows;
  filteredRows.value = returnRows.value?.filter((row: IAdvanceReport) => {
    let rowDate: Date = new Date(row.date);
    return rowDate.getMonth() + 1 === +month.value && row.PVZ !== '';
  });

  if (props.week.includes("неделя")) {
    arrayOfExpenditure.value = filteredRows.value?.filter(
      (row: IAdvanceReport) => {
        let rowDate: Date = new Date(row.date);
        let [startDate, endDate] = parseWeekRange(props.week);
        return rowDate >= startDate && rowDate <= endDate;
      }
    );
  } else {
    arrayOfExpenditure.value = filteredRows.value;
  }

  pvz.value.forEach((pvzName: string) => {
    expenditureByPVZ[pvzName] = 0;
  });

  pvz.value.forEach((pvzName: string) => {
    receiptsByPVZ[pvzName] = 0;
  });

  arrayOfExpenditure.value?.forEach((row) => {
    expenditureByPVZ[row.PVZ] += parseFloat(row.expenditure);
  });

  arrayOfExpenditure.value?.forEach((row) => {
    receiptsByPVZ[row.PVZ] += 0;
  });

  pvz.value.forEach((pvzName: string) => {
    const difference = receiptsByPVZ[pvzName] - expenditureByPVZ[pvzName];
    differenceByPVZ[pvzName] = difference;
  });

  Object.keys(expenditureByPVZ).forEach((pvzName: string) => {
    sumOfArray2.value += expenditureByPVZ[pvzName];
  });

  Object.keys(receiptsByPVZ).forEach((pvzName: string) => {
    sumOfArray1.value += receiptsByPVZ[pvzName];
  });

  Object.keys(differenceByPVZ).forEach((pvzName: string) => {
    sumOfArray3.value += differenceByPVZ[pvzName];
  });
}

function parseWeekRange(weekString: string): Date[] {
  const matches = weekString.match(/(\d+) неделя \((\d+)-(\d+)\)/);
  if (matches) {
    const weekNumber = parseInt(matches[1]);
    const startDate = parseInt(matches[2]);
    const endDate = parseInt(matches[3]);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const startDateObj = new Date(currentYear, currentMonth, startDate);
    const endDateObj = new Date(currentYear, currentMonth, endDate);
    return [startDateObj, endDateObj];
  }
  return [];
}

function clearTotalSums() {
  sumOfArray1.value = 0;
  sumOfArray2.value = 0;
  sumOfArray3.value = 0;
}

watch([props.rows, totalRows, filteredRows.value], clearTotalSums);
watch([props.rows, totalRows, filteredRows.value], updateCurrentPageData);

let pvz = ref([
  "Ряженое",
  "Алексеевка",
  "Латоново",
  "Надежда",
  "Александровка",
  "Новониколаевка",
  "Политотдельское",
  "Мещерино",
  "ПВЗ1",
  "ПВЗ2",
  "ПВЗ3",
  "ПВЗ4",
  "Офис",
]);
</script>
<template>
  <div class="relative max-h-[410px] overflow-y-auto mt-5 mb-10">
    <table
      id="theTable"
      class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50"
      >
        <tr>
          <td class="border-2 font-bold">Статус</td>
          <th scope="col" class="border-2" v-for="pvzName in pvz">
            {{ pvzName }}
          </th>
          <td class="border-2 font-bold">Итого</td>
        </tr>
      </thead>
      <tbody>
        <tr class="text-center">
          <td class="border-2 font-bold">Поступления</td>
          <td class="border-2 font-bold" v-for="sum in receiptsByPVZ">
            {{ sum }} ₽
          </td>
          <td class="border-2 font-bold">{{ sumOfArray1 }} ₽</td>
        </tr>
        <tr class="text-center">
          <td class="border-2 font-bold">Расход</td>
          <td class="border-2 font-bold" v-for="sum in expenditureByPVZ">
            {{ sum }} ₽
          </td>
          <td class="border-2 font-bold">{{ sumOfArray2 }} ₽</td>
        </tr>
        <tr class="text-center">
          <td class="border-2 font-bold">Итого</td>
          <td
            class="border-2 whitespace-nowrap font-bold"
            v-for="sum in differenceByPVZ"
          >
            {{ sum }} ₽
          </td>
          <td class="border-2 font-bold">{{ sumOfArray3 }} ₽</td>
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
