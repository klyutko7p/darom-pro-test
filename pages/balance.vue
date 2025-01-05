<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
import VueMultiselect from "vue-multiselect";
import ru from "date-fns/locale/ru";
import { vAutoAnimate } from "@formkit/auto-animate";
import { sub, format, isSameDay, type Duration } from "date-fns";

const storeUsers = useUsersStore();
const storePVZ = usePVZStore();
const storeRansom = useRansomStore();
const storeBalance = useBalanceStore();
const storeAdvanceReport = useAdvanceReports();
const router = useRouter();

const toast = useToast();
let user = ref({} as User);
let pvz = ref<Array<PVZ>>();
let ourRansomRows = ref<Array<IOurRansom>>();
let clientRansomRows = ref<Array<IClientRansom>>();
let deliveryRansomRows = ref<Array<IDelivery>>();
const token = Cookies.get("token");
let isLoading = ref(false);
let rows = ref<Array<IBalance>>();
let rowsOnline = ref<Array<IBalanceOnline>>();
let rowsProfit = ref<Array<IBalance>>();
let rowsProfitManager = ref<Array<IBalance>>();
let rowsDelivery = ref<Array<IBalanceDelivery>>();
let sumOfReject = ref<any>();
let rowsWithProfitRows = ref();

interface DurationType {
  month?: "current" | "0" | "1" | string;
  years?: number;
}

interface SelectedDateRange {
  start: Date;
  end: Date;
}

const ranges = [
  { label: "Январь", duration: { month: "0" } },
  { label: "Февраль", duration: { month: "1" } },
  { label: "Март", duration: { month: "2" } },
  { label: "Апрель", duration: { month: "3" } },
  { label: "Май", duration: { month: "4" } },
  { label: "Июнь", duration: { month: "5" } },
  { label: "Июль", duration: { month: "6" } },
  { label: "Август", duration: { month: "7" } },
  { label: "Сентябрь", duration: { month: "8" } },
  { label: "Октябрь", duration: { month: "9" } },
  { label: "Ноябрь", duration: { month: "10" } },
  { label: "Декабрь", duration: { month: "11" } },
  { label: "Текущий месяц", duration: { month: "current" } },
  { label: "Последний год", duration: { years: 1 } },
];

const selected = ref<SelectedDateRange>({
  start: new Date(2024, 0, 1),
  end: new Date(),
});

function getMonthRange(year: number, month: number): SelectedDateRange {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
}

function isRangeSelected(duration: DurationType): boolean {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  if (duration.month === "current") {
    const { start, end } = getMonthRange(currentYear, currentDate.getMonth());
    return (
      isSameDay(selected.value.start, start) &&
      isSameDay(selected.value.end, end)
    );
  }

  const month = parseInt(duration.month as string, 10);
  if (!isNaN(month) && month >= 0 && month <= 11) {
    const { start, end } = getMonthRange(currentYear, month);
    return (
      isSameDay(selected.value.start, start) &&
      isSameDay(selected.value.end, end)
    );
  }

  if (duration.years) {
    const start = sub(currentDate, { years: duration.years });
    return (
      isSameDay(selected.value.start, start) &&
      isSameDay(selected.value.end, currentDate)
    );
  }

  return false;
}

function selectRange(duration: DurationType) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  if (duration.month === "current") {
    selected.value = getMonthRange(currentYear, currentDate.getMonth());
    return;
  }

  const month = parseInt(duration.month as string, 10);
  if (!isNaN(month) && month >= 0 && month <= 11) {
    selected.value = getMonthRange(currentYear, month);
    return;
  }

  if (duration.years) {
    selected.value = {
      start: sub(currentDate, { years: duration.years }),
      end: currentDate,
    };
    return;
  }
}

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;

  try {
    user.value = await storeUsers.getUser();

    const [
      deliveryRansomRowsData,
      sumOfRejectData,
      balanceRowsData,
      balanceOnlineRowsData,
      balanceProfitRowsData,
      balanceProfitManagerRowsData,
      balanceDeliveryRowsData,
      ransomRowsForBalanceOurRansomDataPartOne,
      ransomRowsForBalanceOurRansomDataPartTwo,
      ransomRowsForBalanceOurRansomDataPartThree,
      ransomRowsForBalanceOurRansomDataPartFour,
      ransomRowsForBalanceOurRansomDataPartFive,
      ransomRowsForBalanceOurRansomDataPartSix,
      ransomRowsForBalanceClientRansomData,
      pvzData,
    ] = await Promise.all([
      storeRansom.getRansomRowsForBalanceDelivery(),
      storeRansom.getSumOfRejection(),
      storeBalance.getBalanceRows(),
      storeBalance.getBalanceOnlineRows(),
      storeBalance.getBalanceProfitRows(),
      storeBalance.getBalanceProfitManagerRows(),
      storeBalance.getBalanceDeliveryRows(),
      storeRansom.getRansomRowsForBalanceOurRansomPartOne(),
      storeRansom.getRansomRowsForBalanceOurRansomPartTwo(),
      storeRansom.getRansomRowsForBalanceOurRansomPartThree(),
      storeRansom.getRansomRowsForBalanceOurRansomPartFour(),
      storeRansom.getRansomRowsForBalanceOurRansomPartFive(),
      storeRansom.getRansomRowsForBalanceOurRansomPartSix(),
      storeRansom.getRansomRowsForBalanceClientRansom(),
      storePVZ.getPVZ(),
    ]);

    deliveryRansomRows.value = deliveryRansomRowsData;
    sumOfReject.value = sumOfRejectData;
    rows.value = balanceRowsData;
    rowsOnline.value = balanceOnlineRowsData;
    rowsProfit.value = balanceProfitRowsData;
    rowsProfitManager.value = balanceProfitManagerRowsData;
    rowsDelivery.value = balanceDeliveryRowsData;
    ourRansomRows.value = [
      ...ransomRowsForBalanceOurRansomDataPartOne,
      ...ransomRowsForBalanceOurRansomDataPartTwo,
      ...ransomRowsForBalanceOurRansomDataPartThree,
      ...ransomRowsForBalanceOurRansomDataPartFour,
      ...ransomRowsForBalanceOurRansomDataPartFive,
      ...ransomRowsForBalanceOurRansomDataPartSix,
    ];
    clientRansomRows.value = ransomRowsForBalanceClientRansomData;
    pvz.value = pvzData;

    rowsWithProfitRows.value = [
      ...rows.value,
      ...rowsProfit.value,
      ...rowsProfitManager.value,
    ];

    getAllSum();

    if (
      user.value.role === "PVZ" ||
      user.value.role === "COURIER" ||
      user.value.role === "PPVZ"
    ) {
      selectedPVZ.value = user.value.visiblePVZ;
      rows.value = rows.value?.filter(
        (row) =>
          row.pvz === user.value.visiblePVZ ||
          user.value.PVZ.includes(row.recipient)
      );
    } else if (user.value.role === "RMANAGER") {
      selectedPVZ.value = "Все ППВЗ";
      rows.value = rows.value?.filter(
        (row) =>
          user.value.PVZ.includes(row.pvz) ||
          user.value.PVZ.includes(row.recipient)
      );
    } else if (user.value.username === "Мешков") {
      selectedPVZ.value = "Все ПВЗ (Город)";
      rows.value = rows.value?.filter((row) =>
        user.value.PVZ.includes(row.pvz)
      );
    } else if (user.value.username === "Шведова") {
      selectedPVZ.value = "Все ПВЗ (Город)";
      rows.value = rows.value?.filter((row) =>
        user.value.PVZ.includes(row.pvz)
      );
    }

    getProfitRowsSum();
    getProfitManagerRowsSum();
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    isLoading.value = false;
  }
});

definePageMeta({
  layout: false,
  name: "Баланс",
});

let copyArrayOurRansom = ref<Array<IOurRansom>>();
let copyArrayClientRansom = ref<Array<IClientRansom>>();
let copyArrayDelivery1 = ref<Array<IDelivery>>();
let copyArrayDelivery2 = ref<Array<IDelivery>>();

let sum1 = ref(0);
let sum2 = ref(0);
let sum3 = ref(0);
let allSum = ref(0);
let allSumProfit = ref(0);
let allSumProfitManager = ref(0);
let showFilters = ref(false);

let selectedPVZ = ref("Все ПВЗ");
let selectedTypeOfTransaction = ref("Баланс наличные");

