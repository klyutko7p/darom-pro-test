<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();
const storeAdvanceReports = useAdvanceReports();
import { read, utils, writeFile, write } from "xlsx";

interface SelectedDateRange {
  start: Date;
  end: Date;
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IAdvanceReport[]> },
  rowsBalance: { type: Array as PropType<IBalance[]>, required: true },
  rowsDelivery: { type: Array as PropType<IDelivery[]>, required: true },
  rowsOurRansom: { type: Array as PropType<IOurRansom[]>, required: true },
  company: { type: String, required: true },
  selected: { type: Object as PropType<SelectedDateRange>, required: true },
  type: { type: Array as PropType<string[]>, required: true },
  selectedTypeOfExpenditure: {
    type: Array as PropType<string[]>,
    required: true,
  },
});

const emit = defineEmits(["returnTotal"]);

function returnTotal() {
  emit("returnTotal", sumOfArray3.value);
}

let pvz = ref<Array<any>>([]);

const filteredRows = ref(props.rows);

const totalRows = computed(() => Math.ceil(props.rows?.length));
let uniqueId = ref("q");

const storePVZ = usePVZStore();
onMounted(async () => {
  pvz.value = await storePVZ.getPVZ();
  pvz.value = pvz.value.map((pvzDataValue) => pvzDataValue.name);
  updateCurrentPageData();
  getTotal();

  const getRandomLetter = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    return letters[Math.floor(Math.random() * letters.length)];
  };

  uniqueId.value = getRandomLetter();
});

let returnRows = ref<Array<IAdvanceReport>>();

let arrayOfReceipts = ref<Array<IAdvanceReport>>();
let arrayOfReceiptsTotal = ref<Array<IAdvanceReport>>();
let arrayOfExpenditure = ref<Array<IAdvanceReport>>();
let arrayOfExpenditureTotal = ref<Array<IAdvanceReport>>();
let rowsBalanceArr = ref<Array<IBalance>>();
let rowsDeliveryArr = ref<Array<IDelivery>>();
let rowsOnlineArr = ref<Array<IOurRansom>>();
let rowsBalanceArrTotal = ref<Array<IBalance>>();
let rowsDeliveryArrTotal = ref<Array<IDelivery>>();
let rowsOnlineArrTotal = ref<Array<IOurRansom>>();

let expenditureByPVZ: { [PVZ: string]: number } = {};
let receiptsByPVZ: { [PVZ: string]: number } = {};
let differenceByPVZ: { [PVZ: string]: number } = {};

let expenditureByPVZTotal: { [PVZ: string]: number } = {};
let receiptsByPVZTotal: { [PVZ: string]: number } = {};
let differenceByPVZTotal: { [PVZ: string]: number } = {};

let sumOfArray1 = ref(0);
let sumOfArray2 = ref(0);
let sumOfArray3 = ref(0);

let sumOfArray1Total = ref(0);
let sumOfArray2Total = ref(0);
let sumOfArray3Total = ref(0);

