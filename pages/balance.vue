<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const storeUsers = useUsersStore();
const storePVZ = usePVZStore();
const storeRansom = useRansomStore();
const storeBalance = useBalanceStore();
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
let rowsDelivery = ref<Array<IBalanceDelivery>>();
let sumOfReject = ref<any>();

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  ourRansomRows.value = await storeRansom.getRansomRowsForBalance("OurRansom");
  clientRansomRows.value = await storeRansom.getRansomRowsForBalance(
    "ClientRansom"
  );
  deliveryRansomRows.value = await storeRansom.getRansomRowsForBalance(
    "Delivery"
  );
  sumOfReject.value = await storeRansom.getSumOfRejection();
  rows.value = await storeBalance.getBalanceRows();
  rowsOnline.value = await storeBalance.getBalanceOnlineRows();
  rowsDelivery.value = await storeBalance.getBalanceDeliveryRows();

  getAllSum();

  if (user.value.role === "PVZ" || user.value.role === "COURIER") {
    selectedPVZ.value = user.value.visiblePVZ;
    rows.value = rows.value?.filter(
      (row) =>
        row.pvz === user.value.visiblePVZ ||
        user.value.PVZ.includes(row.recipient)
    );
  }

  isLoading.value = false;

  pvz.value = await storePVZ.getPVZ();
});

onMounted(() => {
  if (!token) {
    router.push("/auth/login");
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
let showFilters = ref(false);

let selectedPVZ = ref("Все ПВЗ");
let selectedTypeOfTransaction = ref("Баланс наличные");

const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string | null>(null);

function calculateValue(curValue: any) {
  if (!curValue.prepayment) {
    return curValue.additionally !== "Отказ клиент"
      ? Math.ceil(curValue.amountFromClient1 / 10) * 10 -
          curValue.priceSite +
          curValue.deliveredKGT
      : sumOfReject.value.value;
  } else {
    return curValue.additionally !== "Отказ клиент"
      ? (curValue.priceSite * curValue.percentClient) / 100 +
          curValue.deliveredKGT
      : sumOfReject.value.value;
  }
}

function reduceArray(array: any, flag: string) {
  if (selectedTypeOfTransaction.value === "Доход") {
    if (flag === "OurRansom") {
      array = array.filter((row: any) => row.additionally !== "Отказ брак");
      return array.reduce(
        (ac: any, curValue: any) => ac + calculateValue(curValue),
        0
      );
    } else if (flag === "ClientRansom") {
      array = array.filter((row: any) => row.additionally !== "Отказ брак");
      return array.reduce((ac: any, curValue: any) => ac + curValue.profit2, 0);
    } else {
      array = array.filter((row: any) => row.additionally !== "Отказ брак");
      return array.reduce((ac: any, curValue: any) => ac + curValue.profit3, 0);
    }
  } else if (selectedTypeOfTransaction.value === "Заказано") {
    if (flag === "OurRansom") {
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.priceSite,
        0
      );
    }
  } else if (selectedTypeOfTransaction.value === "Баланс наличные") {
    if (flag === "OurRansom") {
      array = array.filter((row: any) => row.additionally !== "Отказ брак");
      return array.reduce(
        (ac: any, curValue: any) =>
          ac + Math.ceil(curValue.amountFromClient1 / 10) * 10,
        0
      );
    } else if (flag === "ClientRansom") {
      array = array.filter((row: any) => row.additionally !== "Отказ брак");
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.amountFromClient2,
        0
      );
    } else {
      array = array.filter((row: any) => row.additionally !== "Отказ брак");
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.amountFromClient3,
        0
      );
    }
  } else if (selectedTypeOfTransaction.value === "Баланс безнал") {
    if (flag === "OurRansom") {
      array = array.filter((row: any) => row.additionally !== "Отказ брак");
      return array.reduce(
        (ac: any, curValue: any) =>
          ac +
          (Math.ceil(curValue.amountFromClient1 / 10) * 10 +
            curValue.prepayment),
        0
      );
    } else if (flag === "ClientRansom") {
      array = array.filter((row: any) => row.additionally !== "Отказ брак");
      return array.reduce(
        (ac: any, curValue: any) =>
          ac + (curValue.amountFromClient2 + curValue.prepayment),
        0
      );
    } else {
      array = array.filter((row: any) => row.additionally !== "Отказ брак");
      return array.reduce(
        (ac: any, curValue: any) => ac + curValue.amountFromClient3,
        0
      );
    }
  } else if (selectedTypeOfTransaction.value === "Доставка") {
    array = array.filter((row: any) => row.additionally !== "Отказ брак");
    return array.reduce(
      (ac: any, curValue: any) => ac + curValue.amountFromClient3,
      0
    );
  }
}