const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string | null>(null);

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

    const roundOrCeil = (num: number) => {
      const lastDigit = num % 10;
      return lastDigit >= 5
        ? Math.ceil(num / 10) * 10
        : Math.floor(num / 10) * 10;
    };

    if (!shouldRound(curValue)) {
      return curValue.additionally !== "Отказ клиент наличные" ||
        curValue.additionally !== "Отказ клиент онлайн" ||
        curValue.additionally !== "Отказ клиент"
        ? Math.ceil(curValue.amountFromClient1 / 10) * 10 -
            curValue.priceSite +
            curValue.deliveredKGT
        : +sumOfReject.value.value;
    } else {
      return curValue.additionally !== "Отказ клиент наличные" ||
        curValue.additionally !== "Отказ клиент онлайн" ||
        curValue.additionally !== "Отказ клиент"
        ? Math.ceil(
            roundOrCeil(
              curValue.priceSite +
                (curValue.priceSite * 10) / 100 -
                curValue.prepayment
            )
          ) -
            curValue.priceSite +
            curValue.deliveredKGT
        : +sumOfReject.value.value;
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
      : +sumOfReject.value.value;
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

function reduceArray(array: any, flag: string) {
  if (selectedTypeOfTransaction.value === "Доход") {
    if (flag === "OurRansom") {
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена"
      );
      return array.reduce(
        (ac: any, curValue: any) => ac + calculateValue(curValue),
        0
      );
    } else if (flag === "ClientRansom") {
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена"
      );
      return array.reduce((ac: any, curValue: any) => ac + curValue.profit2, 0);
    } else {
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена"
      );
      return array.reduce((ac: any, curValue: any) => ac + curValue.profit3, 0);
    }
  } else if (selectedTypeOfTransaction.value === "Заказано") {
    if (flag === "OurRansom") {
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.priceSite,
        0
      );
    }
  }
  else if (selectedTypeOfTransaction.value === "Постоплата WB") {
    if (flag === "OurRansom") {
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.priceSite,
        0
      );
    }
  }
  else if (selectedTypeOfTransaction.value === "Заказано3") {
    if (flag === "OurRansom") {
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.priceSite,
        0
      );
    }
  } else if (selectedTypeOfTransaction.value === "Баланс наличные") {
    if (flag === "OurRansom") {
      let arrayCopy = array;
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ клиент онлайн" &&
          row.additionally !== "Отказ подмена" &&
          new Date(row.created_at) < new Date("2024-06-05T00:00:01")
      );
      let array2 = arrayCopy.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ клиент онлайн" &&
          row.additionally !== "Отказ подмена" &&
          new Date(row.created_at) >= new Date("2024-06-05T00:00:01")
      );
      let firstReduce = array.reduce(
        (ac: any, curValue: any) =>
          ac + Math.ceil(curValue.amountFromClient1 / 10) * 10,
        0
      );
      let secondReduce = array2.reduce(
        (ac: any, curValue: any) =>
          ac + roundToNearestTen(curValue.amountFromClient1),
        0
      );
      return firstReduce + secondReduce;
    } else if (flag === "ClientRansom") {
      let arrayCopy = array;
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ клиент онлайн" &&
          row.additionally !== "Отказ подмена" &&
          new Date(row.created_at) < new Date("2024-06-05T00:00:01")
      );
      let array2 = arrayCopy.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ клиент онлайн" &&
          row.additionally !== "Отказ подмена" &&
          new Date(row.created_at) >= new Date("2024-06-05T00:00:01")
      );
      let firstReduce = array.reduce(
        (ac: any, curValue: any) =>
          ac + Math.ceil(curValue.amountFromClient2 / 10) * 10,
        0
      );
      let secondReduce = array2.reduce(
        (ac: any, curValue: any) =>
          ac + roundToNearestTen(curValue.amountFromClient2),
        0
      );
      return firstReduce + secondReduce;
    }
  } else if (selectedTypeOfTransaction.value === "Баланс безнал") {
    if (flag === "OurRansom") {
      let arrayCopy = array;
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена" &&
          row.additionally !== "Отказ клиент наличные"
      );
      if (array.length > 0) {
        return array.reduce((ac: any, curValue: any) => {
          let amount = 0;
          if (!curValue.prepayment && curValue.amountFromClient1) {
            curValue.prepayment = 0;
            if (
              new Date(curValue.created_at) < new Date("2024-06-05T00:00:01")
            ) {
              amount =
                Math.ceil(curValue.amountFromClient1 / 10) * 10 +
                curValue.prepayment;
            } else {
              amount = roundToNearestTen(curValue.amountFromClient1);
            }
          } else if (!curValue.amountFromClient1 && curValue.prepayment) {
            curValue.amountFromClient1 = 0;
            amount =
              Math.ceil(curValue.amountFromClient1 / 10) * 10 +
              curValue.prepayment;
          } else if (!curValue.amountFromClient1 && !curValue.prepayment) {
            curValue.prepayment = 0;
            curValue.amountFromClient1 = 0;
            amount =
              Math.ceil(curValue.amountFromClient1 / 10) * 10 +
              curValue.prepayment;
          } else {
            if (
              new Date(curValue.created_at) < new Date("2024-06-05T00:00:01")
            ) {
              amount =
                Math.ceil(curValue.amountFromClient1 / 10) * 10 +
                curValue.prepayment;
            } else {
              amount = roundToNearestTen(curValue.amountFromClient1);
            }
          }
          return ac + amount;
        }, 0);
      } else {
        return 0;
      }
    } else if (flag === "ClientRansom") {
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена" &&
          row.additionally !== "Отказ клиент наличные"
      );
      if (array.length > 0) {
        return array.reduce((ac, curValue) => {
          if (!curValue.prepayment && curValue.amountFromClient2) {
            curValue.prepayment = 0;
            return ac + curValue.amountFromClient2 + curValue.prepayment;
          } else if (!curValue.amountFromClient2 && curValue.prepayment) {
            curValue.amountFromClient2 = 0;
            return ac + curValue.amountFromClient2 + curValue.prepayment;
          } else if (!curValue.amountFromClient2 && !curValue.prepayment) {
            curValue.prepayment = 0;
            curValue.amountFromClient2 = 0;
            return ac + curValue.amountFromClient2 + curValue.prepayment;
          } else {
            return ac + curValue.amountFromClient2 + curValue.prepayment;
          }
        }, 0);
      } else {
        return 0;
      }
    } else {
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена" &&
          row.additionally !== "Отказ клиент наличные"
      );
      if (array.length > 0) {
        return array.reduce(
          (ac: any, curValue: any) => ac + curValue.amountFromClient3,
          0
        );
      } else {
        return 0;
      }
    }
  } else if (selectedTypeOfTransaction.value === "Доставка") {
    array = array.filter(
      (row: any) =>
        row.additionally !== "Отказ брак" &&
        row.additionally !== "Отказ подмена"
    );
    return array.reduce(
      (ac: any, curValue: any) => ac + curValue.amountFromClient3,
      0
    );
  } else if (selectedTypeOfTransaction.value === "Заказано1") {
    if (flag === "OurRansom") {
      let arrayCopy = array;
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ клиент онлайн" &&
          row.additionally !== "Отказ подмена" &&
          new Date(row.created_at) < new Date("2024-06-05T00:00:01")
      );
      let array2 = arrayCopy.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ клиент онлайн" &&
          row.additionally !== "Отказ подмена" &&
          new Date(row.created_at) >= new Date("2024-06-05T00:00:01")
      );
      let firstReduce = array.reduce(
        (ac: any, curValue: any) =>
          ac + Math.ceil(curValue.amountFromClient1 / 10) * 10,
        0
      );
      let secondReduce = array2.reduce(
        (ac: any, curValue: any) =>
          ac + roundToNearestTen(curValue.amountFromClient1),
        0
      );
      return firstReduce + secondReduce;
    } else if (flag === "ClientRansom") {
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена" &&
          row.additionally !== "Отказ клиент онлайн"
      );
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.amountFromClient2,
        0
      );
    } else {
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена" &&
          row.additionally !== "Отказ клиент онлайн"
      );
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.amountFromClient3,
        0
      );
    }
  } else if (selectedTypeOfTransaction.value === "Заказано2") {
    if (flag === "OurRansom") {
      let arrayCopy = array;
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена" &&
          row.additionally !== "Отказ клиент наличные" &&
          new Date(row.created_at) < new Date("2024-06-05T00:00:01")
      );
      let array2 = arrayCopy.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена" &&
          row.additionally !== "Отказ клиент наличные" &&
          new Date(row.created_at) >= new Date("2024-06-05T00:00:01")
      );
      let firstReduce = array.reduce(
        (ac: any, curValue: any) =>
          ac + Math.ceil(curValue.amountFromClient1 / 10) * 10,
        0
      );
      let secondReduce = array2.reduce(
        (ac: any, curValue: any) =>
          ac + roundToNearestTen(curValue.amountFromClient1),
        0
      );
      return firstReduce + secondReduce;
    } else if (flag === "ClientRansom") {
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена" &&
          row.additionally !== "Отказ клиент наличные"
      );
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.amountFromClient2,
        0
      );
    } else {
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена" &&
          row.additionally !== "Отказ клиент наличные"
      );
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.amountFromClient3,
        0
      );
    }
  } else if (selectedTypeOfTransaction.value === "Доход PPVZ") {
    if (flag === "OurRansom") {
      let arrayCopy = array;
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена" &&
          row.additionally !== "Отказ клиент наличные" &&
          new Date(row.created_at) < new Date("2024-06-05T00:00:01")
      );
      let array2 = arrayCopy.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена" &&
          row.additionally !== "Отказ клиент наличные" &&
          new Date(row.created_at) >= new Date("2024-06-05T00:00:01")
      );
      let firstReduce = array.reduce(
        (ac: any, curValue: any) =>
          ac + Math.ceil(curValue.amountFromClient1 / 10) * 10 * 0.025,
        0
      );
      let secondReduce = array2.reduce(
        (ac: any, curValue: any) =>
          ac + roundToNearestTen(curValue.amountFromClient1) * 0.025,
        0
      );
      return firstReduce + secondReduce;
    } else if (flag === "ClientRansom") {
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена"
      );
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.amountFromClient2 * 0.025,
        0
      );
    } else {
      array = array.filter(
        (row: any) =>
          row.additionally !== "Отказ брак" &&
          row.additionally !== "Отказ подмена"
      );
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.amountFromClient3 * 0.025,
        0
      );
    }
  }
}

function reduceArrayProfit(array: any[], flag: string) {
  const filterArray = (array: any[], dateCondition?: Date) => {
    return array.filter(
      (row: any) =>
        row.additionally !== "Отказ брак" &&
        row.additionally !== "Отказ подмена" &&
        (!dateCondition || new Date(row.issued) >= dateCondition)
    );
  };

  const roundOrCeil = (num: number) => {
    const lastDigit = num % 10;
    return lastDigit >= 5
      ? Math.ceil(num / 10) * 10
      : Math.floor(num / 10) * 10;
  };

  const calculateAmount = (array: any[], clientField: string, rate: number) => {
    const thresholdDate = new Date("2024-06-05 00:00:01");
    return array.reduce((total: number, row: any) => {
      const createdAt = new Date(row.created_at);
      const issuedDate = new Date(row.issued);
      let effectiveRate = rate;

      // Новое условие
      if (
        selectedPVZ.value === "ППВЗ_5" &&
        issuedDate >= new Date("2024-12-01")
      ) {
        effectiveRate = 0.03;
      }

      const amount = row[clientField];
      const adjustedAmount =
        createdAt > thresholdDate
          ? roundOrCeil(amount)
          : Math.ceil(amount / 10) * 10;
      return total + adjustedAmount * effectiveRate;
    }, 0);
  };

  const calculatePrepayment = (array: any[], rate: number) => {
    return array.reduce((total: number, row: any) => {
      const prepayment = row.prepayment || 0;
      return total + prepayment * rate;
    }, 0);
  };

  if (flag === "OurRansom") {
    const rate = user.value.PVZ.includes("ПВЗ_1") ? 0.035 : 0.025;
    const dateCondition = user.value.PVZ.includes("ПВЗ_1")
      ? new Date("2024-04-01")
      : undefined;

    const filteredArray = filterArray(array, dateCondition);
    const amount = calculateAmount(filteredArray, "amountFromClient1", rate);
    const prepayment = calculatePrepayment(filteredArray, 0.035);

    return amount + prepayment;
  } else if (flag === "ClientRansom") {
    const filteredArray = filterArray(array);
    const amount = calculateAmount(filteredArray, "amountFromClient2", 0.025);
    return amount;
  } else {
    const amount = calculateAmount(array, "amountFromClient2", 0.025);
    return amount;
  }
}

// function reduceArrayProfit(array: any[], flag: string): number {
//   let totalProfit = 0;

//   const shouldRound = (value: any) => {
//     const createdDate = new Date(value.created_at);
//     const referenceDate = new Date("2024-06-05T00:00:01");
//     return createdDate > referenceDate;
//   };

//   const roundOrCeil = (num: number) => {
//     const lastDigit = num % 10;
//     return lastDigit >= 5 ? Math.ceil(num / 10) * 10 : Math.floor(num / 10) * 10;
//   };

//   const ceilMath = (num: number) => {
//     return Math.ceil(num / 10) * 10;
//   };

//   array.forEach((row: any) => {
//     if (row.additionally !== "Отказ брак") {
//       const roundFunction = shouldRound(row) ? roundOrCeil : ceilMath;
//       switch (flag) {
//         case "OurRansom":
//           let amount = roundFunction(row.amountFromClient1) * 0.025;
//           let prepayment = row.prepayment ? row.prepayment * 0.035 : 0;
//           totalProfit += amount + prepayment;
//           break;
//         case "ClientRansom":
//           totalProfit += row.amountFromClient2 * 0.025;
//           break;
//         default:
//           totalProfit += row.amountFromClient2 * 0.025;
//           break;
//       }
//     }
//   });