function updateCurrentPageData() {
  const newStartingDate = new Date(props.selected.start).setHours(0, 0, 0, 0);
  const newEndDate = new Date(props.selected.end).setHours(23, 59, 59, 999);

  returnRows.value = props.rows;

  filteredRows.value = returnRows.value?.filter((row: IAdvanceReport) => {
    const rowDate = new Date(row.date).getTime();
    return (
      row.PVZ !== "" &&
      (!props.selected.start || rowDate >= newStartingDate) &&
      (!props.selected.end || rowDate <= newEndDate)
    );
  });

  rowsDeliveryArr.value = props.rowsDelivery.filter(
    (row: IDelivery) =>
      row.paid !== null &&
      (!props.selected.start ||
        new Date(row.paid).setHours(0, 0, 0, 0) >=
          new Date(newStartingDate).setHours(0, 0, 0, 0)) &&
      (!props.selected.end ||
        new Date(row.paid).setHours(23, 59, 59, 999) <=
          new Date(newEndDate).setHours(23, 59, 59, 999))
  );

  arrayOfExpenditure.value = filteredRows.value?.filter(
    (row: IAdvanceReport) =>
      row.typeOfExpenditure !== "Пополнение баланса" &&
      row.typeOfExpenditure !== "Передача денежных средств" &&
      row.typeOfExpenditure !== "Перевод в кредитный баланс" &&
      row.typeOfExpenditure !==
        "Списание кредитной задолженности торговой империи" &&
      row.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
      row.typeOfExpenditure !== "Перевод с кредитного баланса безнал" &&
      row.typeOfExpenditure !== "Новый кредит нал" &&
      row.typeOfExpenditure !== "Постоплата WB" &&
      row.typeOfExpenditure !== "Новый кредит безнал" &&
      row.typeOfExpenditure !== "Перевод с кредитного баланса" &&
      row.typeOfExpenditure !== "Удержания с сотрудников" &&
      row.typeOfExpenditure !== "Вывод дивидендов" &&
      (!props.selected.start ||
        new Date(row.date).setHours(0, 0, 0, 0) >=
          new Date(newStartingDate).setHours(0, 0, 0, 0)) &&
      (!props.selected.end ||
        new Date(row.date).setHours(23, 59, 59, 999) <=
          new Date(newEndDate).setHours(23, 59, 59, 999)) &&
      (!props.type || props.type.includes(row.type))
  );

  arrayOfReceipts.value = filteredRows.value?.filter(
    (row: IAdvanceReport) =>
      (row.typeOfExpenditure === "Пополнение баланса" ||
        row.typeOfExpenditure === "Удержания с сотрудников") &&
      (!props.selected.start ||
        new Date(row.date).setHours(0, 0, 0, 0) >=
          new Date(newStartingDate).setHours(0, 0, 0, 0)) &&
      (!props.selected.end ||
        new Date(row.date).setHours(23, 59, 59, 999) <=
          new Date(newEndDate).setHours(23, 59, 59, 999)) &&
      (!props.type || props.type.includes(row.type))
  );

  let plusBalanceArr = [];
  if (props.company === "Darom.pro" || props.company === "Все") {
    rowsOnlineArr.value = props.rowsOurRansom.filter(
      (row: IOurRansom) =>
        row.issued !== null &&
        (!props.selected.start ||
          new Date(row.issued).setHours(0, 0, 0, 0) >=
            new Date(newStartingDate).setHours(0, 0, 0, 0)) &&
        (!props.selected.end ||
          new Date(row.issued).setHours(23, 59, 59, 999) <=
            new Date(newEndDate).setHours(23, 59, 59, 999))
    );

    plusBalanceArr = rowsBalanceArr.value?.filter(
      (row: IBalance) =>
        row.notation === "Вывод дохода" &&
        (!props.selected.start ||
          new Date(row.issued).setHours(0, 0, 0, 0) >=
            new Date(newStartingDate).setHours(0, 0, 0, 0)) &&
        (!props.selected.end ||
          new Date(row.issued).setHours(23, 59, 59, 999) <=
            new Date(newEndDate).setHours(23, 59, 59, 999))
    );
  }

  pvz.value.forEach((pvzName: string) => {
    expenditureByPVZ[pvzName] = 0;
  });

  pvz.value.forEach((pvzName: string) => {
    receiptsByPVZ[pvzName] = 0;
  });

  const processedDeductions = {} as any;

  arrayOfExpenditure.value?.forEach((row) => {
    if (!isNaN(expenditureByPVZ[row.PVZ])) {
      if (row.typeOfExpenditure !== "Оплата ФОТ") {
        expenditureByPVZ[row.PVZ] += parseFloat(row.expenditure.toString());
      }

      if (row.typeOfExpenditure === "Оплата ФОТ") {
        if (!processedDeductions[row.PVZ]) {
          let deductions =
            arrayOfReceipts.value
              ?.filter(
                (item) =>
                  item.PVZ === row.PVZ &&
                  item.typeOfExpenditure === "Удержания с сотрудников"
              )
              .reduce(
                (sum, item) => sum + parseFloat(item.expenditure.toString()),
                0
              ) || 0;

          expenditureByPVZ[row.PVZ] += deductions;

          processedDeductions[row.PVZ] = true;
        }

        expenditureByPVZ[row.PVZ] += parseFloat(row.expenditure.toString());
      }
    }
  });

  arrayOfReceipts.value?.forEach((row) => {
    if (!isNaN(receiptsByPVZ[row.PVZ])) {
      receiptsByPVZ[row.PVZ] += parseFloat(row.expenditure.toString());
    }
  });

  if (!props.selectedTypeOfExpenditure.length) {
    rowsBalanceArr.value
      ?.filter((row) => row.notation !== "Вывод дохода")
      .forEach((row) => {
        if (!isNaN(receiptsByPVZ[row.pvz])) {
          receiptsByPVZ[row.pvz] += parseFloat(row.sum);
        }
      });

    rowsOnlineArr.value?.forEach((row) => {
      if (!isNaN(receiptsByPVZ[row.dispatchPVZ])) {
        receiptsByPVZ[row.dispatchPVZ] += calculateValue(row);
      }
    });

    plusBalanceArr?.forEach((row) => {
      if (!isNaN(expenditureByPVZ[row.pvz])) {
        expenditureByPVZ[row.pvz] += parseFloat(row.sum);
      }
    });

    rowsDeliveryArr.value.forEach((row) => {
      if (!isNaN(receiptsByPVZ[row.orderPVZ])) {
        receiptsByPVZ[row.orderPVZ] += row.amountFromClient3;
      }
    });
  }

  if (
    props.selectedTypeOfExpenditure.includes("Оплата ФОТ") &&
    !props.selectedTypeOfExpenditure.includes("Удержания с сотрудников")
  ) {
    arrayOfReceipts.value?.forEach((row) => {
      if (!isNaN(receiptsByPVZ[row.PVZ])) {
        receiptsByPVZ[row.PVZ] = 0;
      }
    });
  }

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

  getTotal();
}