function getAllSum() {
  let newStartingDate = new Date(startingDate.value);
  newStartingDate.setHours(0);
  newStartingDate.setMinutes(0);
  newStartingDate.setSeconds(0);
  newStartingDate.setMilliseconds(0);

  let newEndDate = new Date(endDate.value);
  newEndDate.setHours(23);
  newEndDate.setMinutes(59);
  newEndDate.setSeconds(59);
  newEndDate.setMilliseconds(0);

  if (selectedTypeOfTransaction.value === "Доход") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate))
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate))
      );

      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
      allSum.value = sum1.value + sum2.value;
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate))
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate))
      );

      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
      allSum.value = sum1.value + sum2.value;
    }
  } else if (selectedTypeOfTransaction.value === "Заказано") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued === null &&
          row.deleted === null &&
          (!startingDate.value ||
            new Date(row.created_at) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.created_at) <= new Date(newEndDate))
      );
      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      allSum.value = sum1.value;
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          row.issued === null &&
          row.deleted === null &&
          (!startingDate.value ||
            new Date(row.created_at) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.created_at) <= new Date(newEndDate))
      );
      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      allSum.value = sum1.value;
    }
  } else if (selectedTypeOfTransaction.value === "Баланс наличные") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент")
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate)) &&
          row.additionally === "Оплата наличными"
      );

      let sumOfPVZ = rows.value
        ?.filter((row) => row.received !== null)
        .reduce((acc, value) => acc + +value.sum, 0);
      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
      allSum.value = sum1.value + sum2.value - sumOfPVZ;
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
            row.additionally === "Отказ клиент") &&
          row.dispatchPVZ === selectedPVZ.value
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate)) &&
          (row.additionally === "Оплата наличными" ||
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
        
      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
      allSum.value = sum1.value + sum2.value - sumOfPVZ - sumOfPVZ2 + sumOfPVZ3;
    }
  } else if (selectedTypeOfTransaction.value === "Баланс безнал") {
    if (selectedPVZ.value === "Все ПВЗ") {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate)) &&
          row.additionally === "Оплачено онлайн"
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate)) &&
          row.additionally === "Оплачено онлайн"
      );

      let sumOfPVZ = rowsOnline.value?.reduce(
        (acc, value) => acc + +value.sum,
        0
      );
      sum1.value = reduceArray(copyArrayOurRansom.value, "OurRansom");
      sum2.value = reduceArray(copyArrayClientRansom.value, "ClientRansom");
      allSum.value = sum1.value + sum2.value + sum3.value - sumOfPVZ;
    } else {
      copyArrayOurRansom.value = ourRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate)) &&
          row.additionally === "Оплачено онлайн" &&
          row.dispatchPVZ === selectedPVZ.value
      );

      copyArrayClientRansom.value = clientRansomRows.value?.filter(
        (row) =>
          row.issued !== null &&
          (!startingDate.value ||
            new Date(row.issued) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.issued) <= new Date(newEndDate)) &&
          row.additionally === "Оплачено онлайн" &&
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
          (!startingDate.value ||
            new Date(row.paid) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.paid) <= new Date(newEndDate))
      );

      copyArrayDelivery2.value = deliveryRansomRows.value?.filter(
        (row) =>
          row.nameOfAction === "Сортировка" &&
          row.paid !== null &&
          (!startingDate.value ||
            new Date(row.paid) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.paid) <= new Date(newEndDate))
      );

      let sumOfPVZ = rowsDelivery.value?.reduce(
        (acc, value) => acc + +value.sum,
        0
      );
      console.log(sumOfPVZ);
      sum1.value = reduceArray(copyArrayDelivery1.value, "Delivery") - (sumOfPVZ / 2);
      sum2.value = reduceArray(copyArrayDelivery2.value, "Delivery") - (sumOfPVZ / 2);
      allSum.value = sum1.value + sum2.value + sum3.value;
    } else {
      copyArrayDelivery1.value = deliveryRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          row.nameOfAction === "Доставка" &&
          row.paid !== null &&
          (!startingDate.value ||
            new Date(row.paid) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.paid) <= new Date(newEndDate))
      );

      copyArrayDelivery2.value = deliveryRansomRows.value?.filter(
        (row) =>
          row.dispatchPVZ === selectedPVZ.value &&
          row.nameOfAction === "Сортировка" &&
          row.paid !== null &&
          (!startingDate.value ||
            new Date(row.paid) >= new Date(newStartingDate)) &&
          (!endDate.value || new Date(row.paid) <= new Date(newEndDate))
      );

      sum1.value = reduceArray(copyArrayDelivery1.value, "Delivery");
      sum2.value = reduceArray(copyArrayDelivery2.value, "Delivery");
      allSum.value = sum1.value + sum2.value + sum3.value;
    }
  }
}