//   return totalProfit;
// }

function getAllSum() {
  let newStartingDate = new Date(selected.value.start);
  newStartingDate.setHours(0);
  newStartingDate.setMinutes(0);
  newStartingDate.setSeconds(0);
  newStartingDate.setMilliseconds(0);

  let newEndDate = new Date(selected.value.end);
  newEndDate.setHours(23);
  newEndDate.setMinutes(59);
  newEndDate.setSeconds(59);
  newEndDate.setMilliseconds(0);

  if (selectedTypeOfTransaction.value === "Доход") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end || new Date(row.issued) <= new Date(newEndDate))
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end || new Date(row.issued) <= new Date(newEndDate))
      );

      if (
        (selected.value.start !== null && selected.value.start !== "") ||
        (selected.value.end !== null && selected.value.end !== "")
      ) {
        sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
        sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
        allSum.value = sum1.value + sum2.value;
      } else {
        allSum.value = 0;
      }
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end || new Date(row.issued) <= new Date(newEndDate))
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end || new Date(row.issued) <= new Date(newEndDate))
      );

      if (
        (selected.value.start !== null && selected.value.start !== "") ||
        (selected.value.end !== null && selected.value.end !== "")
      ) {
        sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
        sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
        allSum.value = sum1.value + sum2.value;
      } else {
        allSum.value = 0;
      }
    }
  } else if (selectedTypeOfTransaction.value === "Заказано") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          !row.issued &&
          !row.deleted &&
          row.dp &&
          (!selected.value.start ||
            new Date(row.created_at) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.created_at) <= new Date(newEndDate))
      );
      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      allSum.value = sum1.value;
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          row.issued === null &&
          row.deleted === null &&
          row.dp &&
          (!selected.value.start ||
            new Date(row.created_at) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.created_at) <= new Date(newEndDate))
      );
      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      allSum.value = sum1.value;
    }
  }
  else if (selectedTypeOfTransaction.value === "Постоплата WB") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          !row.issued &&
          !row.deleted &&
          !row.dp &&
          (!selected.value.start ||
            new Date(row.created_at) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.created_at) <= new Date(newEndDate))
      );
      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      allSum.value = sum1.value;
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          row.issued === null &&
          row.deleted === null &&
          !row.dp &&
          (!selected.value.start ||
            new Date(row.created_at) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.created_at) <= new Date(newEndDate))
      );
      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      allSum.value = sum1.value;
    }
  }
  else if (selectedTypeOfTransaction.value === "Заказано3") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          (!selected.value.start ||
            new Date(row.created_at) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.created_at) <= new Date(newEndDate))
      );
      if (
        (selected.value.start !== null && selected.value.start !== "") ||
        (selected.value.end !== null && selected.value.end !== "")
      ) {
        sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
        allSum.value = sum1.value;
      } else {
        allSum.value = 0;
      }
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          (!selected.value.start ||
            new Date(row.created_at) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.created_at) <= new Date(newEndDate))
      );
      if (
        (selected.value.start !== null && selected.value.start !== "") ||
        (selected.value.end !== null && selected.value.end !== "")
      ) {
        sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
        allSum.value = sum1.value;
      } else {
        allSum.value = 0;
      }
    }
  } else if (selectedTypeOfTransaction.value === "Баланс наличные") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент")
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент")
      );

      let sumOfPVZ = rows.value
        ?.filter((row) => row.received !== null && row.recipient === "Нет")
        .reduce((acc, value) => acc + +value.sum, 0);

      let sumOfPVZ3 = rows.value
        ?.filter((row) => row.received !== null && row.recipient !== "Нет")
        .reduce((acc, value) => acc + +value.sum, 0);

      let sumOfPVZ5 = rowsProfit.value
        ?.filter(
          (row) =>
            row.received !== null &&
            (row.recipient === "Владимирова Инна" ||
              row.recipient === "Динис Ольга" ||
              row.recipient === "Киризлеева Марина")
        )
        .reduce((acc, value) => acc + +value.sum, 0);

      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
      allSum.value =
        sum1.value + sum2.value - sumOfPVZ3 - sumOfPVZ + 319610 - sumOfPVZ5;
      allSum.value -= 11110;
      allSum.value -= 1570;
      allSum.value -= 2005;
      allSum.value -= 13100;
    } else if (selectedPVZ.value === "Все ППВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент") &&
          user.value.PVZ.includes(row.dispatchPVZ)
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент") &&
          user.value.PVZ.includes(row.dispatchPVZ)
      );

      let sumOfPVZ = rows.value
        ?.filter((row) => row.received !== null && row.recipient === "Нет")
        .reduce((acc, value) => acc + +value.sum, 0);

      let sumOfPVZ3 = rows.value
        ?.filter((row) => row.received !== null && row.recipient !== "Нет")
        .reduce((acc, value) => acc + +value.sum, 0);

      let sumOfPVZ5 = rowsProfit.value
        ?.filter(
          (row) =>
            row.received !== null &&
            (row.recipient === "Владимирова Инна" ||
              row.recipient === "Динис Ольга" ||
              row.recipient === "Киризлеева Марина")
        )
        .reduce((acc, value) => acc + +value.sum, 0);

      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
      allSum.value = sum1.value + sum2.value - sumOfPVZ3 - sumOfPVZ - sumOfPVZ5;
    } else if (selectedPVZ.value === "Все ПВЗ (Город)") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент") &&
          user.value.PVZ.includes(row.dispatchPVZ)
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент") &&
          user.value.PVZ.includes(row.dispatchPVZ)
      );

      let sumOfPVZ = rows.value
        ?.filter(
          (row) =>
            row.received !== null &&
            row.recipient === "Нет" &&
            user.value.PVZ.includes(row.pvz)
        )
        .reduce((acc, value) => acc + +value.sum, 0);

      let sumOfPVZ3 = rows.value
        ?.filter(
          (row) =>
            row.received !== null &&
            row.recipient !== "Нет" &&
            user.value.PVZ.includes(row.pvz)
        )
        .reduce((acc, value) => acc + +value.sum, 0);

      let sumOfPVZ5 = rowsProfit.value
        ?.filter(
          (row) =>
            row.received !== null &&
            (row.recipient === "Владимирова Инна" ||
              row.recipient === "Динис Ольга" ||
              row.recipient === "Киризлеева Марина") &&
            user.value.PVZ.includes(row.pvz)
        )
        .reduce((acc, value) => acc + +value.sum, 0);

      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");

      if (user.value.username === "Шведова") {
        allSum.value =
          sum1.value + sum2.value - sumOfPVZ3 - sumOfPVZ + 319610 - sumOfPVZ5;
        allSum.value -= 11110;
        allSum.value -= 1570;
        allSum.value -= 2005;
        allSum.value -= 13100;
        allSum.value += 7340;
      } else if (user.value.username === "Мешков") {
        allSum.value =
          sum1.value + sum2.value - sumOfPVZ3 - sumOfPVZ - sumOfPVZ5;
      } else {
        allSum.value =
          sum1.value + sum2.value - sumOfPVZ3 - sumOfPVZ - sumOfPVZ5;
      }
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент") &&
          row.dispatchPVZ === selectedPVZ.value
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент") &&
          row.dispatchPVZ === selectedPVZ.value
      );
      let sumOfPVZ = rows.value
        ?.filter(
          (row) =>
            row.received !== null &&
            row.pvz === selectedPVZ.value &&
            row.recipient === "Нет"
        )
        .reduce((acc, value) => acc + +value.sum, 0);
      let sumOfPVZ2 = rows.value
        ?.filter(
          (row) =>
            row.received !== null &&
            row.pvz === selectedPVZ.value &&
            row.recipient !== "Нет"
        )
        .reduce((acc, value) => acc + +value.sum, 0);
      let sumOfPVZ3 = rows.value
        ?.filter(
          (row) => row.received !== null && row.recipient === selectedPVZ.value
        )
        .reduce((acc, value) => acc + +value.sum, 0);

      let sumOfPVZ5 = rowsProfit.value
        ?.filter(
          (row) =>
            row.received !== null &&
            row.pvz === selectedPVZ.value &&
            (row.recipient === "Владимирова Инна" ||
              row.recipient === "Динис Ольга" ||
              row.recipient === "Киризлеева Марина" ||
              "Смирнов Валерий")
        )
        .reduce((acc, value) => acc + +value.sum, 0);

      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");

      allSum.value =
        sum1.value + sum2.value - sumOfPVZ - sumOfPVZ2 + sumOfPVZ3 - sumOfPVZ5;
      if (selectedPVZ.value === "НаДом") {
        allSum.value -= 11110;
      } else if (selectedPVZ.value === "ПВЗ_3") {
        allSum.value -= 2005;
      } else if (selectedPVZ.value === "ПВЗ_1") {
        allSum.value -= 2330;
        allSum.value += 15000;
      }
    }
  } else if (selectedTypeOfTransaction.value === "Баланс безнал") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплачено онлайн" ||
            row.additionally === "Отказ клиент онлайн")
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплачено онлайн" ||
            row.additionally === "Отказ клиент онлайн")
      );

      let sumOfPVZ = rowsOnline.value?.reduce(
        (acc, value) => acc + +value.sum,
        0
      );

      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
      allSum.value = sum1.value + sum2.value + sum3.value - sumOfPVZ;
    } else if (selectedPVZ.value === "Все ПВЗ (Город)") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплачено онлайн" ||
            row.additionally === "Отказ клиент онлайн") &&
          user.value.PVZ.includes(row.dispatchPVZ)
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплачено онлайн" ||
            row.additionally === "Отказ клиент онлайн") &&
          user.value.PVZ.includes(row.dispatchPVZ)
      );

      let sumOfPVZ = rowsOnline.value?.reduce(
        (acc, value) => acc + +value.sum,
        0
      );

      if (user.value.username === "Шведова") {
        sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
        sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
        allSum.value = sum1.value + sum2.value + sum3.value - sumOfPVZ;
      } else {
        sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
        sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
        allSum.value = sum1.value + sum2.value + sum3.value;
      }
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплачено онлайн" ||
            row.additionally === "Отказ клиент онлайн") &&
          row.dispatchPVZ === selectedPVZ.value
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплачено онлайн" ||
            row.additionally === "Отказ клиент онлайн") &&
          row.dispatchPVZ === selectedPVZ.value
      );

      let sumOfPVZ = rowsOnline.value?.reduce(
        (acc, value) => acc + +value.sum,
        0
      );

      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
      allSum.value = sum1.value + sum2.value - sumOfPVZ;
    }
  } else if (selectedTypeOfTransaction.value === "Доставка") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayDelivery1.value = deliveryRansomRows.value?.filter(
        (row) =>
          row.nameOfAction === "Доставка" &&
          row.paid !== null &&
          (!selected.value.start ||
            new Date(row.paid) >= new Date(newStartingDate)) &&
          (!selected.value.end || new Date(row.paid) <= new Date(newEndDate))
      );

      copyArrayDelivery2.value = deliveryRansomRows.value?.filter(
        (row) =>
          row.nameOfAction === "Сортировка" &&
          row.paid !== null &&
          (!selected.value.start ||
            new Date(row.paid) >= new Date(newStartingDate)) &&
          (!selected.value.end || new Date(row.paid) <= new Date(newEndDate))
      );

      let sumOfPVZ = rowsDelivery.value?.reduce(
        (acc, value) => acc + +value.sum,
        0
      );

      sum1.value =
        reduceArray(copyArrayDelivery1.value, "Delivery") - sumOfPVZ / 2;
      sum2.value =
        reduceArray(copyArrayDelivery2.value, "Delivery") - sumOfPVZ / 2;
      allSum.value = sum1.value + sum2.value + sum3.value;
    } else {
      copyArrayDelivery1.value = deliveryRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          row.nameOfAction === "Доставка" &&
          row.paid !== null &&
          (!selected.value.start ||
            new Date(row.paid) >= new Date(newStartingDate)) &&
          (!selected.value.end || new Date(row.paid) <= new Date(newEndDate))
      );

      copyArrayDelivery2.value = deliveryRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          row.nameOfAction === "Сортировка" &&
          row.paid !== null &&
          (!selected.value.start ||
            new Date(row.paid) >= new Date(newStartingDate)) &&
          (!selected.value.end || new Date(row.paid) <= new Date(newEndDate))
      );

      if (
        (selected.value.start !== null && selected.value.start !== "") ||
        (selected.value.end !== null && selected.value.end !== "")
      ) {
        sum1.value = reduceArray(copyArrayDelivery1.value, "Delivery");
        sum2.value = reduceArray(copyArrayDelivery2.value, "Delivery");
        allSum.value = sum1.value + sum2.value + sum3.value;
      } else {
        sum1.value = 0;
        sum2.value = 0;
        allSum.value = 0;
      }
    }
  } else if (selectedTypeOfTransaction.value === "Заказано1") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент")
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент")
      );
      if (
        (selected.value.start !== null && selected.value.start !== "") ||
        (selected.value.end !== null && selected.value.end !== "")
      ) {
        sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
        sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
        allSum.value = sum1.value + sum2.value;
      } else {
        allSum.value = 0;
      }
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент") &&
          row.dispatchPVZ === selectedPVZ.value
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент наличные" ||
            row.additionally === "Отказ клиент") &&
          row.dispatchPVZ === selectedPVZ.value
      );

      if (
        (selected.value.start !== null && selected.value.start !== "") ||
        (selected.value.end !== null && selected.value.end !== "")
      ) {
        sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
        sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
        allSum.value = sum1.value + sum2.value;
      } else {
        allSum.value = 0;
      }
    }
  } else if (selectedTypeOfTransaction.value === "Заказано2") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплачено онлайн" ||
            row.additionally === "Отказ клиент онлайн")
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплачено онлайн" ||
            row.additionally === "Отказ клиент онлайн")
      );
      if (
        (selected.value.start !== null && selected.value.start !== "") ||
        (selected.value.end !== null && selected.value.end !== "")
      ) {
        sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
        sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
        allSum.value = sum1.value + sum2.value;
      } else {
        allSum.value = 0;
      }
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплачено онлайн" ||
            row.additionally === "Отказ клиент онлайн") &&
          row.dispatchPVZ === selectedPVZ.value
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплачено онлайн" ||
            row.additionally === "Отказ клиент онлайн") &&
          row.dispatchPVZ === selectedPVZ.value
      );

      if (
        (selected.value.start !== null && selected.value.start !== "") ||
        (selected.value.end !== null && selected.value.end !== "")
      ) {
        sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
        sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
        allSum.value = sum1.value + sum2.value;
      } else {
        allSum.value = 0;
      }
    }
  } else if (selectedTypeOfTransaction.value === "Доход PPVZ") {
    if (selectedPVZ.value === "Все ППВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          row.additionally !== null &&
          user.value.PVZ.includes(row.dispatchPVZ)
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          row.additionally !== null &&
          user.value.PVZ.includes(row.dispatchPVZ)
      );

      let sumOfPVZ = rows.value
        ?.filter(
          (row) =>
            row.received !== null &&
            row.recipient === "Нет" &&
            user.value.PVZ.includes(row.pvz)
        )
        .reduce((acc, value) => acc + +value.sum, 0);

      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
      allSum.value = sum1.value + sum2.value - sumOfPVZ;
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          row.additionally !== null &&
          row.dispatchPVZ === selectedPVZ.value
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!selected.value.start ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!selected.value.end ||
            new Date(row.issued) <= new Date(newEndDate)) &&
          row.additionally !== null &&
          row.dispatchPVZ === selectedPVZ.value
      );

      let sumOfPVZ = rows.value
        ?.filter(
          (row) =>
            row.received !== null &&
            row.recipient === "Нет" &&
            row.pvz === selectedPVZ.value
        )
        .reduce((acc, value) => acc + +value.sum, 0);

      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
      allSum.value = sum1.value + sum2.value - sumOfPVZ;
    }
  }
}

