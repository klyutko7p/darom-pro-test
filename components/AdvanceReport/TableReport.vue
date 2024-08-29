<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();
import { read, utils, writeFile, write } from "xlsx";

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IAdvanceReport[]> },
  month: { type: Number, required: true },
  week: { type: String, required: true },
  startingDate: { type: Date },
  endDate: { type: Date },
  type: { type: String, required: true },
  isDateFilter: { type: Boolean, required: true },
  rowsBalance: { type: Array as PropType<IBalance[]>, required: true },
  rowsDelivery: { type: Array as PropType<IDelivery[]>, required: true },
  rowsOurRansom: { type: Array as PropType<IOurRansom[]>, required: true },
  company: { type: String, required: true },
  selectedTypeOfExpenditure: { type: Array as PropType<string[]>, required: true },
});

const emit = defineEmits(["returnTotal"]);

function returnTotal() {
  emit("returnTotal", sumOfArray3.value);
}

const filteredRows = ref(
  props.rows?.filter((row: IAdvanceReport) => {
    let rowDate: Date = new Date(row.date);
    return rowDate.getMonth() + 1 === +props.month;
  })
);

const totalRows = computed(() => Math.ceil(props.rows?.length));
onMounted(() => {
  updateCurrentPageData();
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
  let newStartingDate = new Date(props.startingDate);
  newStartingDate.setHours(0);
  newStartingDate.setMinutes(0);
  newStartingDate.setSeconds(0);
  newStartingDate.setMilliseconds(0);

  let newEndDate = new Date(props.endDate);
  newEndDate.setHours(23);
  newEndDate.setMinutes(59);
  newEndDate.setSeconds(59);
  newEndDate.setMilliseconds(0);

  returnRows.value = props.rows;
  if (!props.isDateFilter) {
    filteredRows.value = returnRows.value?.filter((row: IAdvanceReport) => {
      let rowDate: Date = new Date(row.date);
      return (
        rowDate.getMonth() + 1 === +props.month &&
        row.PVZ !== "" &&
        (!props.startingDate || new Date(row.date) >= new Date(newStartingDate)) &&
        (!props.endDate || new Date(row.date) <= new Date(newEndDate))
      );
    });

    if (props.week.includes("неделя")) {
      rowsDeliveryArr.value = props.rowsDelivery.filter((row: IDelivery) => {
        let rowDate: Date = new Date(row.paid);
        let [startDate, endDate] = parseWeekRange(props.week);
        return rowDate >= startDate && rowDate <= endDate && row.paid !== null;
      });
    } else {
      rowsDeliveryArr.value = props.rowsDelivery.filter(
        (row: IDelivery) =>
          row.paid !== null &&
          new Date(row.paid).getMonth() + 1 === +props.month &&
          (!props.startingDate || new Date(row.paid) >= new Date(newStartingDate)) &&
          (!props.endDate || new Date(row.paid) <= new Date(newEndDate))
      );
    }

    if (props.week.includes("неделя")) {
      arrayOfExpenditure.value = filteredRows.value?.filter((row: IAdvanceReport) => {
        let rowDate: Date = new Date(row.date);
        let [startDate, endDate] = parseWeekRange(props.week);
        return (
          rowDate >= startDate &&
          rowDate <= endDate &&
          row.typeOfExpenditure !== "Пополнение баланса" &&
          row.typeOfExpenditure !== "Передача денежных средств" &&
          row.typeOfExpenditure !== "Перевод в кредитный баланс" &&
          row.typeOfExpenditure !== "Списание кредитной задолженности торговой империи" &&
          row.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
          row.typeOfExpenditure !== "Перевод с кредитного баланса безнал" &&
          row.typeOfExpenditure !== "Новый кредит нал" &&
          row.typeOfExpenditure !== "Новый кредит безнал" &&
          row.typeOfExpenditure !== "Вывод дивидендов" &&
          (!props.type || row.type === props.type)
        );
      });
    } else {
      arrayOfExpenditure.value = filteredRows.value?.filter(
        (row: IAdvanceReport) =>
          row.typeOfExpenditure !== "Пополнение баланса" &&
          row.typeOfExpenditure !== "Передача денежных средств" &&
          row.typeOfExpenditure !== "Перевод в кредитный баланс" &&
          row.typeOfExpenditure !== "Списание кредитной задолженности торговой империи" &&
          row.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
          row.typeOfExpenditure !== "Перевод с кредитного баланса безнал" &&
          row.typeOfExpenditure !== "Новый кредит нал" &&
          row.typeOfExpenditure !== "Новый кредит безнал" &&
          row.typeOfExpenditure !== "Перевод с кредитного баланса" &&
          row.typeOfExpenditure !== "Вывод дивидендов" &&
          new Date(row.date).getMonth() + 1 === +props.month &&
          (!props.startingDate || new Date(row.date) >= new Date(newStartingDate)) &&
          (!props.endDate || new Date(row.date) <= new Date(newEndDate)) &&
          (!props.type || row.type === props.type)
      );
    }

    if (props.week.includes("неделя")) {
      arrayOfReceipts.value = filteredRows.value?.filter((row: IAdvanceReport) => {
        let rowDate: Date = new Date(row.date);
        let [startDate, endDate] = parseWeekRange(props.week);
        return (
          rowDate >= startDate &&
          rowDate <= endDate &&
          row.typeOfExpenditure === "Пополнение баланса"
        );
      });
    } else {
      arrayOfReceipts.value = filteredRows.value?.filter(
        (row: IAdvanceReport) =>
          row.typeOfExpenditure === "Пополнение баланса" &&
          new Date(row.date).getMonth() + 1 === +props.month &&
          (!props.startingDate || new Date(row.date) >= new Date(newStartingDate)) &&
          (!props.endDate || new Date(row.date) <= new Date(newEndDate)) &&
          (!props.type || row.type === props.type)
      );
    }

    if (props.company === "Darom.pro" || props.company === "Все") {
      if (props.week.includes("неделя")) {
        rowsOnlineArr.value = props.rowsOurRansom.filter((row: IOurRansom) => {
          let rowDate: Date = new Date(row.issued);
          let [startDate, endDate] = parseWeekRange(props.week);
          return (
            rowDate >= startDate &&
            rowDate <= endDate &&
            (row.additionally === "Оплачено онлайн" ||
              row.additionally === "Оплата наличными")
          );
        });
      } else {
        rowsOnlineArr.value = props.rowsOurRansom.filter(
          (row: IOurRansom) =>
            row.additionally !== "Отказ брак" &&
            new Date(row.issued).getMonth() + 1 === +props.month &&
            (!props.startingDate || new Date(row.issued) >= new Date(newStartingDate)) &&
            (!props.endDate || new Date(row.issued) <= new Date(newEndDate))
        );
      }
    }
  } else {
    filteredRows.value = returnRows.value?.filter((row: IAdvanceReport) => {
      return (
        row.PVZ !== "" &&
        (!props.startingDate || new Date(row.date) >= new Date(newStartingDate)) &&
        (!props.endDate || new Date(row.date) <= new Date(newEndDate))
      );
    });

    if (props.week.includes("неделя")) {
      rowsDeliveryArr.value = props.rowsDelivery.filter((row: IDelivery) => {
        let rowDate: Date = new Date(row.paid);
        let [startDate, endDate] = parseWeekRange(props.week);
        return rowDate >= startDate && rowDate <= endDate && row.paid !== null;
      });
    } else {
      rowsDeliveryArr.value = props.rowsDelivery.filter(
        (row: IDelivery) =>
          row.paid !== null &&
          (!props.startingDate || new Date(row.paid) >= new Date(newStartingDate)) &&
          (!props.endDate || new Date(row.paid) <= new Date(newEndDate))
      );
    }

    if (props.week.includes("неделя")) {
      arrayOfExpenditure.value = filteredRows.value?.filter((row: IAdvanceReport) => {
        let rowDate: Date = new Date(row.date);
        let [startDate, endDate] = parseWeekRange(props.week);
        return (
          rowDate >= startDate &&
          rowDate <= endDate &&
          row.typeOfExpenditure !== "Пополнение баланса" &&
          row.typeOfExpenditure !== "Передача денежных средств" &&
          row.typeOfExpenditure !== "Перевод в кредитный баланс" &&
          row.typeOfExpenditure !== "Списание кредитной задолженности торговой империи" &&
          row.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
          row.typeOfExpenditure !== "Перевод с кредитного баланса безнал" &&
          row.typeOfExpenditure !== "Новый кредит нал" &&
          row.typeOfExpenditure !== "Новый кредит безнал" &&
          row.typeOfExpenditure !== "Вывод дивидендов" &&
          (!props.type || row.type === props.type)
        );
      });
    } else {
      arrayOfExpenditure.value = filteredRows.value?.filter(
        (row: IAdvanceReport) =>
          row.typeOfExpenditure !== "Пополнение баланса" &&
          row.typeOfExpenditure !== "Передача денежных средств" &&
          row.typeOfExpenditure !== "Перевод в кредитный баланс" &&
          row.typeOfExpenditure !== "Списание кредитной задолженности торговой империи" &&
          row.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
          row.typeOfExpenditure !== "Перевод с кредитного баланса безнал" &&
          row.typeOfExpenditure !== "Новый кредит нал" &&
          row.typeOfExpenditure !== "Новый кредит безнал" &&
          row.typeOfExpenditure !== "Перевод с кредитного баланса" &&
          row.typeOfExpenditure !== "Вывод дивидендов" &&
          (!props.startingDate || new Date(row.date) >= new Date(newStartingDate)) &&
          (!props.endDate || new Date(row.date) <= new Date(newEndDate)) &&
          (!props.type || row.type === props.type)
      );
    }

    if (props.week.includes("неделя")) {
      arrayOfReceipts.value = filteredRows.value?.filter((row: IAdvanceReport) => {
        let rowDate: Date = new Date(row.date);
        let [startDate, endDate] = parseWeekRange(props.week);
        return (
          rowDate >= startDate &&
          rowDate <= endDate &&
          row.typeOfExpenditure === "Пополнение баланса"
        );
      });
    } else {
      arrayOfReceipts.value = filteredRows.value?.filter(
        (row: IAdvanceReport) =>
          row.typeOfExpenditure === "Пополнение баланса" &&
          (!props.startingDate || new Date(row.date) >= new Date(newStartingDate)) &&
          (!props.endDate || new Date(row.date) <= new Date(newEndDate)) &&
          (!props.type || row.type === props.type)
      );
    }

    if (props.company === "Darom.pro" || props.company === "Все") {
      if (props.week.includes("неделя")) {
        rowsOnlineArr.value = props.rowsOurRansom.filter((row: IOurRansom) => {
          let rowDate: Date = new Date(row.issued);
          let [startDate, endDate] = parseWeekRange(props.week);
          return (
            rowDate >= startDate &&
            rowDate <= endDate &&
            (row.additionally === "Оплачено онлайн" ||
              row.additionally === "Оплата наличными")
          );
        });
      } else {
        rowsOnlineArr.value = props.rowsOurRansom.filter(
          (row: IOurRansom) =>
            row.issued !== null &&
            (!props.startingDate || new Date(row.issued) >= new Date(newStartingDate)) &&
            (!props.endDate || new Date(row.issued) <= new Date(newEndDate))
        );
      }
    }
  }

  pvz.value.forEach((pvzName: string) => {
    expenditureByPVZ[pvzName] = 0;
  });

  pvz.value.forEach((pvzName: string) => {
    receiptsByPVZ[pvzName] = 0;
  });

  arrayOfExpenditure.value?.forEach((row) => {
    if (!isNaN(expenditureByPVZ[row.PVZ])) {
      expenditureByPVZ[row.PVZ] += parseFloat(row.expenditure);
    }
  });

  arrayOfReceipts.value?.forEach((row) => {
    if (!isNaN(receiptsByPVZ[row.PVZ])) {
      receiptsByPVZ[row.PVZ] += parseFloat(row.expenditure);
    }
  });

  rowsBalanceArr.value?.forEach((row) => {
    if (!isNaN(receiptsByPVZ[row.pvz])) {
      receiptsByPVZ[row.pvz] += parseFloat(row.sum);
    }
  });

  rowsOnlineArr.value?.forEach((row) => {
    if (!isNaN(receiptsByPVZ[row.dispatchPVZ])) {
      receiptsByPVZ[row.dispatchPVZ] += calculateValue(row);
    }
  });

  rowsDeliveryArr.value.forEach((row) => {
    if (!isNaN(receiptsByPVZ[row.orderPVZ])) {
      receiptsByPVZ[row.orderPVZ] += row.amountFromClient3;
    }
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

  getTotal();
}


// function updateCurrentPageData() {
//   const newStartingDate = new Date(props.startingDate);
//   newStartingDate.setHours(0, 0, 0, 0);

//   const newEndDate = new Date(props.endDate);
//   newEndDate.setHours(23, 59, 59, 999);

//   const isDateInRange = (date) =>
//     (!props.startingDate || date >= newStartingDate) &&
//     (!props.endDate || date <= newEndDate);

//   const isWithinWeekRange = (date, week) => {
//     const [startDate, endDate] = parseWeekRange(week);
//     return date >= startDate && date <= endDate;
//   };

//   const isValidExpenditureType = (type) =>
//     ![
//       "Пополнение баланса",
//       "Передача денежных средств",
//       "Перевод в кредитный баланс",
//       "Списание кредитной задолженности торговой империи",
//       "Перевод с кредитного баланса нал",
//       "Перевод с кредитного баланса безнал",
//       "Новый кредит нал",
//       "Новый кредит безнал",
//       "Вывод дивидендов",
//     ].includes(type);

//   returnRows.value = props.rows;
//   const monthFilter = +props.month;

//   if (!props.isDateFilter) {
//     filteredRows.value = returnRows.value.filter((row) => {
//       const rowDate = new Date(row.date);
//       return (
//         row.PVZ !== "" && rowDate.getMonth() + 1 === monthFilter && isDateInRange(rowDate)
//       );
//     });

//     const filterDeliveries = (row) => {
//       const rowDate = new Date(row.paid);
//       return (
//         row.paid !== null &&
//         (props.week.includes("неделя")
//           ? isWithinWeekRange(rowDate, props.week)
//           : rowDate.getMonth() + 1 === monthFilter) &&
//         isDateInRange(rowDate)
//       );
//     };

//     rowsDeliveryArr.value = props.rowsDelivery.filter(filterDeliveries);

//     const filterRansoms = (row) => {
//       const rowDate = new Date(row.issued);
//       return (
//         row.additionally !== "Отказ брак" &&
//         (props.week.includes("неделя")
//           ? isWithinWeekRange(rowDate, props.week)
//           : rowDate.getMonth() + 1 === monthFilter) &&
//         isDateInRange(rowDate)
//       );
//     };

//     rowsOnlineArr.value =
//       props.company === "Darom.pro" || props.company === "Все"
//         ? props.rowsOurRansom.filter(filterRansoms)
//         : [];
//   } else {
//     filteredRows.value = returnRows.value.filter((row) => {
//       return row.PVZ !== "" && isDateInRange(new Date(row.date));
//     });

//     rowsDeliveryArr.value = props.rowsDelivery.filter((row) => {
//       const rowDate = new Date(row.paid);
//       return (
//         row.paid !== null &&
//         (props.week.includes("неделя")
//           ? isWithinWeekRange(rowDate, props.week)
//           : isDateInRange(rowDate))
//       );
//     });

//     rowsOnlineArr.value =
//       props.company === "Darom.pro" || props.company === "Все"
//         ? props.rowsOurRansom.filter((row) => {
//             const rowDate = new Date(row.issued);
//             return (
//               row.additionally !== "Отказ брак" &&
//               (props.week.includes("неделя")
//                 ? isWithinWeekRange(rowDate, props.week)
//                 : isDateInRange(rowDate))
//             );
//           })
//         : [];
//   }

//   arrayOfExpenditure.value = filteredRows.value.filter((row) => {
//     const rowDate = new Date(row.date);
//     return (
//       isValidExpenditureType(row.typeOfExpenditure) &&
//       (props.week.includes("неделя")
//         ? isWithinWeekRange(rowDate, props.week)
//         : rowDate.getMonth() + 1 === monthFilter) &&
//       (!props.type || row.type === props.type)
//     );
//   });

//   arrayOfReceipts.value = filteredRows.value.filter((row) => {
//     const rowDate = new Date(row.date);
//     return (
//       row.typeOfExpenditure === "Пополнение баланса" &&
//       (props.week.includes("неделя")
//         ? isWithinWeekRange(rowDate, props.week)
//         : rowDate.getMonth() + 1 === monthFilter) &&
//       (!props.type || row.type === props.type)
//     );
//   });

//   pvz.value.forEach((pvzName) => {
//     expenditureByPVZ[pvzName] = 0;
//     receiptsByPVZ[pvzName] = 0;
//   });

//   arrayOfExpenditure.value.forEach((row) => {
//     expenditureByPVZ[row.PVZ] += parseFloat(row.expenditure);
//   });

//   arrayOfReceipts.value.forEach((row) => {
//     receiptsByPVZ[row.PVZ] += parseFloat(row.expenditure);
//   });

//   rowsBalanceArr.value?.forEach((row) => {
//     receiptsByPVZ[row.pvz] += parseFloat(row.sum);
//   });

//   rowsOnlineArr.value.forEach((row) => {
//     receiptsByPVZ[row.dispatchPVZ] += calculateValue(row);
//   });

//   rowsDeliveryArr.value.forEach((row) => {
//     receiptsByPVZ[row.orderPVZ] += row.amountFromClient3;
//   });

//   pvz.value.forEach((pvzName) => {
//     differenceByPVZ[pvzName] = receiptsByPVZ[pvzName] - expenditureByPVZ[pvzName];
//   });

//   sumOfArray2.value = Object.values(expenditureByPVZ).reduce(
//     (sum, value) => sum + value,
//     0
//   );
//   sumOfArray1.value = Object.values(receiptsByPVZ).reduce((sum, value) => sum + value, 0);
//   sumOfArray3.value = Object.values(differenceByPVZ).reduce(
//     (sum, value) => sum + value,
//     0
//   );

//   getTotal();
// }

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
  let array;
  array = props.rows;
  array = array?.filter((row: IAdvanceReport) => {
    return row.PVZ !== "";
  });

  rowsDeliveryArrTotal.value = props.rowsDelivery.filter(
    (row: IDelivery) => row.paid !== null
  );

  arrayOfExpenditureTotal.value = array?.filter(
    (row: IAdvanceReport) =>
      row.typeOfExpenditure !== "Пополнение баланса" &&
      row.typeOfExpenditure !== "Передача денежных средств" &&
      row.typeOfExpenditure !== "Перевод в кредитный баланс" &&
      row.typeOfExpenditure !== "Списание кредитной задолженности торговой империи" &&
      row.typeOfExpenditure !== "Списание балансовой задолженности торговой империи" &&
      row.typeOfExpenditure !== "Перевод с баланса нал" &&
      row.typeOfExpenditure !== "Перевод с баланса безнал" &&
      row.typeOfExpenditure !== "Перевод с кредитного баланса нал" &&
      row.typeOfExpenditure !== "Перевод с кредитного баланса безнал" &&
      row.typeOfExpenditure !== "Новый кредит нал" &&
      row.typeOfExpenditure !== "Новый кредит безнал" &&
      row.typeOfExpenditure !== "Перевод с кредитного баланса" &&
      row.typeOfExpenditure !== "Вывод дивидендов"
  );
  arrayOfReceiptsTotal.value = array?.filter(
    (row: IAdvanceReport) =>
      row.typeOfExpenditure === "Пополнение баланса" &&
      (!props.type || row.type === props.type)
  );

  rowsOnlineArrTotal.value = props.rowsOurRansom.filter(
    (row: IOurRansom) => row.additionally !== "Отказ брак"
  );

  pvz.value.forEach((pvzName: string) => {
    expenditureByPVZTotal[pvzName] = 0;
  });

  pvz.value.forEach((pvzName: string) => {
    receiptsByPVZTotal[pvzName] = 0;
  });

  arrayOfExpenditureTotal.value?.forEach((row) => {
    if (!isNaN(expenditureByPVZTotal[row.PVZ])) {
      expenditureByPVZTotal[row.PVZ] += parseFloat(row.expenditure);
    }
  });

  arrayOfReceiptsTotal.value?.forEach((row) => {
    if (!isNaN(receiptsByPVZTotal[row.PVZ])) {
      receiptsByPVZTotal[row.PVZ] += parseFloat(row.expenditure);
    }
  });

  rowsBalanceArrTotal.value?.forEach((row) => {
    if (!isNaN(receiptsByPVZTotal[row.pvz])) {
      receiptsByPVZTotal[row.pvz] += parseFloat(row.sum);
    }
  });

  rowsOnlineArrTotal.value?.forEach((row) => {
    if (!isNaN(receiptsByPVZTotal[row.dispatchPVZ])) {
      receiptsByPVZTotal[row.dispatchPVZ] += calculateValue(row);
    }
  });

  rowsDeliveryArrTotal.value?.forEach((row) => {
    if (!isNaN(receiptsByPVZTotal[row.orderPVZ])) {
      receiptsByPVZTotal[row.orderPVZ] += row.amountFromClient3;
    }
  });

  pvz.value.forEach((pvzName: string) => {
    const difference = receiptsByPVZTotal[pvzName] - expenditureByPVZTotal[pvzName];
    differenceByPVZTotal[pvzName] = difference;
  });

  Object.keys(expenditureByPVZ).forEach((pvzName: string) => {
    sumOfArray2Total.value += expenditureByPVZTotal[pvzName];
  });

  Object.keys(receiptsByPVZ).forEach((pvzName: string) => {
    sumOfArray1Total.value += receiptsByPVZTotal[pvzName];
  });

  Object.keys(differenceByPVZ).forEach((pvzName: string) => {
    sumOfArray3Total.value += differenceByPVZTotal[pvzName];
  });

  emit("returnTotal", sumOfArray3Total.value);
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
  sumOfArray1Total.value = 0;
  sumOfArray2Total.value = 0;
  sumOfArray3Total.value = 0;
}

watch([props.rows, totalRows, filteredRows.value, props.month], clearTotalSums);
watch([props.rows, totalRows, filteredRows.value, props.month], updateCurrentPageData);
watch(() => props.month, clearTotalSums);
watch(() => props.month, updateCurrentPageData);
watch(() => props.type, clearTotalSums);
watch(() => props.type, updateCurrentPageData);
watch(() => props.startingDate, clearTotalSums);
watch(() => props.startingDate, updateCurrentPageData);
watch(() => props.endDate, clearTotalSums);
watch(() => props.endDate, updateCurrentPageData);
watch(() => props.isDateFilter, clearTotalSums);
watch(() => props.isDateFilter, updateCurrentPageData);


let pvz = ref([
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
  "Бессоново",
  "ПВЗ_1",
  "ПВЗ_2",
  "ПВЗ_3",
  "ПВЗ_4",
  "ППВЗ_5",
  "ППВЗ_7",
  "Офис",
  "НаДом",
]);

function exportToExcel() {
  let table = document.querySelector("#theTable");
  let wb = utils.table_to_book(table);
  writeFile(wb, "сводные_таблицы.xlsx");
}
</script>
<template>
  <div class="relative">
    <div class="absolute top-[-65px] right-0">
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
        id="theTable"
        class="w-full border-[1px] border-gray-50 text-sm text-left rtl:text-right text-gray-500"
      >
        <thead
          class="text-xs bg-[#36304a] text-white sticky top-0 z-30 uppercase text-center"
        >
          <tr>
            <td class="border-[1px] p-2 whitespace-nowrap font-bold">Статус</td>
            <th scope="col" class="border-[1px] p-2 whitespace-nowrap" v-for="pvzName in pvz">
              {{ pvzName }}
            </th>
            <td class="border-[1px] p-2 whitespace-nowrap font-bold">Итого</td>
          </tr>
        </thead>
        <tbody>
          <tr class="text-center bg-white">
            <td class="border-[1px] p-2 whitespace-nowrap font-bold">Поступления</td>
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