function formatNumber(number: number) {
  let numberString = number.toString();

  if (numberString.length <= 3) {
    return numberString;
  }

  let formattedString = "";
  let remainder = numberString.length % 3;

  if (remainder !== 0) {
    formattedString += numberString.slice(0, remainder) + " ";
  }

  for (let i = remainder; i < numberString.length; i += 3) {
    formattedString += numberString.slice(i, i + 3) + " ";
  }

  return formattedString.slice(0, -1);
}

watch(
  [selectedPVZ, selectedTypeOfTransaction, startingDate, endDate],
  getAllSum
);

function clearFields() {
  selectedPVZ.value = "Все ПВЗ";
  selectedTypeOfTransaction.value = "Баланс наличные";
  startingDate.value = "";
  endDate.value = "";
  getAllSum();
}

let rowData = ref({} as IBalance);
let isOpen = ref(false);
let isOpenModalOnline = ref(false);
let isOpenModalDelivery= ref(false);

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

async function createRow() {
  isLoading.value = true;
  if (+rowData.value.sum > Math.ceil(allSum.value)) {
    toast.error("Сумма заявки больше баланса!");
  } else {
    await storeBalance.createBalanceRow(rowData.value, user.value.username);
    rows.value = await storeBalance.getBalanceRows();
    closeModal();
    getAllSum();
    if (user.value.role === "PVZ" || user.value.role === "COURIER") {
      selectedPVZ.value = user.value.visiblePVZ;
      rows.value = rows.value?.filter(
        (row) =>
          row.pvz === user.value.visiblePVZ ||
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

async function updateDeliveryRow(obj: any) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите изменить статус?");
  if (answer)
    await storeBalance.updateDeliveryStatus(
      obj.row,
      obj.flag,
      user.value.username
    );
  rows.value = await storeBalance.getBalanceRows();
  getAllSum();
  if (user.value.role === "PVZ" || user.value.role === "COURIER") {
    selectedPVZ.value = user.value.visiblePVZ;
    rows.value = rows.value?.filter(
      (row) =>
        row.pvz === user.value.visiblePVZ ||
        user.value.PVZ.includes(row.recipient)
    );
  }
  isLoading.value = false;
}

async function updateRow() {
  isLoading.value = true;
  await storeBalance.updateBalanceRow(rowData.value);
  rows.value = await storeBalance.getBalanceRows();
  closeModal();
  getAllSum();
  if (user.value.role === "PVZ" || user.value.role === "COURIER") {
    selectedPVZ.value = user.value.visiblePVZ;
    rows.value = rows.value?.filter(
      (row) =>
        row.pvz === user.value.visiblePVZ ||
        user.value.PVZ.includes(row.recipient)
    );
  }
  isLoading.value = false;
}
</script>

<template>
  <Head>
    <Title>Баланс</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-10">
          <div>
            <div class="flex items-center gap-3 mt-14 max-xl:mt-0">
              <h1 class="text-xl font-bold">Фильтры</h1>
              <Icon
                @click="showFilters = !showFilters"
                class="cursor-pointer duration-200 hover:text-secondary-color"
                name="solar:filters-line-duotone"
                size="24"
              />
            </div>

            <div
              v-if="showFilters"
              class="border-2 border-gray-300 p-3 mt-3 border-dashed"
            >
              <div
                class="grid grid-cols-2 max-xl:grid-cols-2 max-md:grid-cols-1"
              >
                <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
                  <h1>Показать для ПВЗ:</h1>
                  <select
                    v-if="user.role !== 'PVZ' && user.role !== 'COURIER'"
                    class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="selectedPVZ"
                  >
                    <option value="Все ПВЗ" selected>Все ПВЗ</option>
                    <option v-for="pvzValue in pvz">
                      {{ pvzValue.name }}
                    </option>
                  </select>
                  <select
                    v-else
                    class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="selectedPVZ"
                  >
                    <option v-for="pvzValue in user.PVZ">
                      {{ pvzValue }}
                    </option>
                  </select>
                </div>
                <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
                  <h1>Тип транзакции:</h1>
                  <select
                    class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="selectedTypeOfTransaction"
                  >
                    <option
                      v-if="
                        user.role !== 'ADMINISTRATOR' &&
                        user.role !== 'PVZ' &&
                        user.role !== 'COURIER'
                      "
                      value="Доход"
                    >
                      Доход
                    </option>
                    <option
                      v-if="
                        user.role !== 'ADMINISTRATOR' &&
                        user.role !== 'PVZ' &&
                        user.role !== 'COURIER'
                      "
                      value="Заказано"
                    >
                      Заказано
                    </option>
                    <option value="Баланс наличные">Баланс наличные</option>
                    <option
                      v-if="user.role !== 'PVZ' && user.role !== 'COURIER'"
                      value="Баланс безнал"
                    >
                      Баланс безнал
                    </option>
                    <option
                      v-if="
                        user.role !== 'ADMINISTRATOR' &&
                        user.role !== 'PVZ' &&
                        user.role !== 'COURIER'
                      "
                      value="Доставка"
                    >
                      Доставка и сортировка
                    </option>
                  </select>
                </div>
                <div class="grid grid-cols-1">
                  <div class="grid grid-cols-2 my-2">
                    <h1>От Даты:</h1>
                    <input
                      class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                      type="date"
                      v-model="startingDate"
                    />
                  </div>
                  <div class="grid grid-cols-2 my-2">
                    <h1>По Дату:</h1>
                    <input
                      class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                      type="date"
                      v-model="endDate"
                    />
                  </div>
                </div>
              </div>
              <div class="flex justify-end">
                <UIActionButton @click="clearFields"
                  >Очистить фильтры</UIActionButton
                >
              </div>
            </div>

            <div v-if="selectedTypeOfTransaction !== 'Доставка'">
              <div class="text-center text-2xl mt-10">
                <h1>Баланс</h1>
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
                <h1>Баланс 'Доставка'</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(sum1)) }} ₽
                </h1>
              </div>
              <div class="text-center text-2xl mt-10">
                <h1>Баланс 'Сортировка'</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(sum2)) }} ₽
                </h1>
              </div>
              <div class="text-center text-2xl mt-10">
                <h1>Баланс общий</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(allSum)) }} ₽
                </h1>
              </div>
            </div>
          </div>

          <UIMainButton
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
            class="mt-24"
            @click="openModal"
          >
            Заявка на вывод средств наличные</UIMainButton
          >
          <BalanceTable
            @update-delivery-row="updateDeliveryRow"
            :rows="rows"
            :user="user"
            @open-modal="openModal"
          />

          <div class="mt-24" v-if="user.role === 'ADMIN'">
            <UIMainButton @click="openModalOnline">
              заявка на вывод средств безнал</UIMainButton
            >
            <BalanceTableOnline :rows="rowsOnline" />
          </div>

          <div class="mt-24" v-if="user.role === 'ADMIN'">
            <UIMainButton @click="openModalDelivery">
              заявка на вывод средств D&S</UIMainButton
            >
            <BalanceTableOnline :rows="rowsDelivery" />
          </div>

          <UIModal v-show="isOpen" @close-modal="closeModal">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой заявки</div>
            </template>
            <div class="text-black">
              <div class="grid grid-cols-2 mb-5">
                <label for="dispatchPVZ1">ПВЗ</label>
                <select
                  :disabled="rowData.id > 0"
                  class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.pvz"
                >
                  <option v-for="pvzData in pvz" :value="pvzData.name">
                    {{ pvzData.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="dispatchPVZ1">Получатель</label>
                <select
                  :disabled="rowData.id > 0"
                  class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.recipient"
                >
                  <option value="Нет">Нет</option>
                  <option v-for="pvzData in pvz" :value="pvzData.name">
                    {{ pvzData.name }}
                  </option>
                  <option value="Рейзвих">Рейзвих</option>
                  <option value="Шведова">Шведова</option>
                  <option value="admin">admin</option>
                  <option value="Косой">Косой</option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="name">Сумма</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.sum"
                  :disabled="rowData.id > 0"
                  type="text"
                />
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="name">Примечание</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.notation"
                  type="text"
                />
              </div>
            </div>

            <div
              class="flex items-center justify-center gap-3 mt-10"
              v-if="rowData.id"
            >
              <UIMainButton @click="updateRow">Сохранить </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
            <div class="flex items-center justify-center gap-3 mt-10" v-else>
              <UIMainButton @click="createRow">Создать </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
          </UIModal>

          <UIModal v-show="isOpenModalOnline" @close-modal="closeModalOnline">
            <template v-slot:header>
              <div class="custom-header">Создание новой заявки</div>
            </template>
            <div class="text-black">
              <div class="grid grid-cols-2 mb-5">
                <label for="name">Сумма</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.sum"
                  type="text"
                />
              </div>
            </div>

            <div class="flex items-center justify-center gap-3 mt-10">
              <UIMainButton @click="createOnlineRow">Создать </UIMainButton>
              <UIErrorButton @click="closeModalOnline">Отменить </UIErrorButton>
            </div>
          </UIModal>

          <UIModal v-show="isOpenModalDelivery" @close-modal="closeModalDelivery">
            <template v-slot:header>
              <div class="custom-header">Создание новой заявки</div>
            </template>
            <div class="text-black">
              <div class="grid grid-cols-2 mb-5">
                <label for="name">Сумма</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.sum"
                  type="text"
                />
              </div>
            </div>

            <div class="flex items-center justify-center gap-3 mt-10">
              <UIMainButton @click="createDeliveryRow">Создать</UIMainButton>
              <UIErrorButton @click="closeModalDelivery">Отменить</UIErrorButton>
            </div>
          </UIModal>
        </div>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="user">
        <div class="mt-10">
          <div>
            <div class="flex items-center gap-3 mt-14 max-xl:mt-0">
              <h1 class="text-xl font-bold">Фильтры</h1>
              <Icon
                @click="showFilters = !showFilters"
                class="cursor-pointer duration-200 hover:text-secondary-color"
                name="solar:filters-line-duotone"
                size="24"
              />
            </div>

            <div
              v-if="showFilters"
              class="border-2 border-gray-300 p-3 mt-3 border-dashed"
            >
              <div
                class="grid grid-cols-2 max-xl:grid-cols-2 max-md:grid-cols-1"
              >
                <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
                  <h1>Показать для ПВЗ:</h1>
                  <select
                    v-if="user.role !== 'PVZ' && user.role !== 'COURIER'"
                    class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="selectedPVZ"
                  >
                    <option value="Все ПВЗ" selected>Все ПВЗ</option>
                    <option v-for="pvzValue in pvz">
                      {{ pvzValue.name }}
                    </option>
                  </select>
                  <select
                    v-else
                    class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="selectedPVZ"
                  >
                    <option v-for="pvzValue in user.PVZ">
                      {{ pvzValue }}
                    </option>
                  </select>
                </div>
                <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
                  <h1>Тип транзакции:</h1>
                  <select
                    class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="selectedTypeOfTransaction"
                  >
                    <option
                      v-if="
                        user.role !== 'ADMINISTRATOR' &&
                        user.role !== 'PVZ' &&
                        user.role !== 'COURIER'
                      "
                      value="Доход"
                    >
                      Доход
                    </option>
                    <option
                      v-if="
                        user.role !== 'ADMINISTRATOR' &&
                        user.role !== 'PVZ' &&
                        user.role !== 'COURIER'
                      "
                      value="Заказано"
                    >
                      Заказано
                    </option>
                    <option value="Баланс наличные">Баланс наличные</option>
                    <option
                      v-if="user.role !== 'PVZ' && user.role !== 'COURIER'"
                      value="Баланс безнал"
                    >
                      Баланс безнал
                    </option>
                    <option
                      v-if="
                        user.role !== 'ADMINISTRATOR' &&
                        user.role !== 'PVZ' &&
                        user.role !== 'COURIER'
                      "
                      value="Доставка"
                    >
                      Доставка и сортировка
                    </option>
                  </select>
                </div>
                <div class="grid grid-cols-1">
                  <div class="grid grid-cols-2 my-2">
                    <h1>От Даты:</h1>
                    <input
                      class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                      type="date"
                      v-model="startingDate"
                    />
                  </div>
                  <div class="grid grid-cols-2 my-2">
                    <h1>По Дату:</h1>
                    <input
                      class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                      type="date"
                      v-model="endDate"
                    />
                  </div>
                </div>
              </div>
              <div class="flex justify-end">
                <UIActionButton @click="clearFields"
                  >Очистить фильтры</UIActionButton
                >
              </div>
            </div>

            <div v-if="selectedTypeOfTransaction !== 'Доставка'">
              <div class="text-center text-2xl mt-10">
                <h1>Баланс</h1>
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
                <h1>Баланс 'Доставка'</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(sum1)) }} ₽
                </h1>
              </div>
              <div class="text-center text-2xl mt-10">
                <h1>Баланс 'Сортировка'</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(sum2)) }} ₽
                </h1>
              </div>
              <div class="text-center text-2xl mt-10">
                <h1>Баланс общий</h1>
                <h1 class="font-bold text-secondary-color text-4xl mt-3">
                  {{ formatNumber(Math.ceil(allSum)) }} ₽
                </h1>
              </div>
            </div>
          </div>

          <UIMainButton
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
            class="mt-24"
            @click="openModal"
          >
            Заявка на вывод средств наличные</UIMainButton
          >
          <BalanceTable
            @update-delivery-row="updateDeliveryRow"
            :rows="rows"
            :user="user"
            @open-modal="openModal"
          />

          <div class="mt-24" v-if="user.role === 'ADMIN'">
            <UIMainButton @click="openModalOnline">
              заявка на вывод средств безнал</UIMainButton
            >
            <BalanceTableOnline :rows="rowsOnline" />
          </div>

          <div class="mt-24" v-if="user.role === 'ADMIN'">
            <UIMainButton @click="openModalDelivery">
              заявка на вывод средств D&S</UIMainButton
            >
            <BalanceTableOnline :rows="rowsDelivery" />
          </div>

          <UIModal v-show="isOpen" @close-modal="closeModal">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой заявки</div>
            </template>
            <div class="text-black">
              <div class="grid grid-cols-2 mb-5">
                <label for="dispatchPVZ1">ПВЗ</label>
                <select
                  :disabled="rowData.id > 0"
                  class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.pvz"
                >
                  <option v-for="pvzData in pvz" :value="pvzData.name">
                    {{ pvzData.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="dispatchPVZ1">Получатель</label>
                <select
                  :disabled="rowData.id > 0"
                  class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.recipient"
                >
                  <option value="Нет">Нет</option>
                  <option v-for="pvzData in pvz" :value="pvzData.name">
                    {{ pvzData.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="name">Сумма</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.sum"
                  :disabled="rowData.id > 0"
                  type="text"
                />
              </div>

              <div class="grid grid-cols-2 mb-5">
                <label for="name">Примечание</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.notation"
                  type="text"
                />
              </div>
            </div>

            <div
              class="flex items-center justify-center gap-3 mt-10"
              v-if="rowData.id"
            >
              <UIMainButton @click="updateRow">Сохранить </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
            <div class="flex items-center justify-center gap-3 mt-10" v-else>
              <UIMainButton @click="createRow">Создать </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
          </UIModal>

          <UIModal v-show="isOpenModalOnline" @close-modal="closeModalOnline">
            <template v-slot:header>
              <div class="custom-header">Создание новой заявки</div>
            </template>
            <div class="text-black">
              <div class="grid grid-cols-2 mb-5">
                <label for="name">Сумма</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.sum"
                  type="text"
                />
              </div>
            </div>

            <div class="flex items-center justify-center gap-3 mt-10">
              <UIMainButton @click="createOnlineRow">Создать </UIMainButton>
              <UIErrorButton @click="closeModalOnline">Отменить </UIErrorButton>
            </div>
          </UIModal>

          <UIModal v-show="isOpenModalDelivery" @close-modal="closeModalDelivery">
            <template v-slot:header>
              <div class="custom-header">Создание новой заявки</div>
            </template>
            <div class="text-black">
              <div class="grid grid-cols-2 mb-5">
                <label for="name">Сумма</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.sum"
                  type="text"
                />
              </div>
            </div>

            <div class="flex items-center justify-center gap-3 mt-10">
              <UIMainButton @click="createDeliveryRow">Создать</UIMainButton>
              <UIErrorButton @click="closeModalDelivery">Отменить</UIErrorButton>
            </div>
          </UIModal>
        </div>
      </NuxtLayout>
    </div>
  </div>

  <div v-else class="flex items-center justify-center">
    <UISpinner />
  </div>
</template>