function getProfitRowsSum() {
  let newStartingDate = new Date(selected.value.start);
  newStartingDate.setHours(0);
  newStartingDate.setMinutes(0);
  newStartingDate.setSeconds(0);
  newStartingDate.setMilliseconds(0);

  let newEndDate = new Date(selected.value.end);
  newEndDate.setHours(23);
  newEndDate.setMinutes(59);
  newEndDate.setSeconds(59);
  newEndDate.setMilliseconds(0);

  if (selectedPVZ.value === "Все ППВЗ") {
    copyArrayOurRansom.value = ourRansomRows.value?.filter(
      (row) =>
        row.issued !== null &&
        (!selected.value.start ||
          new Date(row.issued) >= new Date(newStartingDate)) &&
        (!selected.value.end || new Date(row.issued) <= new Date(newEndDate)) &&
        row.additionally !== null &&
        user.value.PVZ.includes(row.dispatchPVZ)
    );

    copyArrayClientRansom.value = clientRansomRows.value?.filter(
      (row) =>
        row.issued !== null &&
        (!selected.value.start ||
          new Date(row.issued) >= new Date(newStartingDate)) &&
        (!selected.value.end || new Date(row.issued) <= new Date(newEndDate)) &&
        row.additionally !== null &&
        user.value.PVZ.includes(row.dispatchPVZ)
    );

    let sumOfPVZ = rowsProfit.value
      ?.filter(
        (row) =>
          row.received !== null &&
          (row.recipient === "Владимирова Инна" ||
            row.recipient === "Динис Ольга" ||
            row.recipient === "Киризлеева Марина" ||
            row.recipient === "Смирнов Валерий")
      )
      .reduce((acc, value) => acc + +value.sum, 0);

    sum1.value = reduceArrayProfit(copyArrayOurRansom.value, "OurRansom");
    sum2.value = reduceArrayProfit(copyArrayClientRansom.value, "ClientRansom");
    allSumProfit.value = sum1.value + sum2.value - sumOfPVZ;
  } else {
    copyArrayOurRansom.value = ourRansomRows.value?.filter(
      (row) =>
        row.issued !== null &&
        (!selected.value.start ||
          new Date(row.issued) >= new Date(newStartingDate)) &&
        (!selected.value.end || new Date(row.issued) <= new Date(newEndDate)) &&
        row.additionally !== null &&
        row.dispatchPVZ === selectedPVZ.value
    );

    copyArrayClientRansom.value = clientRansomRows.value?.filter(
      (row) =>
        row.issued !== null &&
        (!selected.value.start ||
          new Date(row.issued) >= new Date(newStartingDate)) &&
        (!selected.value.end || new Date(row.issued) <= new Date(newEndDate)) &&
        row.additionally !== null &&
        row.dispatchPVZ === selectedPVZ.value
    );

    let sumOfPVZ = rowsProfit.value
      ?.filter(
        (row) =>
          row.received !== null &&
          (row.recipient === "Владимирова Инна" ||
            row.recipient === "Динис Ольга" ||
            row.recipient === "Киризлеева Марина" ||
            row.recipient === "Смирнов Валерий") &&
          row.pvz === selectedPVZ.value
      )
      .reduce((acc, value) => acc + +value.sum, 0);

    sum1.value = reduceArrayProfit(copyArrayOurRansom.value, "OurRansom");
    sum2.value = reduceArrayProfit(copyArrayClientRansom.value, "ClientRansom");
    allSumProfit.value = sum1.value + sum2.value - sumOfPVZ;

    if (selectedPVZ.value === "ППВЗ_5") {
      allSumProfit.value += 9413;
    } else if (selectedPVZ.value === "ПВЗ_1") {
      allSumProfit.value += 2125;
      allSumProfit.value += 15000;
      allSumProfit.value += 2367;
    }
  }
}

function reduceArrayProfitManager(array: any[], flag: string): number {
  let totalProfit = 0;

  const shouldRound = (value: any) => {
    const createdDate = new Date(value.created_at);
    const referenceDate = new Date("2024-06-05T00:00:01");
    return createdDate > referenceDate;
  };

  const roundOrCeil = (num: number) => {
    const lastDigit = num % 10;
    return lastDigit >= 5
      ? Math.ceil(num / 10) * 10
      : Math.floor(num / 10) * 10;
  };

  array.forEach((row: any) => {
    if (
      row.additionally !== "Отказ брак" &&
      row.additionally !== "Отказ подмена"
    ) {
      const roundFunction = shouldRound(row) ? roundOrCeil : Math.ceil;
      switch (flag) {
        case "OurRansom":
          totalProfit += roundFunction(row.amountFromClient1) * 0.005;
          break;
        case "ClientRansom":
          totalProfit += row.amountFromClient2 * 0.005;
          break;
        default:
          totalProfit += row.amountFromClient3 * 0.005;
          break;
      }
    }
  });

  return totalProfit;
}