function calculateValue(curValue: any) {
  if (!curValue.prepayment) {
    if (!curValue.prepayment) {
      curValue.prepayment = 0;
    }
    if (!curValue.deliveredKGT) {
      curValue.deliveredKGT = 0;
    }

    const shouldRound = (value: any) => {
      if (value.created_at) {
        const createdDate = new Date(value.created_at);
        const referenceDate = new Date("2024-06-05T00:00:01");
        return createdDate > referenceDate;
      }
    };

    if (!shouldRound(curValue)) {
      return curValue.additionally !== "Отказ клиент наличные" ||
        curValue.additionally !== "Отказ клиент онлайн" ||
        curValue.additionally !== "Отказ клиент"
        ? Math.ceil(curValue.amountFromClient1 / 10) * 10 -
            curValue.priceSite +
            curValue.deliveredKGT
        : 200;
    } else {
      return curValue.additionally !== "Отказ клиент наличные" ||
        curValue.additionally !== "Отказ клиент онлайн" ||
        curValue.additionally !== "Отказ клиент"
        ? Math.ceil(
            Math.ceil(
              (curValue.priceSite +
                (curValue.priceSite * 10) / 100 -
                curValue.prepayment) /
                10
            )
          ) *
            10 -
            curValue.priceSite +
            curValue.deliveredKGT
        : 200;
    }
  } else {
    if (!curValue.prepayment) {
      curValue.prepayment = 0;
    }
    if (!curValue.deliveredKGT) {
      curValue.deliveredKGT = 0;
    }
    return curValue.additionally !== "Отказ клиент наличные" ||
      curValue.additionally !== "Отказ клиент онлайн" ||
      curValue.additionally !== "Отказ клиент"
      ? (+curValue.priceSite * 10) / 100 + +curValue.deliveredKGT
      : 200;
  }
}

function getTotal() {
  returnTotal();
}

function clearTotalSums() {
  sumOfArray1.value = 0;
  sumOfArray2.value = 0;
  sumOfArray3.value = 0;
  sumOfArray1Total.value = 0;
  sumOfArray2Total.value = 0;
  sumOfArray3Total.value = 0;
}

watch([props.rows, totalRows, filteredRows.value], clearTotalSums);
watch([props.rows, totalRows, filteredRows.value], updateCurrentPageData);

function exportToExcel() {
  let table = document.querySelector(`.${uniqueId.value}`);
  let wb = utils.table_to_book(table);
  writeFile(wb, "сводные_таблицы.xlsx");
}
</script>
<template>
  <div class="relative">
    <div class="absolute top-[-65px] right-0 flex items-center gap-3">
      <h1 class="text-sm italic">{{ company }}</h1>
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
    <div class="relative rounded-xl mt-5 mb-10">
      <table
        :class="`${uniqueId}`"
        class="w-full border-[1px] border-gray-50 text-sm text-left rtl:text-right text-gray-500"
      >
        <thead
          class="text-xs bg-[#36304a] text-white sticky top-0 z-30 uppercase text-center"
        >
          <tr>
            <td class="border-[1px] p-2 whitespace-nowrap font-bold">Статус</td>
            <th
              scope="col"
              class="border-[1px] p-2 whitespace-nowrap"
              v-for="pvzName in pvz"
            >
              {{ pvzName }}
            </th>
            <td class="border-[1px] p-2 whitespace-nowrap font-bold">Итого</td>
          </tr>
        </thead>
        <tbody>
          <tr class="text-center bg-white">
            <td class="border-[1px] p-2 whitespace-nowrap font-bold">
              Поступления
            </td>
            <td
              class="border-[1px] p-2 whitespace-nowrap font-bold"
              v-for="sum in receiptsByPVZ"
            >
              {{ Math.ceil(sum) }} ₽
            </td>
            <td class="border-[1px] p-2 whitespace-nowrap font-bold">
              {{ Math.ceil(sumOfArray1) }} ₽
            </td>
          </tr>
          <tr class="text-center bg-white">
            <td class="border-[1px] p-2 whitespace-nowrap font-bold">Расход</td>
            <td
              class="border-[1px] p-2 whitespace-nowrap font-bold"
              v-for="sum in expenditureByPVZ"
            >
              {{ Math.ceil(sum) }} ₽
            </td>
            <td class="border-[1px] p-2 whitespace-nowrap font-bold">
              {{ Math.ceil(sumOfArray2) }} ₽
            </td>
          </tr>
          <tr class="text-center bg-white">
            <td class="border-[1px] p-2 whitespace-nowrap font-bold">Итого</td>
            <td
              class="border-[1px] p-2 whitespace-nowrap font-bold"
              v-for="sum in differenceByPVZ"
            >
              {{ Math.ceil(sum) }} ₽
            </td>
            <td class="border-[1px] font-bold p-2 whitespace-nowrap">
              {{ Math.ceil(sumOfArray3) }} ₽
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