function getProfitManagerRowsSum() {
  let newStartingDate = new Date(selected.value.start);
  newStartingDate.setHours(0);
  newStartingDate.setMinutes(0);
  newStartingDate.setSeconds(0);
  newStartingDate.setMilliseconds(0);

  let newEndDate = new Date(selected.value.end);
  newEndDate.setHours(23);
  newEndDate.setMinutes(59);
  newEndDate.setSeconds(59);
  newEndDate.setMilliseconds(0);

  if (selectedPVZ.value === "Все ППВЗ") {
    copyArrayOurRansom.value = ourRansomRows.value?.filter(
      (row) =>
        row.issued !== null &&
        (!selected.value.start ||
          new Date(row.issued) >= new Date(newStartingDate)) &&
        (!selected.value.end || new Date(row.issued) <= new Date(newEndDate)) &&
        row.additionally !== null &&
        user.value.PVZ.includes(row.dispatchPVZ)
    );

    copyArrayClientRansom.value = clientRansomRows.value?.filter(
      (row) =>
        row.issued !== null &&
        (!selected.value.start ||
          new Date(row.issued) >= new Date(newStartingDate)) &&
        (!selected.value.end || new Date(row.issued) <= new Date(newEndDate)) &&
        row.additionally !== null &&
        user.value.PVZ.includes(row.dispatchPVZ)
    );

    let sumOfPVZ = rowsProfitManager.value
      ?.filter((row) => row.received !== null && row.recipient === "Нет")
      .reduce((acc, value) => acc + +value.sum, 0);

    sum1.value = reduceArrayProfitManager(
      copyArrayOurRansom.value,
      "OurRansom"
    );
    sum2.value = reduceArrayProfitManager(
      copyArrayClientRansom.value,
      "ClientRansom"
    );
    allSumProfitManager.value = sum1.value + sum2.value - sumOfPVZ;
  } else {
    copyArrayOurRansom.value = ourRansomRows.value?.filter(
      (row) =>
        row.issued !== null &&
        (!selected.value.start ||
          new Date(row.issued) >= new Date(newStartingDate)) &&
        (!selected.value.end || new Date(row.issued) <= new Date(newEndDate)) &&
        row.additionally !== null &&
        row.dispatchPVZ === selectedPVZ.value
    );

    copyArrayClientRansom.value = clientRansomRows.value?.filter(
      (row) =>
        row.issued !== null &&
        (!selected.value.start ||
          new Date(row.issued) >= new Date(newStartingDate)) &&
        (!selected.value.end || new Date(row.issued) <= new Date(newEndDate)) &&
        row.additionally !== null &&
        row.dispatchPVZ === selectedPVZ.value
    );

    let sumOfPVZ = rowsProfitManager.value
      ?.filter((row) => row.received !== null && row.recipient === "Нет")
      .reduce((acc, value) => acc + +value.sum, 0);

    sum1.value = reduceArrayProfitManager(
      copyArrayOurRansom.value,
      "OurRansom"
    );
    sum2.value = reduceArrayProfitManager(
      copyArrayClientRansom.value,
      "ClientRansom"
    );
    allSumProfitManager.value = sum1.value + sum2.value - sumOfPVZ;
  }
}

function formatNumber(number: number) {
  let numberString = number.toString();

  if (numberString.length <= 3) {
    return numberString;
  }

  let formattedString = "";
  let reminder = numberString.length % 3;

  if (reminder !== 0) {
    formattedString += numberString.slice(0, reminder) + " ";
  }

  for (let i = reminder; i < numberString.length; i += 3) {
    formattedString += numberString.slice(i, i + 3) + " ";
  }

  return formattedString.slice(0, -1);
}

watch(
  [selectedPVZ, selectedTypeOfTransaction, selected],
  getProfitManagerRowsSum
);
watch(
  [selectedPVZ, selectedTypeOfTransaction, selected, selected],
  getProfitRowsSum
);
watch([selectedPVZ, selectedTypeOfTransaction, selected, selected], getAllSum);

function clearFields() {
  selectedPVZ.value = "Все ПВЗ";

  if (user.value.username === "Мешков" || user.value.username === "Шведова") {
    selectedPVZ.value = "Все ПВЗ (Город)";
  }

  selectedTypeOfTransaction.value = "Баланс наличные";
  selected.value = {
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  };
  getAllSum();
}

let rowData = ref({} as IBalance);
let isOpen = ref(false);
let isOpenModalProfit = ref(false);
let isOpenModalProfitManager = ref(false);
let isOpenModalOnline = ref(false);
let isOpenModalDelivery = ref(false);

function openModal(row: IBalance) {
  isOpen.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    rowData.value.issued = rowData.value.issued
      ? storeUsers.getISODateTime(rowData.value.issued)
      : null;
    rowData.value.received = rowData.value.received
      ? storeUsers.getISODateTime(rowData.value.received)
      : null;
  } else {
    rowData.value = {} as IBalance;
  }
}

function openModalProfitRow(row: IBalance) {
  isOpenModalProfit.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    rowData.value.issued = rowData.value.issued
      ? storeUsers.getISODateTime(rowData.value.issued)
      : null;
    rowData.value.received = rowData.value.received
      ? storeUsers.getISODateTime(rowData.value.received)
      : null;
  } else {
    rowData.value = {} as IBalance;
    rowData.value.createdUser = user.value.username;
    rowData.value.pvz = selectedPVZ.value;
    rowData.value.notation = "Вывод дохода";
    if (user.value.username === "ППВЗ_5") {
      rowData.value.recipient = "Владимирова Инна";
    } else if (user.value.username === "ПВЗ_1") {
      rowData.value.recipient = "Киризлеева Марина";
    } else if (user.value.username === "ППВЗ_7") {
      rowData.value.recipient = "Смирнов Валерий";
    }
  }
}

function openModalProfitRowManager(row: IBalance) {
  isOpenModalProfitManager.value = true;
  rowData.value.createdUser = user.value.username;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    rowData.value.issued = rowData.value.issued
      ? storeUsers.getISODateTime(rowData.value.issued)
      : null;
    rowData.value.received = rowData.value.received
      ? storeUsers.getISODateTime(rowData.value.received)
      : null;
  } else {
    rowData.value = {} as IBalance;
  }
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IBalance;
}

function openModalOnline(row: IBalanceOnline) {
  isOpenModalOnline.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
  } else {
    rowData.value = {} as IBalance;
  }
}

function closeModalOnline() {
  isOpenModalOnline.value = false;
  rowData.value = {} as IBalance;
}

function openModalDelivery(row: IBalanceDelivery) {
  isOpenModalDelivery.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
  } else {
    rowData.value = {} as IBalance;
  }
}

function closeModalDelivery() {
  isOpenModalDelivery.value = false;
  rowData.value = {} as IBalance;
}

function closeModalProfitRow() {
  isOpenModalProfit.value = false;
  rowData.value = {} as IBalance;
}

function closeModalProfitRowManager() {
  isOpenModalProfitManager.value = false;
  rowData.value = {} as IBalance;
}

async function createRow() {
  isLoading.value = true;
  if (+rowData.value.sum > Math.ceil(allSum.value)) {
    toast.error("Сумма заявки больше баланса!");
  } else {
    await storeBalance.createBalanceRow(rowData.value, user.value.username);
    rows.value = await storeBalance.getBalanceRows();
    rowsWithProfitRows.value = [
      ...rows.value,
      ...rowsProfit.value,
      ...rowsProfitManager.value,
    ];
    closeModal();
    getAllSum();
    if (
      user.value.role === "PVZ" ||
      user.value.role === "COURIER" ||
      user.value.role === "PPVZ"
    ) {
      selectedPVZ.value = user.value.visiblePVZ;
      rows.value = rows.value?.filter(
        (row) =>
          row.pvz === user.value.visiblePVZ ||
          user.value.PVZ.includes(row.recipient)
      );
    } else if (user.value.role === "RMANAGER") {
      selectedPVZ.value = "Все ППВЗ";
      rows.value = rows.value?.filter(
        (row) =>
          user.value.PVZ.includes(row.pvz) ||
          user.value.PVZ.includes(row.recipient)
      );
    }
  }
  isLoading.value = false;
}

async function createOnlineRow() {
  isLoading.value = true;
  await storeBalance.createBalanceOnlineRow(rowData.value);
  rowsOnline.value = await storeBalance.getBalanceOnlineRows();
  closeModalOnline();
  getAllSum();
  isLoading.value = false;
}

async function createDeliveryRow() {
  isLoading.value = true;
  await storeBalance.createBalanceDeliveryRow(rowData.value);
  rowsDelivery.value = await storeBalance.getBalanceDeliveryRows();
  closeModalDelivery();
  getAllSum();
  isLoading.value = false;
}

async function createProfitRow() {
  if (+rowData.value.sum > Math.ceil(allSumProfit.value)) {
    toast.error("Вы не можете вывести такую сумму!");
  } else {
    isLoading.value = true;
    rowData.value.reminder = Math.ceil(allSumProfit.value) - +rowData.value.sum;
    await storeBalance.createBalanceProfitRow(rowData.value);
    rowsProfit.value = await storeBalance.getBalanceProfitRows();
    closeModalProfitRow();
    getAllSum();
    getProfitRowsSum();
    isLoading.value = false;
  }
}

async function createProfitManagerRow() {
  if (+rowData.value.sum > Math.ceil(allSumProfitManager.value)) {
    toast.error("Вы не можете вывести такую сумму!");
  } else {
    isLoading.value = true;
    rowData.value.createdUser = user.value.username;
    await storeBalance.createBalanceProfitManagerRow(rowData.value);
    rowsProfitManager.value = await storeBalance.getBalanceProfitManagerRows();
    closeModalProfitRowManager();
    getProfitManagerRowsSum();
    isLoading.value = false;
  }
}

async function updateDeliveryProfitRow(obj: any) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите изменить статус?");
  if (answer)
    await storeBalance.updateDeliveryProfitStatus(
      obj.row,
      obj.flag,
      user.value.username
    );
  if (obj.flag === "received") {
    await storeAdvanceReport.createAdvanceReport(
      {
        date: new Date(),
        PVZ: selectedPVZ.value,
        expenditure: obj.row.sum,
        typeOfExpenditure: "Оплата ФОТ",
        company: "Darom.pro",
        createdUser: user.value.username,
        type: "Нал",
      },
      user.value.username
    );
  }
  rowsProfit.value = await storeBalance.getBalanceProfitRows();
  getAllSum();
  getProfitRowsSum();
  getProfitManagerRowsSum();
  if (
    user.value.role === "PVZ" ||
    user.value.role === "COURIER" ||
    user.value.role === "PPVZ"
  ) {
    selectedPVZ.value = user.value.visiblePVZ;
    rows.value = rows.value?.filter(
      (row) =>
        row.pvz === user.value.visiblePVZ ||
        user.value.PVZ.includes(row.recipient)
    );
  } else if (user.value.role === "RMANAGER") {
    selectedPVZ.value = "Все ППВЗ";
    rows.value = rows.value?.filter(
      (row) =>
        user.value.PVZ.includes(row.pvz) ||
        user.value.PVZ.includes(row.recipient)
    );
  }
  isLoading.value = false;
}

async function updateDeliveryProfitManagerStatus(obj: any) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите изменить статус?");
  if (answer)
    await storeBalance.updateDeliveryProfitManagerStatus(
      obj.row,
      obj.flag,
      user.value.username
    );
  if (obj.flag === "received") {
    await storeAdvanceReport.createAdvanceReport(
      {
        date: new Date(),
        PVZ: "Офис",
        expenditure: obj.row.sum,
        typeOfExpenditure: "Оплата ФОТ",
        company: "Darom.pro",
        createdUser: user.value.username,
        type: "Нал",
      },
      user.value.username
    );
  }
  rowsProfitManager.value = await storeBalance.getBalanceProfitManagerRows();
  getAllSum();
  getProfitRowsSum();
  getProfitManagerRowsSum();
  if (
    user.value.role === "PVZ" ||
    user.value.role === "COURIER" ||
    user.value.role === "PPVZ"
  ) {
    selectedPVZ.value = user.value.visiblePVZ;
    rows.value = rows.value?.filter(
      (row) =>
        row.pvz === user.value.visiblePVZ ||
        user.value.PVZ.includes(row.recipient)
    );
  } else if (user.value.role === "RMANAGER") {
    selectedPVZ.value = "Все ППВЗ";
    rows.value = rows.value?.filter(
      (row) =>
        user.value.PVZ.includes(row.pvz) ||
        user.value.PVZ.includes(row.recipient)
    );
  }
  isLoading.value = false;
}

async function updateDeliveryRow(obj: any) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите изменить статус?");
  if (answer) {
    if (rowsProfit.value?.find((row) => obj.row.id === row.id)) {
      await storeBalance.updateDeliveryProfitStatus(
        obj.row,
        obj.flag,
        user.value.username
      );
      if (obj.flag === "received") {
        await storeAdvanceReport.createAdvanceReport(
          {
            date: new Date(),
            PVZ: obj.row.pvz,
            expenditure: obj.row.sum,
            typeOfExpenditure: "Оплата ФОТ",
            company: "Darom.pro",
            createdUser: user.value.username,
            type: "Нал",
          },
          user.value.username
        );
      }
      rowsProfit.value = await storeBalance.getBalanceProfitRows();
      rowsWithProfitRows.value = [
        ...rows.value,
        ...rowsProfit.value,
        ...rowsProfitManager.value,
      ];
    } else if (rowsProfitManager.value?.find((row) => obj.row.id === row.id)) {
      await storeBalance.updateDeliveryProfitManagerStatus(
        obj.row,
        obj.flag,
        user.value.username
      );
      if (obj.flag === "received") {
        await storeAdvanceReport.createAdvanceReport(
          {
            date: new Date(),
            PVZ: "Офис",
            expenditure: obj.row.sum,
            typeOfExpenditure: "Оплата ФОТ",
            company: "Darom.pro",
            createdUser: user.value.username,
            type: "Нал",
          },
          user.value.username
        );
      }
      rowsProfitManager.value =
        await storeBalance.getBalanceProfitManagerRows();
      rowsWithProfitRows.value = [
        ...rows.value,
        ...rowsProfit.value,
        ...rowsProfitManager.value,
      ];
    } else {
      await storeBalance.updateDeliveryStatus(
        obj.row,
        obj.flag,
        user.value.username
      );
      rows.value = await storeBalance.getBalanceRows();
      getAllSum();
      getProfitRowsSum();
      getProfitManagerRowsSum();
    }
  }

  if (
    user.value.role === "PVZ" ||
    user.value.role === "COURIER" ||
    user.value.role === "PPVZ"
  ) {
    selectedPVZ.value = user.value.visiblePVZ;
    rows.value = rows.value?.filter(
      (row) =>
        row.pvz === user.value.visiblePVZ ||
        user.value.PVZ.includes(row.recipient)
    );
  } else if (user.value.role === "RMANAGER") {
    selectedPVZ.value = "Все ППВЗ";
    rows.value = rows.value?.filter(
      (row) =>
        user.value.PVZ.includes(row.pvz) ||
        user.value.PVZ.includes(row.recipient)
    );
  }

  isLoading.value = false;
}

// let sumOfPVZ5 = 0;
//   let sumOfPVZ6 = 0;
//   if (user.value.role === "RMANAGER") {
//     let arrayOurRansom = ourRansomRows.value?.filter(
//       (row) =>
//         row.issued !== null &&
//         row.additionally !== null &&
//         user.value.PVZ.includes(row.dispatchPVZ)
//     );

//     let arrayClientRansom = clientRansomRows.value?.filter(
//       (row) =>
//         row.issued !== null &&
//         row.additionally !== null &&
//         user.value.PVZ.includes(row.dispatchPVZ)
//     );

//     sumOfPVZ5 = Math.ceil(reduceArrayProfit(arrayOurRansom, "OurRansom"));
//     sumOfPVZ6 = Math.ceil(reduceArrayProfit(arrayClientRansom, "ClientRansom"));
//   }

async function updateRow() {
  isLoading.value = true;
  await storeBalance.updateBalanceRow(rowData.value);
  rows.value = await storeBalance.getBalanceRows();
  rowsWithProfitRows.value = [...rows.value, ...rowsProfit.value];
  closeModal();
  getAllSum();
  if (
    user.value.role === "PVZ" ||
    user.value.role === "COURIER" ||
    user.value.role === "PPVZ"
  ) {
    selectedPVZ.value = user.value.visiblePVZ;
    rows.value = rows.value?.filter(
      (row) =>
        row.pvz === user.value.visiblePVZ ||
        user.value.PVZ.includes(row.recipient)
    );
  } else if (user.value.role === "RMANAGER") {
    selectedPVZ.value = "Все ППВЗ";
    rows.value = rows.value?.filter(
      (row) =>
        user.value.PVZ.includes(row.pvz) ||
        user.value.PVZ.includes(row.recipient)
    );
  }
  isLoading.value = false;
}

async function deleteRow(id: number) {
  let answer = confirm("Вы точно хотите удалить строку?");
  if (answer) {
    isLoading.value = true;
    await storeBalance.deleteRow(id);
    rows.value = await storeBalance.getBalanceRows();
    rowsWithProfitRows.value = [...rows.value, ...rowsProfit.value];
    getAllSum();
    isLoading.value = false;
  }
}

let pvzDataOriginally = [
  "Все ПВЗ",
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
  "НаДом",
];

const options = ["Нет", "Рейзвих", "Шведова", "Директор", "Косой", "Мешков"];
</script>

<template>
  <Head>
    <Title>Баланс</Title>
  </Head>

  <div v-if="!isLoading">
    <div
      v-if="
        token &&
        (user.role === 'ADMIN' ||
          user.username === 'Шведова' ||
          user.username === 'Мешков')
      "
    >
      <NuxtLayout name="admin">
        <div class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5">
          <div v-auto-animate>
            <div class="flex items-center gap-3 max-xl:mt-0">
              <UButton
                color="orange"
                variant="solid"
                class="font-semibold duration-200"
                icon="material-symbols:filter-list-rounded"
                @click="showFilters = !showFilters"
              >
                Фильтры
              </UButton>
            </div>

            <div
              v-if="showFilters"
              class="border-2 bg-white border-secondary-color border-dashed max-sm:px-3 max-sm:py-1 py-3 px-10 shadow-2xl mt-3"
            >
              <div class="flex items-center flex-col w-full gap-x-5">
                <div class="w-full">
                  <div
                    class="flex items-start space-y-2 flex-col mt-5 text-center"
                  >
                    <h1>Показать для ПВЗ</h1>
                    <select
                      v-if="
                        user.role !== 'PVZ' &&
                        user.role !== 'COURIER' &&
                        user.role !== 'PPVZ' &&
                        user.role !== 'RMANAGER' &&
                        user.username !== 'Мешков' &&
                        user.username !== 'Шведова'
                      "
                      class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-transparent text-gray-900 dark:text-white ring-1 ring-inset ring-orange-500 dark:ring-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 pe-9"
                      v-model="selectedPVZ"
                    >
                      <option value="Все ПВЗ" selected>Все ПВЗ</option>
                      <option v-for="pvzValue in pvz">
                        {{ pvzValue.name }}
                      </option>
                    </select>
                    <select
                      v-else-if="user.role === 'RMANAGER'"
                      class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-transparent text-gray-900 dark:text-white ring-1 ring-inset ring-orange-500 dark:ring-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 pe-9"
                      v-model="selectedPVZ"
                    >
                      <option value="Все ППВЗ" selected>Все ППВЗ</option>
                      <option v-for="pvzValue in user.PVZ">
                        {{ pvzValue }}
                      </option>
                    </select>
                    <select
                      v-else-if="
                        user.username === 'Мешков' ||
                        user.username === 'Шведова'
                      "
                      class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-transparent text-gray-900 dark:text-white ring-1 ring-inset ring-orange-500 dark:ring-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 pe-9"
                      v-model="selectedPVZ"
                    >
                      <option value="Все ПВЗ (Город)" selected>Все ПВЗ</option>
                      <option v-for="pvzValue in user.PVZ">
                        {{ pvzValue }}
                      </option>
                    </select>
                    <select
                      v-else
                      class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-transparent text-gray-900 dark:text-white ring-1 ring-inset ring-orange-500 dark:ring-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 pe-9"
                      v-model="selectedPVZ"
                    >
                      <option v-for="pvzValue in user.PVZ">
                        {{ pvzValue }}
                      </option>
                    </select>
                  </div>
                  <div
                    class="flex items-start space-y-2 flex-col mt-5 text-center"
                  >
                    <h1>Тип транзакции</h1>
                    <select
                      class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-transparent text-gray-900 dark:text-white ring-1 ring-inset ring-orange-500 dark:ring-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 pe-9"
                      v-model="selectedTypeOfTransaction"
                    >
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Доход"
                      >
                        Доход DP (продажа)
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Доставка"
                      >
                        Доход D&S
                      </option>
                      <option value="Баланс наличные">
                        Баланс наличные DP (фактический)
                      </option>
                      <option
                        v-if="
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ'
                        "
                        value="Баланс безнал"
                      >
                        Баланс онлайн DP
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Постоплата WB"
                      >
                        Сумма товаров в заказе с постоплатой WB (до выдачи)
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Заказано"
                      >
                        Сумма товаров в заказе (до выдачи)
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Заказано1"
                      >
                        Сумма проданных товаров наличные (Выдано сумма)
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Заказано2"
                      >
                        Сумма проданных товаров онлайн
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Заказано3"
                      >
                        Сумма заказанных товаров (все записи)
                      </option>
                    </select>
                  </div>
                </div>

                <div
                  v-auto-animate
                  class="my-10 flex items-center justify-center gap-5"
                >
                  <UPopover
                    class="block max-sm:hidden"
                    :popper="{ placement: 'bottom' }"
                  >
                    <UButton
                      type="button"
                      icon="i-heroicons-calendar-days-20-solid"
                      color="orange"
                    >
                      {{ format(selected.start, "dd MMM yyy", { locale: ru }) }}
                      —
                      {{ format(selected.end, "dd MMM yyy", { locale: ru }) }}
                    </UButton>

                    <template #panel="{ close }">
                      <div
                        class="flex items-center flex-col sm:divide-x divide-gray-200 dark:divide-gray-800"
                      >
                        <DatePickerSingleMonth
                          v-model="selected"
                          @close="close"
                        />

                        <div class="grid grid-cols-2">
                          <UButton
                            v-for="(range, index) in ranges"
                            :key="index"
                            :label="range.label"
                            color="white"
                            variant="ghost"
                            class="rounded-none px-2"
                            :class="[
                              isRangeSelected(range.duration)
                                ? 'bg-gray-100 dark:bg-gray-800'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                            ]"
                            truncate
                            @click="selectRange(range.duration)"
                          />
                        </div>
                      </div>
                    </template>
                  </UPopover>

                  <UPopover
                    class="hidden max-sm:block"
                    :overlay="true"
                    :popper="{ placement: 'bottom' }"
                  >
                    <UButton
                      type="button"
                      icon="i-heroicons-calendar-days-20-solid"
                      color="orange"
                    >
                      {{ format(selected.start, "dd MMM yyy", { locale: ru }) }}
                      —
                      {{ format(selected.end, "dd MMM yyy", { locale: ru }) }}
                    </UButton>

                    <template #panel="{ close }">
                      <div
                        class="flex items-center flex-col sm:divide-x divide-gray-200 dark:divide-gray-800"
                      >
                        <DatePickerSingleMonth
                          v-model="selected"
                          @close="close"
                        />

                        <div class="grid grid-cols-2 px-2 py-2">
                          <UButton
                            v-for="(range, index) in ranges"
                            :key="index"
                            :label="range.label"
                            color="white"
                            variant="ghost"
                            class="rounded-none"
                            :class="[
                              isRangeSelected(range.duration)
                                ? 'bg-gray-100 dark:bg-gray-800'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                            ]"
                            truncate
                            @click="selectRange(range.duration)"
                          />
                        </div>
                      </div>
                    </template>
                  </UPopover>
                </div>
              </div>
              <div class="flex justify-end mb-3">
                <UIActionButton @click="clearFields"
                  >Очистить фильтры</UIActionButton
                >
              </div>
            </div>

            <div
              v-if="
                selectedTypeOfTransaction !== 'Доставка' &&
                selectedTypeOfTransaction !== 'Баланс безнал'
              "
            >
              <div class="text-center text-2xl mt-10">
                <h1>Итого наличных</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(allSum)) }} ₽
                </h1>
              </div>
            </div>
            <div v-else-if="selectedTypeOfTransaction === 'Баланс безнал'">
              <div class="text-center text-2xl mt-10">
                <h1>Итого онлайн</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(allSum)) }} ₽
                </h1>
              </div>
            </div>
            <div
              v-else
              class="flex items-center justify-center max-md:flex-col gap-24 max-md:gap-0"
            >
              <div class="text-center text-2xl mt-10">
                <h1>Доход 'Доставка'</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(sum1)) }} ₽
                </h1>
              </div>
              <div class="text-center text-2xl mt-10">
                <h1>Доход 'Сортировка'</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(sum2)) }} ₽
                </h1>
              </div>
              <div class="text-center text-2xl mt-10">
                <h1>Доход Доставка&Сортировка</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(allSum)) }} ₽
                </h1>
              </div>
            </div>
          </div>

          <UIMainButton
            v-if="
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR' ||
              user.role === 'RMANAGER'
            "
            class="mt-24"
            @click="openModal"
          >
            Заявка на вывод средств наличные</UIMainButton
          >

          <BalanceTable
            v-if="user.username !== 'Мешков' && user.username !== 'Шведова'"
            @update-delivery-row="updateDeliveryRow"
            @delete-row="deleteRow"
            :rows="rowsWithProfitRows"
            :user="user"
            @open-modal="openModal"
          />

          <BalanceTable
            v-if="user.username === 'Мешков' || user.username === 'Шведова'"
            @update-delivery-row="updateDeliveryRow"
            :rows="
              rowsWithProfitRows.filter((row: IBalance) =>
                user.PVZ.includes(row.pvz)
              )
            "
            :user="user"
            @open-modal="openModal"
          />

          <div
            v-if="
              (user.username === 'Шведова' ||
                user.username === 'Мешков' ||
                user.username === 'Директор' ||
                user.username === 'Власенкова') &&
              selectedPVZ &&
              (selectedPVZ.includes('ППВЗ') || selectedPVZ === 'ПВЗ_1')
            "
          >
            <div class="text-center text-2xl mt-24">
              <h1>Доход ППВЗ</h1>
              <h1 class="font-bold text-secondary-color text-4xl mt-3">
                {{ formatNumber(Math.ceil(allSumProfit)) }} ₽
              </h1>
            </div>
          </div>

          <BalanceTableProfit
            v-if="
              (user.username === 'Шведова' ||
                user.username === 'Мешков' ||
                user.username === 'Директор' ||
                user.username === 'Власенкова') &&
              selectedPVZ &&
              (selectedPVZ.includes('ППВЗ') || selectedPVZ === 'ПВЗ_1')
            "
            @update-delivery-row="updateDeliveryProfitRow"
            :rows="rowsProfit?.filter((row) => row.pvz === selectedPVZ)"
            :user="user"
            @open-modal="openModalProfitRow"
          />

          <div class="mt-24" v-if="user.role === 'ADMIN'">
            <UIMainButton @click="openModalOnline">
              заявка на вывод средств онлайн</UIMainButton
            >
            <BalanceTableOnline :rows="rowsOnline" />
          </div>

          <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
            <template v-slot:icon-header>
              <Icon
                size="24"
                name="material-symbols-light:account-balance-wallet"
              />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение: <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой заявки</div>
            </template>
            <template v-slot:body>
              <div class="text-black">
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="dispatchPVZ1">ПВЗ</label>

                  <USelectMenu
                    v-if="
                      user.username !== 'Мешков' && user.username !== 'Шведова'
                    "
                    class="w-full"
                    v-model="rowData.pvz"
                    value-attribute="name"
                    option-attribute="name"
                    :options="pvz"
                  />

                  <USelectMenu
                    v-if="
                      user.username === 'Мешков' || user.username === 'Шведова'
                    "
                    :disabled="rowData.id > 0"
                    class="w-full"
                    v-model="rowData.pvz"
                    :options="user.PVZ"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="dispatchPVZ1">Получатель</label>
                  <USelectMenu
                    class="w-full"
                    v-model="rowData.recipient"
                    :options="options"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Сумма</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.sum"
                    type="text"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Примечание</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.notation"
                    type="text"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex items-center justify-center gap-3"
                v-if="rowData.id"
              >
                <UISaveModalButton @click="updateRow"
                  >Сохранить
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
              <div class="flex items-center justify-center gap-3" v-else>
                <UISaveModalButton @click="createRow"
                  >Создать
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>

          <UINewModalEdit
            v-show="isOpenModalOnline"
            @close-modal="closeModalOnline"
          >
            <template v-slot:icon-header>
              <Icon
                size="24"
                name="material-symbols-light:account-balance-wallet"
              />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение: <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой заявки</div>
            </template>
            <template v-slot:body>
              <div class="text-black">
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Сумма</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.sum"
                    :disabled="rowData.id > 0"
                    type="text"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex items-center justify-center gap-3"
                v-if="rowData.id"
              >
                <UISaveModalButton @click="updateRow"
                  >Сохранить
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
              <div class="flex items-center justify-center gap-3" v-else>
                <UISaveModalButton @click="createOnlineRow"
                  >Создать
                </UISaveModalButton>
                <UIExitModalButton @click="closeModalOnline"
                  >Отменить
                </UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>
        </div>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="user">
        <div class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5">
          <div v-auto-animate>
            <div class="flex items-center gap-3 max-xl:mt-0">
              <UButton
                color="orange"
                variant="solid"
                class="font-semibold duration-200"
                v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'"
                icon="material-symbols:filter-list-rounded"
                @click="showFilters = !showFilters"
              >
                Фильтры
              </UButton>
            </div>

            <div
              v-if="showFilters"
              class="border-2 bg-white border-secondary-color border-dashed max-sm:px-3 max-sm:py-1 py-3 px-10 shadow-2xl mt-3"
            >
              <div class="flex items-center flex-col w-full gap-x-5">
                <div class="w-full">
                  <div
                    class="flex items-start space-y-2 flex-col mt-5 text-center"
                  >
                    <h1>Показать для ПВЗ</h1>
                    <select
                      v-if="
                        user.role !== 'PVZ' &&
                        user.role !== 'COURIER' &&
                        user.role !== 'PPVZ' &&
                        user.role !== 'RMANAGER'
                      "
                      class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-transparent text-gray-900 dark:text-white ring-1 ring-inset ring-orange-500 dark:ring-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 pe-9"
                      v-model="selectedPVZ"
                    >
                      <option value="Все ПВЗ" selected>Все ПВЗ</option>
                      <option v-for="pvzValue in pvz">
                        {{ pvzValue.name }}
                      </option>
                    </select>
                    <select
                      v-else-if="user.role === 'RMANAGER'"
                      class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-transparent text-gray-900 dark:text-white ring-1 ring-inset ring-orange-500 dark:ring-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 pe-9"
                      v-model="selectedPVZ"
                    >
                      <option value="Все ППВЗ" selected>Все ППВЗ</option>
                      <option v-for="pvzValue in user.PVZ">
                        {{ pvzValue }}
                      </option>
                    </select>
                    <select
                      v-else
                      class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-transparent text-gray-900 dark:text-white ring-1 ring-inset ring-orange-500 dark:ring-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 pe-9"
                      v-model="selectedPVZ"
                    >
                      <option v-for="pvzValue in user.PVZ">
                        {{ pvzValue }}
                      </option>
                    </select>
                  </div>
                  <div
                    class="flex items-start space-y-2 flex-col mt-5 text-center"
                  >
                    <h1>Тип транзакции</h1>
                    <select
                      class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-transparent text-gray-900 dark:text-white ring-1 ring-inset ring-orange-500 dark:ring-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 pe-9"
                      v-model="selectedTypeOfTransaction"
                    >
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Доход"
                      >
                        Доход DP (продажа)
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Доставка"
                      >
                        Доход D&S
                      </option>
                      <option value="Баланс наличные">
                        Баланс наличные DP (фактический)
                      </option>
                      <option
                        v-if="
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ'
                        "
                        value="Баланс безнал"
                      >
                        Баланс онлайн DP
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Постоплата WB"
                      >
                        Сумма товаров в заказе с постоплатой WB (до выдачи, фактический)
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Заказано"
                      >
                        Сумма товаров в заказе (до выдачи, фактический)
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Заказано1"
                      >
                        Сумма проданных товаров наличные (Выдано сумма)
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Заказано2"
                      >
                        Сумма проданных товаров онлайн
                      </option>
                      <option
                        v-if="
                          user.role !== 'ADMINISTRATOR' &&
                          user.role !== 'PVZ' &&
                          user.role !== 'COURIER' &&
                          user.role !== 'PPVZ' &&
                          user.role !== 'RMANAGER'
                        "
                        value="Заказано3"
                      >
                        Сумма заказанных товаров (все записи)
                      </option>
                    </select>
                  </div>
                </div>
                <div
                  v-auto-animate
                  class="my-10 flex items-center justify-center gap-5"
                >
                  <UPopover
                    class="block max-sm:hidden"
                    :popper="{ placement: 'bottom' }"
                  >
                    <UButton
                      type="button"
                      icon="i-heroicons-calendar-days-20-solid"
                      color="orange"
                    >
                      {{ format(selected.start, "dd MMM yyy", { locale: ru }) }}
                      —
                      {{ format(selected.end, "dd MMM yyy", { locale: ru }) }}
                    </UButton>

                    <template #panel="{ close }">
                      <div
                        class="flex items-center flex-col sm:divide-x divide-gray-200 dark:divide-gray-800"
                      >
                        <DatePickerSingleMonth
                          v-model="selected"
                          @close="close"
                        />

                        <div class="grid grid-cols-2">
                          <UButton
                            v-for="(range, index) in ranges"
                            :key="index"
                            :label="range.label"
                            color="white"
                            variant="ghost"
                            class="rounded-none px-2"
                            :class="[
                              isRangeSelected(range.duration)
                                ? 'bg-gray-100 dark:bg-gray-800'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                            ]"
                            truncate
                            @click="selectRange(range.duration)"
                          />
                        </div>
                      </div>
                    </template>
                  </UPopover>

                  <UPopover
                    class="hidden max-sm:block"
                    :overlay="true"
                    :popper="{ placement: 'bottom' }"
                  >
                    <UButton
                      type="button"
                      icon="i-heroicons-calendar-days-20-solid"
                      color="orange"
                    >
                      {{ format(selected.start, "dd MMM yyy", { locale: ru }) }}
                      —
                      {{ format(selected.end, "dd MMM yyy", { locale: ru }) }}
                    </UButton>

                    <template #panel="{ close }">
                      <div
                        class="flex items-center flex-col sm:divide-x divide-gray-200 dark:divide-gray-800"
                      >
                        <DatePickerSingleMonth
                          v-model="selected"
                          @close="close"
                        />

                        <div class="grid grid-cols-2 px-2 py-2">
                          <UButton
                            v-for="(range, index) in ranges"
                            :key="index"
                            :label="range.label"
                            color="white"
                            variant="ghost"
                            class="rounded-none"
                            :class="[
                              isRangeSelected(range.duration)
                                ? 'bg-gray-100 dark:bg-gray-800'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                            ]"
                            truncate
                            @click="selectRange(range.duration)"
                          />
                        </div>
                      </div>
                    </template>
                  </UPopover>
                </div>
              </div>
              <div class="flex justify-end mb-3">
                <UIActionButton @click="clearFields"
                  >Очистить фильтры</UIActionButton
                >
              </div>
            </div>

            <div
              v-if="
                selectedTypeOfTransaction !== 'Доставка' &&
                selectedTypeOfTransaction !== 'Баланс безнал'
              "
            >
              <div class="text-center text-2xl mt-10">
                <h1>Итого наличных</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(allSum)) }} ₽
                </h1>
              </div>
            </div>
            <div v-else-if="selectedTypeOfTransaction === 'Баланс безнал'">
              <div class="text-center text-2xl mt-10">
                <h1>Итого онлайн</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(allSum)) }} ₽
                </h1>
              </div>
            </div>
            <div
              v-else
              class="flex items-center justify-center max-md:flex-col gap-24 max-md:gap-0"
            >
              <div class="text-center text-2xl mt-10">
                <h1>Доход 'Доставка'</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(sum1)) }} ₽
                </h1>
              </div>
              <div class="text-center text-2xl mt-10">
                <h1>Доход 'Сортировка'</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(sum2)) }} ₽
                </h1>
              </div>
              <div class="text-center text-2xl mt-10">
                <h1>Доход Доставка&Сортировка</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(allSum)) }} ₽
                </h1>
              </div>
            </div>
          </div>

          <UIMainButton
            v-if="
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR' ||
              user.role === 'RMANAGER'
            "
            class="mt-24"
            @click="openModal"
          >
            Заявка на вывод средств наличные</UIMainButton
          >
          <BalanceTable
            v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'"
            @update-delivery-row="updateDeliveryRow"
            :rows="rows"
            :user="user"
            @open-modal="openModal"
          />

          <BalanceTable
            v-if="user.role === 'PVZ' || user.role === 'PPVZ'"
            @update-delivery-row="updateDeliveryRow"
            :rows="rows?.filter((row) => !row.received)"
            :user="user"
            @open-modal="openModal"
          />

          <div v-if="user.role === 'RMANAGER' || user.role === 'PPVZ'">
            <div class="text-center text-2xl mt-24">
              <h1>Доход ППВЗ</h1>
              <h1 class="font-bold text-secondary-color text-4xl mt-3">
                {{ formatNumber(Math.ceil(allSumProfit)) }} ₽
              </h1>
            </div>
          </div>

          <UIMainButton
            v-if="user.role === 'PPVZ'"
            class="mt-10"
            @click="openModalProfitRow"
            :disabled="+Math.ceil(allSumProfit) <= 0"
          >
            Заявка на вывод дохода наличные</UIMainButton
          >

          <BalanceTableProfit
            v-if="user.role === 'PPVZ'"
            @update-delivery-row="updateDeliveryProfitRow"
            :rows="rowsProfit?.filter((row) => row.pvz === user.visiblePVZ)"
            :user="user"
            @open-modal="openModalProfitRow"
          />

          <div v-if="user.role === 'RMANAGER'">
            <div class="text-center text-2xl mt-24">
              <h1>Доход Менеджера</h1>
              <h1 class="font-bold text-secondary-color text-4xl mt-3">
                {{ formatNumber(Math.ceil(allSumProfitManager)) }} ₽
              </h1>
            </div>
          </div>

          <UIMainButton
            v-if="user.role === 'RMANAGER'"
            class="mt-10"
            @click="openModalProfitRowManager"
            :disabled="+Math.ceil(allSumProfitManager) <= 0"
          >
            Заявка на вывод дохода наличные</UIMainButton
          >

          <BalanceTableProfitManager
            v-if="user.role === 'RMANAGER'"
            @update-delivery-row="updateDeliveryProfitManagerStatus"
            :rows="
              rowsProfitManager?.filter(
                (row) => row.createdUser === user.username
              )
            "
            :user="user"
            @open-modal="openModalProfitRow"
          />

          <div class="mt-24" v-if="user.role === 'ADMIN'">
            <UIMainButton @click="openModalOnline">
              заявка на вывод средств онлайн</UIMainButton
            >
            <BalanceTableOnline :rows="rowsOnline" />
          </div>

          <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
            <template v-slot:icon-header>
              <Icon
                size="24"
                name="material-symbols-light:account-balance-wallet"
              />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение: <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой заявки</div>
            </template>
            <template v-slot:body>
              <div class="text-black">
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="dispatchPVZ1">ПВЗ</label>
                  <USelectMenu
                    :disabled="rowData.id > 0"
                    class="w-full"
                    v-model="rowData.pvz"
                    value-attribute="name"
                    option-attribute="name"
                    :options="pvz"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="dispatchPVZ1">Получатель</label>
                  <USelectMenu
                    :disabled="rowData.id > 0"
                    class="w-full"
                    v-model="rowData.recipient"
                    :options="options"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Сумма</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.sum"
                    :disabled="rowData.id > 0"
                    type="text"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Примечание</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.notation"
                    type="text"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex items-center justify-center gap-3"
                v-if="rowData.id"
              >
                <UISaveModalButton @click="updateRow"
                  >Сохранить
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
              <div class="flex items-center justify-center gap-3" v-else>
                <UISaveModalButton @click="createRow"
                  >Создать
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>

          <UINewModalEdit
            v-show="isOpenModalProfitManager"
            @close-modal="closeModalProfitRowManager"
          >
            <template v-slot:icon-header>
              <Icon
                size="24"
                name="material-symbols-light:account-balance-wallet"
              />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение: <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой заявки</div>
            </template>
            <template v-slot:body>
              <div class="text-black">
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="dispatchPVZ1">ПВЗ</label>
                  <USelectMenu
                    :disabled="rowData.id > 0"
                    class="w-full"
                    v-model="rowData.pvz"
                    value-attribute="name"
                    option-attribute="name"
                    :options="pvz"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="dispatchPVZ1">Получатель</label>
                  <USelectMenu
                    :disabled="rowData.id > 0"
                    class="w-full"
                    v-model="rowData.recipient"
                    :options="options"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Сумма</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.sum"
                    :disabled="rowData.id > 0"
                    type="text"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Примечание</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.notation"
                    type="text"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex items-center justify-center gap-3"
                v-if="rowData.id"
              >
                <UISaveModalButton @click="updateRow"
                  >Сохранить
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
              <div class="flex items-center justify-center gap-3" v-else>
                <UISaveModalButton @click="createProfitManagerRow"
                  >Создать
                </UISaveModalButton>
                <UIExitModalButton @click="closeModalProfitRowManager"
                  >Отменить
                </UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>

          <UINewModalEdit
            v-show="isOpenModalProfit"
            @close-modal="closeModalProfitRow"
          >
            <template v-slot:icon-header>
              <Icon
                size="24"
                name="material-symbols-light:account-balance-wallet"
              />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение: <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой заявки</div>
            </template>
            <template v-slot:body>
              <div class="text-black">
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="dispatchPVZ1">ПВЗ</label>
                  <USelectMenu
                    :disabled="rowData.id > 0"
                    class="w-full"
                    v-model="rowData.pvz"
                    :options="user.PVZ"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="dispatchPVZ1">Получатель</label>
                  <select
                    :disabled="rowData.id > 0"
                    class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400 w-full"
                    v-model="rowData.recipient"
                  >
                    <option
                      v-if="user.username === 'ППВЗ_5'"
                      value="Владимирова Инна"
                    >
                      Владимирова Инна
                    </option>
                    <option
                      v-if="user.username === 'ПВЗ_1'"
                      value="Киризлеева Марина"
                    >
                      Киризлеева Марина
                    </option>
                    <option
                      v-if="user.username === 'ППВЗ_7'"
                      value="Смирнов Валерий"
                    >
                      Смирнов Валерий
                    </option>
                  </select>
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Сумма</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.sum"
                    :disabled="rowData.id > 0"
                    type="text"
                  />
                </div>

                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Примечание</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.notation"
                    type="text"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex items-center justify-center gap-3"
                v-if="rowData.id"
              >
                <UISaveModalButton @click="updateRow"
                  >Сохранить
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
              <div class="flex items-center justify-center gap-3" v-else>
                <UISaveModalButton @click="createProfitRow"
                  >Создать
                </UISaveModalButton>
                <UIExitModalButton @click="closeModalProfitRow"
                  >Отменить
                </UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>

          <UINewModalEdit
            v-show="isOpenModalOnline"
            @close-modal="closeModalOnline"
          >
            <template v-slot:icon-header>
              <Icon
                size="24"
                name="material-symbols-light:account-balance-wallet"
              />
            </template>
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение: <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой заявки</div>
            </template>
            <template v-slot:body>
              <div class="text-black">
                <div class="flex flex-col items-start text-left gap-2 mb-5">
                  <label for="name">Сумма</label>
                  <UInput
                    class="w-full"
                    v-model="rowData.sum"
                    :disabled="rowData.id > 0"
                    type="text"
                  />
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div
                class="flex items-center justify-center gap-3"
                v-if="rowData.id"
              >
                <UISaveModalButton @click="updateRow"
                  >Сохранить
                </UISaveModalButton>
                <UIExitModalButton @click="closeModal"
                  >Отменить
                </UIExitModalButton>
              </div>
              <div class="flex items-center justify-center gap-3" v-else>
                <UISaveModalButton @click="createOnlineRow"
                  >Создать
                </UISaveModalButton>
                <UIExitModalButton @click="closeModalOnline"
                  >Отменить
                </UIExitModalButton>
              </div>
            </template>
          </UINewModalEdit>
        </div>
      </NuxtLayout>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
