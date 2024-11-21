<script setup lang="ts">
import { read, utils, writeFile, write } from "xlsx";
import { createClient } from "@supabase/supabase-js";
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();

const supabase = createClient(
  "https://fomoljxhkywsdgnchewy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbW9sanhoa3l3c2RnbmNoZXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1ODMwMTksImV4cCI6MjAzOTE1OTAxOX0.ItZhBr3_OBP0nii6RX-jy9Q7hu2qvNQ2UBVZNJyZDFs"
);

const router = useRouter();
const route = useRoute();

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storeQR = useQRStore();
const storeBalance = useBalanceStore();

const emit = defineEmits([
  "openModal",
  "deleteRow",
  "deleteSelectedRows",
  "updateDeliveryRows",
  "createCopyRow",
  "showDeletedRows",
  "clearRow",
]);

async function updateDeliveryRows(flag: string, allSumData: string = "0") {
  emit("updateDeliveryRows", {
    idArray: checkedRows.value,
    flag: flag,
    allSum: allSumData,
  });

  checkedRows.value = [];
  allSum.value = [];
  getAllSum.value = 0;
  getAllSumBonuses.value = 0;
  phoneNumberClient.value = "";
}

function openModal(row: IOurRansom) {
  emit("openModal", row);
}

function showDeletedRowsEmit(flag: boolean) {
  emit("showDeletedRows", flag);
  updateCurrentPageData();
}

const toggleShowDeletedRows = () => {
  showDeletedRows.value = !showDeletedRows.value;
  perPage.value = 100;
  showDeletedRowsEmit(showDeletedRows.value);
};

const toggleShowDeletedRows2 = () => {
  showDeletedRows.value = !showDeletedRows.value;
  updateCurrentPageDataDeleted();
};

function createCopyRow() {
  emit("createCopyRow", checkedRows.value[0]);
  checkedRows.value = [];
  allSum.value = [];
  getAllSum.value = 0;
}

function deleteRow(id: number) {
  emit("deleteRow", id);
}

function clearRow(id: number) {
  emit("clearRow", id);
}

function deleteSelectedRows() {
  emit("deleteSelectedRows", checkedRows.value);
  checkedRows.value = [];
  allSum.value = [];
  getAllSum.value = 0;
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IOurRansom[]> },
  pvzLink: { type: String },
});

async function exportToExcel() {
  perPage.value = await totalRows.value;
  await updateCurrentPageDataDeleted();

  let table = await document.querySelector("#theTable");

  let wb = await utils.table_to_book(table);
  await writeFile(wb, "наш_выкуп.xlsx");

  perPage.value = await 100;
}

const allSum: Ref<RowData[]> = ref([]);
const checkedRows: Ref<number[]> = ref([]);

const getAllSum: Ref<number> = ref(0);
const getAllSumBonuses: Ref<number> = ref(0);
const showButton: Ref<boolean> = ref(true);
const showButtonPVZ: Ref<boolean> = ref(true);
const showButtonSC: Ref<boolean> = ref(true);

const isChecked = (rowId: number): boolean => {
  return checkedRows.value.includes(rowId);
};

interface RowData {
  rowId: number;
  amount: number;
  issued: Date | null | string | number;
  deliveredPVZ: Date | null | string | number;
  deliveredSC: Date | null | string | number;
  orderPVZ: Date | null | string | number;
  fromName: string;
}

let scanStringItem = ref("");

let timeoutId: ReturnType<typeof setTimeout> | null = null;

function scanItem() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }


  timeoutId = setTimeout(async () => {
    let scannedLink = scanStringItem.value.trim();
    scannedLink = convertToURL(scannedLink);
    console.log(scannedLink);
    let rowData = await storeRansom.getRansomRowById(+scannedLink, "OurRansom");
    if (props.user.role !== "SORTIROVKA") {
      if (rowData.issued) {
        toast.error(
          `Товар с ID: ${rowData.id} не отметился. Причина: товар уже выдан!`,
          { timeout: 10000 }
        );
        return;
      }

      if (!rowData.deliveredPVZ) {
        toast.error(
          `Товар с ID: ${rowData.id} не отметился. Причина: товар не принят на ПВЗ!`,
          {
            timeout: 10000,
          }
        );
        return;
      }

      if (!props.rows?.includes(rowData)) {
        handleCheckboxChange(rowData);
        return;
      }

      handleCheckboxChange(rowData);
    } else {
      handleCheckboxChange(rowData);
    }
    console.log(rowData);
    scanStringItem.value = "";
    scannedLink = "";
  }, 1000);
}

function convertToURL(inputString: string) {
  if (inputString.includes("/")) {
    const parts = inputString.split("/");
    const entryID = parts[parts.length - 1];
    return entryID;
  } else if (inputString.includes(".")) {
    const parts = inputString.split(".");
    const entryID = parts[parts.length - 1];
    return entryID;
  }
}

let allSumInput = ref("");
let phoneNumberClient = ref("");
let allFromNamesEqual = ref(false);
const handleCheckboxChange = (row: IOurRansom): void => {
  phoneNumberClient.value = "";
  allSumInput.value = "";
  if (isChecked(row.id)) {
    checkedRows.value = checkedRows.value.filter((id) => id !== row.id);
    allSum.value = allSum.value.filter((obj) => obj.rowId !== row.id);
  } else {
    checkedRows.value.push(row.id);
    let amountData = 0;
    if (isDateGreaterThanReference(row.created_at)) {
      amountData = +roundToNearestTen(+row.amountFromClient1);
    } else {
      amountData = Math.ceil(+row.amountFromClient1 / 10) * 10;
    }
    allSum.value.push({
      rowId: row.id,
      amount: amountData,
      issued: row.issued,
      deliveredPVZ: row.deliveredPVZ,
      orderPVZ: row.orderPVZ,
      deliveredSC: row.deliveredSC,
      fromName: row.fromName,
    });
  }

  getAllSum.value = allSum.value
    .filter((obj) => obj.issued === null)
    .reduce((sum, obj) => sum + obj.amount, 0);

  showButton.value = allSum.value.every((obj) => obj.issued === null);
  showButtonPVZ.value = allSum.value.every((obj) => obj.deliveredPVZ === null);
  showButtonSC.value = allSum.value.every((obj) => obj.deliveredSC === null);
};

let previousAmount = 0;

function changeAmountFromClient() {
  const currentAmount = +allSumInput.value;
  const difference = currentAmount - previousAmount;
  getAllSum.value -= difference;
  getAllSumBonuses.value -= difference;
  previousAmount = currentAmount;
}

const showDeletedRows = ref(false);

const perPage = ref(100);
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.ceil((props.rows?.length || 0) / perPage.value)
);
const totalRows = computed(() =>
  Math.ceil(props.rows?.filter((row) => row.deleted === null).length || 0)
);

let returnRows = ref<Array<IOurRansom>>();
let expiredRows = ref<Array<IOurRansom>>([]);
let processingRows = ref<Array<IOurRansom>>([]);

let searchingQuery = ref("");
function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;

  if (showDeletedRows.value) {
    returnRows.value = props.rows?.slice(startIndex, endIndex);
  } else {
    returnRows.value = props.rows
      ?.filter((row) => !row.deleted)
      .slice(startIndex, endIndex);
  }

  let arrayOfExpired = props.rows?.filter(
    (row) =>
      row.deliveredSC !== null &&
      row.deliveredPVZ !== null &&
      row.issued === null &&
      !row.deleted
  );

  let arrayOfProcessing = props.rows?.filter(
    (row) =>
      row.orderPVZ === null &&
      row.deliveredSC === null &&
      !row.deleted &&
      row.dispatchPVZ !== "НаДом"
  );

  arrayOfExpired?.forEach((row: any) => {
    const currentDate = new Date();

    const deliveredDate = new Date(row.deliveredPVZ);

    const difference = currentDate - deliveredDate;

    const daysDifference = difference / (1000 * 3600 * 24);
    if (daysDifference >= 5) {
      expiredRows.value.push(row);
      expiredRows.value = [...new Set(expiredRows.value)];
    }
  });

  arrayOfProcessing?.forEach((row: any) => {
    processingRows.value.push(row);
    processingRows.value = [...new Set(processingRows.value)];
  });

  if (props.user.role === "RMANAGER" || props.user.role === "PPVZ") {
    returnRows.value = props.rows?.filter(
      (row) => row.dispatchPVZ && row.dispatchPVZ.includes(props.user.PVZ)
    );
    expiredRows.value = [];
    processingRows.value = [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (searchingQuery.value !== "") {
    searchingQuery.value = searchingQuery.value.replace(/\./g, "");
    returnRows.value = props.rows?.filter((row) => {
      const deliveredSC = new Date(row.deliveredSC);
      deliveredSC.setHours(0, 0, 0, 0);
      const deliveredSCTimeDif = deliveredSC - today;
      return (
        row.productName &&
        row.productName
          .toLowerCase()
          .includes(searchingQuery.value.trim().toLowerCase()) &&
        !row.deliveredPVZ &&
        (deliveredSCTimeDif === 0 || !row.deliveredSC)
      );
    });
    if (returnRows.value?.length === 0) {
      returnRows.value = props.rows?.filter((row) => {
        const deliveredSC = new Date(row.deliveredSC);
        deliveredSC.setHours(0, 0, 0, 0);
        const deliveredSCTimeDif = deliveredSC - today;
        return (
          row.notation &&
          row.notation
            .toLowerCase()
            .includes(searchingQuery.value.trim().toLowerCase()) &&
          !row.deliveredPVZ &&
          (deliveredSCTimeDif === 0 || !row.deliveredSC)
        );
      });
    }
    currentPage.value = 1;
  } else {
    returnRows.value = props.rows
      ?.filter((row) => !row.deleted)
      .slice(startIndex, endIndex);
  }
}

function updateCurrentPageDataDeleted() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;

  if (showDeletedRows.value) {
    returnRows.value = props.rows?.slice(startIndex, endIndex);
  } else {
    returnRows.value = props.rows
      ?.filter((row) => !row.deleted)
      .slice(startIndex, endIndex);
  }

  if (props.user.role === "RMANAGER" || props.user.role === "PPVZ") {
    returnRows.value = props.rows?.filter(
      (row) => row.dispatchPVZ && row.dispatchPVZ.includes(props.user.PVZ)
    );
  }
}

watch(
  [currentPage, totalRows, props.rows, returnRows.value, searchingQuery],
  updateCurrentPageData
);

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

let isVisiblePages = ref(true);
let clients = ref<Array<Client>>([]);
const storeClients = useClientsStore();
onMounted(async () => {
  focusInput();

  updateCurrentPageData();
  showProcessingRows();

  if (props.user.role === "SORTIROVKA") {
    perPage.value = 100;
    updateCurrentPageData();
  }

  clients.value = await storeClients.getClients();
  await storeRansom.getSumOfRejection();
});

let showOthersVariants = ref(false);
const myInput = ref(null);

let isScanActive = ref(false);
function focusInput() {
  myInput.value.focus();
  isScanActive.value = true;
}

function isExpired(row: any) {
  if (
    row.deliveredSC !== null &&
    row.deliveredPVZ !== null &&
    row.issued === null
  ) {
    const currentDate = new Date();

    const deliveredDate = new Date(row.deliveredPVZ);

    const difference = currentDate - deliveredDate;

    const daysDifference = difference / (1000 * 3600 * 24);

    return daysDifference >= 5;
  }
}

function isProcessing(row: IOurRansom) {
  if (row.orderPVZ === null) {
    return true;
  }
}
let showProcessingRowsFlag = ref(
  Cookies.get("showProcessingRowsFlag") === "true"
);

function showProcessingRows() {
  if (showProcessingRowsFlag.value === true) {
    returnRows.value = processingRows.value;
    perPage.value = 2000;
  } else {
    perPage.value = 100;
    updateCurrentPageDataDeleted();
  }
}

function changeProcessingRows() {
  showProcessingRowsFlag.value = !showProcessingRowsFlag.value;
  Cookies.set(
    "showProcessingRowsFlag",
    JSON.stringify(showProcessingRowsFlag.value)
  );
}

let showExpiredRowsFlag = ref(false);
function showExpiredRows() {
  if (showExpiredRowsFlag.value === false) {
    showExpiredRowsFlag.value = true;
    returnRows.value = expiredRows.value;
    perPage.value = 2000;
  } else {
    showExpiredRowsFlag.value = false;
    perPage.value = 100;
    updateCurrentPageDataDeleted();
  }
}

let showPayRejectClient = ref(false);

function roundToNearestTen(num: number): number {
  const lastDigit = num % 10;
  if (lastDigit >= 5) {
    return Math.ceil(num / 10) * 10;
  } else {
    return Math.floor(num / 10) * 10;
  }
}

function isDateGreaterThanReference(dateString: string | Date): boolean {
  const referenceDate = new Date("2024-06-05T00:00:01");
  const inputDate = new Date(dateString);
  return inputDate > referenceDate;
}

let isOpenModalQR = ref(false);
let isGeneratedQR = ref(false);
let isOpenModalStatus = ref(false);
let isLoading = ref(false);
const qrBody = ref<QRBodyLink>({} as QRBodyLink);
const qrBodyInfo = ref<QRBodyInfo>({} as QRBodyInfo);
const paymentStatusMessage = ref<string>("");

async function openModalQR() {
  isOpenModalQR.value = true;
  isLoading.value = true;
  qrBody.value = {} as QRBodyLink;
  qrBodyInfo.value = {} as QRBodyInfo;
  qrBodyInfo.value = await storeQR.createQRCode(
    getAllSum.value,
    `Онлайн оплата доставки, ${Date.now()}`
  );
  await checkPaymentStatus(qrBodyInfo.value.Data.operationId);
  qrBody.value = await storeQR.getPaymentStatusQR(
    qrBodyInfo.value.Data.operationId
  );
  isGeneratedQR.value = true;
  isLoading.value = false;
}

let intervalId = ref();

function closeModalQR() {
  isOpenModalQR.value = false;
  isGeneratedQR.value = false;
  qrBody.value = {} as QRBodyLink;
  qrBodyInfo.value = {} as QRBodyInfo;

  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
}

function closeModalStatus() {
  isOpenModalStatus.value = false;
  if (paymentStatusMessage.value) {
    updateDeliveryRows("additionally", getAllSum.value.toString());
  }
}

function closeModalAfterDelay() {
  setTimeout(() => {
    isOpenModalStatus.value = false;
    if (paymentStatusMessage.value) {
      updateDeliveryRows("additionally", getAllSum.value.toString());
    }
  }, 6000);
}

async function checkPaymentStatus(operationId: string) {
  const interval = 3000;

  intervalId.value = setInterval(async () => {
    try {
      let paymentData = (await storeQR.getPaymentStatusQR(
        operationId
      )) as QRPaymentStatus;

      if (
        paymentData.Data &&
        paymentData.Data.Operation &&
        paymentData.Data.Operation.length > 0
      ) {
        const status = paymentData.Data.Operation[0].status;
        paymentStatusMessage.value = status;

        if (status === "APPROVED") {
          toast.success("Операция завершена успешно!");
          updateDeliveryRows("additionally", getAllSum.value.toString());
          clearInterval(intervalId.value);
        } else if (status === "EXPIRED") {
          toast.error("Операция отклонена!");
          closeModalQR();
          isOpenModalStatus.value = true;
          closeModalStatus();
          clearInterval(intervalId.value);
        }
      } else {
        console.error("Статус платежа не найден или не существует.");
        toast.error("Статус платежа не найден или не существует.");
      }
    } catch (error) {
      console.error("Ошибка при получении статуса платежа:", error);
      toast.error("Ошибка при получении статуса платежа");
      clearInterval(intervalId.value);
    }
  }, interval);
}

function lockScroll() {
  document.body.classList.add("no-scroll");
}

function unlockScroll() {
  document.body.classList.remove("no-scroll");
}

async function writeClipboardText(text: any) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Вы успешно скопировали ссылку");
  } catch (error: any) {
    console.error(error.message);
  }
}
</script>

<template>
  <div v-if="!isLoading">
    <div class="flex items-center justify-between max-lg:block mt-10 mb-5">
      <div>
        <div class="flex items-center gap-5">
          <UIMainButton @click="focusInput">СКАНИРОВАТЬ</UIMainButton>
          <Icon
            v-if="isScanActive"
            name="eos-icons:bubble-loading"
            class="text-secondary-color"
          />
        </div>
        <input
          class="opacity-0"
          ref="myInput"
          autofocus
          v-model="scanStringItem"
          @input="scanItem"
        />
        <div
          class="flex items-center max-sm:flex-col max-sm:items-start gap-5 mb-5"
        >
          <h1
            class="text-xl"
            v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'"
          >
            Товаров в работе:
            <span class="text-secondary-color font-bold">{{ totalRows }}</span>
          </h1>
          <h1
            class="text-xl"
            v-if="user.role === 'PVZ' || user.role === 'PPVZ'"
          >
            Товаров к выдаче:
            <span class="text-secondary-color font-bold">{{ totalRows }}</span>
          </h1>
        </div>

        <div
          class="flex items-center gap-5"
          v-if="
            user.role === 'ADMIN' ||
            user.role === 'ADMINISTRATOR' ||
            user.role === 'RMANAGER'
          "
        >
          <UIActionButton
            @click="toggleShowDeletedRows"
            v-if="!route.fullPath.includes('+')"
          >
            {{
              showDeletedRows
                ? "Скрыть удаленное"
                : "Показать удаленное за неделю"
            }}
          </UIActionButton>

          <UIActionButton
            @click="toggleShowDeletedRows2"
            v-if="route.fullPath.includes('+')"
          >
            {{ showDeletedRows ? "Скрыть удаленное" : "Показать удаленное" }}
          </UIActionButton>
        </div>
      </div>
      <div class="flex items-end max-lg:mt-5 max-lg:justify-between gap-20">
        <div class="flex flex-col text-center" v-if="isVisiblePages">
          <h1 class="text-base">Страница:</h1>
          <h1 class="text-base mb-2">{{ currentPage }} из {{ totalPages }}</h1>
          <div class="flex items-center justify-center gap-2">
            <button
              @click="prevPage(), updateCurrentPageData()"
              :disabled="currentPage === 1"
              class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
            >
              <Icon
                name="material-symbols:arrow-back-ios-new-rounded"
                class="text-white"
              />
            </button>
            <button
              @click="nextPage(), updateCurrentPageData()"
              :disabled="currentPage === totalPages"
              class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
            >
              <Icon
                name="material-symbols:arrow-forward-ios-rounded"
                class="text-white"
              />
            </button>
          </div>
        </div>
        <UTooltip
          text="Скачать EXCEL"
          :shortcuts="['xlsx']"
          :popper="{ placement: 'right' }"
        >
          <div
            class="bg-secondary-color cursor-pointer border-2 border-secondary-color text-white hover:text-secondary-color hover:bg-transparent duration-200 px-2 pt-2 pb-1 rounded-full"
            @click="exportToExcel"
          >
            <Icon class="duration-200" size="32" name="bi:filetype-xlsx" />
          </div>
        </UTooltip>
      </div>
    </div>

    <div
      class="fixed top-40 z-40 left-1/2 translate-x-[-50%] translate-y-[-50%]"
      v-if="getAllSum > 0"
    >
      <h1
        class="text-base text-center backdrop-blur-xl p-2 rounded-xl border-2 text-secondary-color font-bold"
      >
        К оплате: {{ getAllSum }} <br />
        Количество товаров: {{ checkedRows.length }} <br />
        <span v-if="allFromNamesEqual">
          Бонусы клиента: {{ getAllSumBonuses }} <br />
          Потратить бонусы: <br />
          <input
            @input="changeAmountFromClient"
            class="mt-2 bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            type="text"
            v-model="allSumInput"
          />
        </span>
      </h1>
    </div>

    <div
      class="fixed z-40 flex flex-col gap-3 left-1/2 translate-x-[-50%] translate-y-[-50%]"
      v-if="
        user.dataOurRansom === 'WRITE' &&
        checkedRows.length > 0 &&
        user.role !== 'PVZ' &&
        user.role !== 'PPVZ'
      "
    >
      <UIActionButton
        v-if="
          user.role === 'ADMIN' ||
          user.role === 'ADMINISTRATOR' ||
          (user.role === 'RMANAGER' && user.dataOurRansom === 'WRITE')
        "
        @click="deleteSelectedRows"
        >Удалить выделенные записи</UIActionButton
      >
      <UIActionButton
        v-if="
          user.deliveredPVZ1 === 'WRITE' &&
          showButtonPVZ &&
          user.role === 'ADMIN'
        "
        @click="updateDeliveryRows('PVZ')"
        >Доставить на пвз
      </UIActionButton>
      <UIActionButton
        v-if="user.deliveredSC1 === 'WRITE' && showButtonSC"
        @click="updateDeliveryRows('SC')"
        >Доставить на сц
      </UIActionButton>
      <UIActionButton
        v-if="user.issued1 === 'WRITE' && showButton"
        @click="showOthersVariants = !showOthersVariants"
      >
        Выдать клиенту
      </UIActionButton>
      <div v-if="showOthersVariants" class="flex flex-col gap-3">
        <UIActionButton2
          v-if="user.additionally1 === 'WRITE'"
          @click="updateDeliveryRows('additionally3')"
          >Оплата наличными
        </UIActionButton2>
        <UIActionButton2
          v-if="user.additionally1 === 'WRITE'"
          @click="openModalQR"
          >Оплата онлайн (QR)
        </UIActionButton2>
        <UIActionButton2
          v-if="
            user.additionally1 === 'WRITE' &&
            (user.username === 'Директор' ||
              user.username === 'Горцуева' ||
              user.username === 'Светлана1' ||
              user.username === 'Светлана2' ||
              user.username === 'Власенкова')
          "
          @click="updateDeliveryRows('additionally', getAllSum)"
          >Оплата онлайн (Старый метод)
        </UIActionButton2>
        <UIActionButton2
          v-if="user.additionally1 === 'WRITE'"
          @click="showPayRejectClient = !showPayRejectClient"
          >Отказ клиент
        </UIActionButton2>
        <div v-if="showPayRejectClient" class="flex flex-col gap-3">
          <UIActionButton2 @click="updateDeliveryRows('additionally1-1')"
            >Отказ клиент онлайн</UIActionButton2
          >
          <UIActionButton2 @click="updateDeliveryRows('additionally1-2')"
            >Отказ клиент наличные</UIActionButton2
          >
        </div>
        <UIActionButton2
          v-if="user.additionally1 === 'WRITE'"
          @click="updateDeliveryRows('additionally2')"
          >Отказ брак
        </UIActionButton2>
      </div>
    </div>

    <div
      class="fixed z-40 flex flex-col gap-3 left-1/2 translate-x-[-50%] translate-y-[-50%]"
      v-if="
        user.dataOurRansom === 'WRITE' &&
        checkedRows.length > 0 &&
        (user.role === 'PVZ' || user.role === 'PPVZ')
      "
    >
      <UIActionButton
        v-if="user.issued1 === 'WRITE' && showButton"
        @click="showOthersVariants = !showOthersVariants"
      >
        Выдать клиенту
      </UIActionButton>
      <div v-if="showOthersVariants" class="flex flex-col gap-3">
        <UIActionButton2
          v-if="user.additionally1 === 'WRITE'"
          @click="updateDeliveryRows('additionally3')"
          >Оплата наличными
        </UIActionButton2>
        <UIActionButton2
          v-if="user.additionally1 === 'WRITE'"
          @click="openModalQR"
          >Оплата онлайн (QR)
        </UIActionButton2>
        <UIActionButton2
          v-if="
            user.additionally1 === 'WRITE' &&
            (user.username === 'Директор' ||
              user.username === 'Горцуева' ||
              user.username === 'Светлана1' ||
              user.username === 'Светлана2' ||
              user.username === 'Власенкова')
          "
          @click="updateDeliveryRows('additionally', getAllSum)"
          >Оплата онлайн (Старый метод)
        </UIActionButton2>
        <UIActionButton2
          v-if="user.additionally1 === 'WRITE'"
          @click="showPayRejectClient = !showPayRejectClient"
          >Отказ клиент
        </UIActionButton2>
        <div v-if="showPayRejectClient" class="flex flex-col gap-3">
          <UIActionButton2 @click="updateDeliveryRows('additionally1-1')"
            >Отказ клиент онлайн</UIActionButton2
          >
          <UIActionButton2 @click="updateDeliveryRows('additionally1-2')"
            >Отказ клиент наличные</UIActionButton2
          >
        </div>
        <UIActionButton
          v-if="user.additionally1 === 'WRITE'"
          @click="updateDeliveryRows('additionally2')"
          >Отказ брак
        </UIActionButton>
      </div>
    </div>

    <div class="py-3 flex max-sm:flex-col gap-3 max-sm:w-full">
      <h1
        v-if="
          user.role === 'ADMIN' ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'RMANAGER'
        "
        class="bg-red-500 px-5 py-1.5 text-white font-semibold rounded-md border-red-500 border-2 hover:bg-transparent hover:text-black duration-200 cursor-pointer"
        @click="showExpiredRows"
      >
        Истекает срок хранения {{ expiredRows?.length }} товаров
      </h1>
      <h1
        v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
        class="bg-yellow-400 px-5 py-1.5 text-white font-semibold rounded-md border-yellow-400 border-2 hover:bg-transparent hover:text-black duration-200 cursor-pointer"
        @click="changeProcessingRows(), showProcessingRows()"
      >
        Ждут обработку {{ processingRows?.length }} товаров
      </h1>
    </div>

    <UInput
      v-if="user.role === 'SORTIROVKA'"
      v-model="searchingQuery"
      name="searchingQuery"
      placeholder="Поиск..."
      class="max-w-[400px]"
      icon="i-heroicons-magnifying-glass-20-solid"
      autocomplete="off"
      :ui="{ icon: { trailing: { pointer: '' } } }"
    >
      <template #trailing>
        <UButton
          v-show="searchingQuery !== ''"
          color="gray"
          variant="link"
          icon="i-heroicons-x-mark-20-solid"
          :padded="false"
          @click="searchingQuery = ''"
        />
      </template>
    </UInput>
    <div
      :class="{
        'overflow-x-auto max-h-[300px] overflow-y-auto': isOpenModalQR,
      }"
      class="relative mt-5 mb-10 mr-5"
    >
      <div id="up"></div>
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
              class="border-2"
              v-if="user.dataOurRansom === 'WRITE'"
            >
              Выделение
            </th>
            <th
              scope="col"
              class="exclude-row border-2 text-[10px]"
              v-if="
                (user.dataOurRansom === 'WRITE' && user.role === 'ADMIN') ||
                user.role === 'ADMINISTRATOR'
              "
            >
              изменение
            </th>
            <th scope="col" class="border-2 px-3">id</th>
            <th
              scope="col"
              class="border-2"
              v-if="user.clientLink1 === 'READ' || user.clientLink1 === 'WRITE'"
            >
              ссылка для клиента
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'"
            >
              ячейка
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'"
            >
              телефон
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.productLink1 === 'READ' || user.productLink1 === 'WRITE'
              "
            >
              товар (ссылка)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.productName1 === 'READ' || user.productName1 === 'WRITE'
              "
            >
              название товара
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'"
            >
              примечание
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
            >
              стоимость сайт
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'"
            >
              предоплата
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.percentClient1 === 'READ' ||
                user.percentClient1 === 'WRITE'
              "
            >
              процент с клиента (%)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.deliveredKGT1 === 'READ' || user.deliveredKGT1 === 'WRITE'
              "
            >
              дополнительный доход
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.amountFromClient1 === 'READ' ||
                user.amountFromClient1 === 'WRITE'
              "
            >
              сумма с клиента
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'
              "
            >
              отправка в пвз
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'"
            >
              заказано на сц
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.orderAccount === 'READ' || user.orderAccount === 'WRITE'
              "
            >
              аккаунт заказа
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'
              "
            >
              доставлено на сц
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                (user.deliveredPVZ1 === 'READ' ||
                  user.deliveredPVZ1 === 'WRITE') &&
                user.role !== 'SORTIROVKA'
              "
            >
              доставлено на пвз
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'"
            >
              выдан клиенту
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.additionally1 === 'READ' || user.additionally1 === 'WRITE'
              "
            >
              дополнительно
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.profit1 === 'READ' || user.profit1 === 'WRITE'"
            >
              прибыль (доход)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              создан (время)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              изменен (время)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              удален (время)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              создан
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              изменен
            </th>
            <th
              scope="col"
              class="exclude-row px-6 py-3 border-2"
              v-if="
                (user.dataOurRansom === 'WRITE' && user.role === 'ADMIN') ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              удаление
            </th>
            <th
              scope="col"
              class="exclude-row px-6 py-3 border-2"
              v-if="
                user.username === 'Директор' ||
                user.username === 'Горцуева' ||
                user.username === 'Власенкова'
              "
            >
              очистить
            </th>
          </tr>
        </thead>
        <tbody>
          <div id="left"></div>
          <tr
            :class="{
              'bg-orange-100': isChecked(row.id),
              'bg-red-300': isExpired(row),
              'bg-yellow-400 text-white font-bold': isProcessing(row),
            }"
            class="border-b text-center text-sm"
            v-for="row in returnRows"
          >
            <td
              v-if="user.dataOurRansom === 'WRITE'"
              class="border-2 text-secondary-color"
            >
              <input
                type="checkbox"
                :value="row.id"
                :checked="isChecked(row.id)"
                @change="handleCheckboxChange(row)"
                :disabled="
                  user.username === 'Кожемякина' || user.username === 'Гриценко'
                "
              />
            </td>
            <td
              class="border-2"
              v-if="
                (user.dataOurRansom === 'WRITE' && user.role === 'ADMIN') ||
                user.role === 'ADMINISTRATOR'
              "
            >
              <h1 @click="openModal(row)" class="cursor-pointer">✏️</h1>
            </td>
            <th
              scope="row"
              class="border-2 font-medium underline text-secondary-color whitespace-nowrap"
            >
              <NuxtLink
                v-if="
                  user.role !== 'PVZ' &&
                  user.role !== 'ADMINISTRATOR' &&
                  user.role !== 'RMANAGER' &&
                  user.role !== 'PPVZ'
                "
                class="cursor-pointer hover:text-orange-200 duration-200"
                :to="`/spreadsheets/record/1/${row.id}`"
              >
                {{ row.id }}
              </NuxtLink>
              <h1 v-else>{{ row.id }}</h1>
            </th>
            <td
              class="px-3 py-4 border-2 underline text-secondary-color whitespace-nowrap uppercase overflow-hidden max-w-[50px]"
              v-if="user.clientLink1 === 'READ' || user.clientLink1 === 'WRITE'"
            >
              <NuxtLink
                target="_blank"
                class="cursor-pointer hover:text-orange-200 duration-200"
                :to="`/spreadsheets/order/${row.clientLink1}`"
              >
                {{ row.clientLink1 }}
              </NuxtLink>
            </td>
            <td
              v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'"
              class="border-2"
            >
              {{ row.cell }}
            </td>
            <td
              v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'"
              class="py-4 border-2 text-secondary-color underline"
            >
              <NuxtLink
                v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'"
                class="cursor-pointer hover:text-orange-200 duration-200"
                :to="`/phone/${row.fromName}`"
              >
                {{ row.fromName }}
              </NuxtLink>
            </td>
            <td
              class="underline border-2 text-secondary-color whitespace-nowrap overflow-hidden max-w-[30px]"
              v-if="
                user.productLink1 === 'READ' || user.productLink1 === 'WRITE'
              "
            >
              <a
                :href="row.productLink"
                target="_blank"
                class="hover:text-orange-200 duration-200"
                >{{ row.productLink }}</a
              >
            </td>
            <td
              class="border-2 overflow-hidden max-h-[40px]"
              v-if="
                user.productName1 === 'READ' || user.productName1 === 'WRITE'
              "
            >
              {{ row.productName }}
            </td>
            <td
              class="border-2"
              v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'"
              :class="{
                'bg-yellow-300 text-white font-semibold': row.notation,
              }"
            >
              {{ row.notation ? row.notation : "Пусто" }}
            </td>
            <td
              class="border-2"
              v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
            >
              {{ row.priceSite }}
            </td>
            <td
              class="border-2"
              v-if="user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'"
            >
              {{ row.prepayment }}
            </td>
            <td
              class="border-2"
              v-if="
                user.percentClient1 === 'READ' ||
                user.percentClient1 === 'WRITE'
              "
            >
              {{ row.percentClient }}
            </td>
            <td
              class="border-2"
              v-if="
                user.deliveredKGT1 === 'READ' || user.deliveredKGT1 === 'WRITE'
              "
            >
              {{ row.deliveredKGT }}
            </td>
            <td
              class="border-2"
              v-if="
                (user.amountFromClient1 === 'READ' ||
                  user.amountFromClient1 === 'WRITE') &&
                !isDateGreaterThanReference(row.created_at)
              "
            >
              {{ Math.ceil(+row.amountFromClient1 / 10) * 10 }}
            </td>
            <td
              class="border-2"
              v-if="
                (user.amountFromClient1 === 'READ' ||
                  user.amountFromClient1 === 'WRITE') &&
                isDateGreaterThanReference(row.created_at)
              "
            >
              {{ +roundToNearestTen(+row.amountFromClient1) }}
            </td>
            <td
              class="px-2 py-4 border-2"
              v-if="
                user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'
              "
            >
              {{ row.dispatchPVZ }}
            </td>
            <td
              class="px-2 py-4 border-2"
              v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'"
            >
              {{ row.orderPVZ }}
            </td>
            <td
              class="px-2 py-4 border-2"
              v-if="
                user.orderAccount === 'READ' || user.orderAccount === 'WRITE'
              "
            >
              {{ row.orderAccount }}
            </td>
            <td
              class="border-2"
              v-if="
                user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'
              "
            >
              <h1 class="font-bold text-green-500">
                {{
                  row.deliveredSC
                    ? storeUsers.getNormalizedDate(row.deliveredSC)
                    : ""
                }}
              </h1>
            </td>
            <td
              class="border-2"
              v-if="
                (user.deliveredPVZ1 === 'READ' ||
                  user.deliveredPVZ1 === 'WRITE') &&
                user.role !== 'SORTIROVKA'
              "
            >
              <h1 class="font-bold text-green-500">
                {{
                  row.deliveredPVZ
                    ? storeUsers.getNormalizedDate(row.deliveredPVZ)
                    : ""
                }}
              </h1>
            </td>
            <td
              class="border-2"
              v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'"
            >
              <h1 class="font-bold text-green-500">
                {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
              </h1>
            </td>
            <td
              class="px-6 py-4 border-2"
              v-if="
                user.additionally1 === 'READ' || user.additionally1 === 'WRITE'
              "
            >
              {{ row.additionally ? row.additionally : "Пусто" }}
            </td>

            <td
              class="px-1 py-4 border-2"
              v-if="
                (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
                row.additionally !== 'Отказ клиент' &&
                row.additionally !== 'Отказ клиент онлайн' &&
                row.additionally !== 'Отказ клиент наличные' &&
                row.additionally !== 'Отказ брак' &&
                !row.prepayment &&
                !isDateGreaterThanReference(row.created_at)
              "
            >
              {{
                Math.ceil(row.amountFromClient1 / 10) * 10 -
                row.priceSite +
                row.deliveredKGT
              }}
            </td>

            <td
              class="px-1 py-4 border-2"
              v-if="
                (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
                row.additionally !== 'Отказ клиент' &&
                row.additionally !== 'Отказ клиент онлайн' &&
                row.additionally !== 'Отказ клиент наличные' &&
                row.additionally !== 'Отказ брак' &&
                !row.prepayment &&
                isDateGreaterThanReference(row.created_at)
              "
            >
              {{
                roundToNearestTen(row.amountFromClient1) -
                row.priceSite +
                row.deliveredKGT
              }}
            </td>

            <td
              class="px-1 py-4 border-2"
              v-if="
                (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
                row.additionally !== 'Отказ клиент' &&
                row.additionally !== 'Отказ клиент онлайн' &&
                row.additionally !== 'Отказ клиент наличные' &&
                row.additionally !== 'Отказ брак' &&
                row.prepayment
              "
            >
              {{
                row.percentClient !== 0
                  ? Math.ceil(
                      (row.priceSite * row.percentClient) / 100 +
                        row.deliveredKGT
                    )
                  : row.deliveredKGT
              }}
            </td>

            <td
              class="px-1 py-4 border-2"
              v-if="
                (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
                (row.additionally === 'Отказ клиент' ||
                  row.additionally === 'Отказ клиент онлайн' ||
                  row.additionally === 'Отказ клиент наличные' ||
                  row.additionally === 'Отказ брак')
              "
            >
              {{ row.profit1 }}
            </td>

            <td
              class="px-6 border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ storeUsers.getNormalizedDate(row.created_at) }}
            </td>
            <td
              class="px-6 border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ storeUsers.getNormalizedDate(row.updated_at) }}
            </td>
            <td
              class="px-6 border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ storeUsers.getNormalizedDate(row.deleted) }}
            </td>
            <td
              class="px-6 border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ row.createdUser }}
            </td>
            <td
              class="px-6 border-2"
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              {{ row.updatedUser }}
            </td>

            <td
              class="px-6 py-4 border-2"
              v-if="
                (user.dataOurRansom === 'WRITE' && user.role === 'ADMIN') ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              <div
                @click="deleteRow(row.id)"
                class="bg-red-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
              >
                <Icon class="text-red-600" name="ic:round-delete" size="18" />
              </div>
            </td>

            <td
              class="px-6 py-4 border-2"
              v-if="
                user.username === 'Директор' ||
                user.username === 'Горцуева' ||
                user.username === 'Власенкова'
              "
            >
              <div
                @click="clearRow(row.id)"
                class="bg-red-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
              >
                <Icon
                  class="text-red-600"
                  name="i-ic-baseline-close"
                  size="18"
                />
              </div>
            </td>
            <div id="right"></div>
          </tr>
        </tbody>
      </table>
      <div id="down"></div>
    </div>

    <UINewModal
      v-show="isOpenModalQR && isGeneratedQR"
      @close-modal="closeModalQR"
    >
      <template v-slot:icon-header>
        <Icon
          size="24"
          name="streamline:money-cash-bill-3-accounting-billing-payment-finance-cash-currency-money-bill"
        />
      </template>
      <template v-slot:header>
        <div class="custom-header">
          <h1 v-if="paymentStatusMessage === 'CREATED'">
            Статус: <span class="text-secondary-color"> ОЖИДАНИЕ </span>
          </h1>
          <h1 v-if="paymentStatusMessage === 'APPROVED'">
            Статус: <span class="text-green-500"> УСПЕШНО </span>
          </h1>
          <h1 v-if="paymentStatusMessage === 'EXPIRED'">
            Статус: <span class="text-red-500"> ОТКЛОНЁН </span>
          </h1>
        </div>
      </template>
      <template v-slot:body>
        <div>
          <h1 class="text-center mb-1">
            Сумма:
            <span class="text-secondary-color font-bold"
              >{{ getAllSum }} ₽</span
            >
          </h1>
          <h1
            @click="writeClipboardText(qrBody.Data?.Operation[0]?.paymentLink)"
            class="text-center mb-3 duration-200 font-bold underline text-secondary-color cursor-pointer hover:opacity-50"
          >
            СКОПИРОВАТЬ ССЫЛКУ
          </h1>
          <div>
            <CodeModalQR :value="qrBody.Data?.Operation[0]?.paymentLink" />
          </div>
          <div class="mt-3 max-w-[300px]">
            <h1>Отсканируйте QR-код для оплаты</h1>
            <div class="text-left text-sm mt-10">
              <h1>
                Стоимость оплаты:
                <b>{{ qrBody.Data?.Operation[0]?.amount }} ₽ </b>
              </h1>
              <h1>
                Дата и время создания:
                <b
                  >{{
                    storeUsers.getNormalizedDate(
                      qrBody.Data?.Operation[0]?.createdAt
                    )
                  }}
                  (МСК)
                </b>
              </h1>
              <h1>
                Уникальный идентификатор:
                <b>{{ qrBody.Data?.Operation[0]?.operationId }} </b>
              </h1>
              <h1>
                Комментарий:
                <b>
                  {{ qrBody.Data?.Operation[0]?.purpose }}
                </b>
              </h1>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <UIExitModalButton @click="closeModalQR">Отменить</UIExitModalButton>
      </template>
    </UINewModal>

    <UINewModal v-show="isOpenModalStatus" @close-modal="closeModalStatus">
      <template v-slot:icon-header>
        <Icon size="24" name="uil:transaction" />
      </template>
      <template v-slot:header>
        <div class="custom-header">
          <h1 v-if="paymentStatusMessage === 'Accepted'">
            Статус: <span class="text-green-500"> УСПЕШНО </span>
          </h1>
          <h1 v-if="paymentStatusMessage === 'Rejected'">
            Статус: <span class="text-red-500"> ОТКЛОНЁН </span>
          </h1>
        </div>
      </template>
      <template v-slot:body>
        <div v-if="paymentStatusMessage === 'Accepted'">
          <div class="animate-pulse max-w-[300px] mx-auto">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 130.2 130.2"
            >
              <circle
                class="path circle"
                fill="none"
                stroke="#60b504"
                stroke-width="6"
                stroke-miterlimit="10"
                cx="65.1"
                cy="65.1"
                r="62.1"
              />
              <polyline
                class="path check"
                fill="none"
                stroke="#60b504"
                stroke-width="6"
                stroke-linecap="round"
                stroke-miterlimit="10"
                points="100.2,40.2 51.5,88.8 29.8,67.5 "
              />
            </svg>
          </div>
          <div class="mt-10 font-semibold text-lg">
            <h1>Операция прошла успешно!</h1>
            <h1>Окно закроется автоматически через 5 секунд...</h1>
          </div>
        </div>
        <div v-if="paymentStatusMessage === 'Rejected'">
          <div class="animate-pulse max-w-[300px] mx-auto">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 130.2 130.2"
            >
              <circle
                class="path circle"
                fill="none"
                stroke="#D06079"
                stroke-width="6"
                stroke-miterlimit="10"
                cx="65.1"
                cy="65.1"
                r="62.1"
              />
              <line
                class="path line"
                fill="none"
                stroke="#D06079"
                stroke-width="6"
                stroke-linecap="round"
                stroke-miterlimit="10"
                x1="34.4"
                y1="37.9"
                x2="95.8"
                y2="92.3"
              />
              <line
                class="path line"
                fill="none"
                stroke="#D06079"
                stroke-width="6"
                stroke-linecap="round"
                stroke-miterlimit="10"
                x1="95.8"
                y1="38"
                x2="34.4"
                y2="92.2"
              />
            </svg>
          </div>
          <div class="mt-10 font-semibold text-lg">
            <h1>Операция была отклонена!</h1>
            <h1>Окно закроется автоматически через 5 секунд...</h1>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <UIExitModalButton @click="closeModalStatus">ЗАКРЫТЬ</UIExitModalButton>
      </template>
    </UINewModal>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}

.path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 0;
  &.circle {
    -webkit-animation: dash 1.8s ease-in-out; /* Увеличено до 1.8s */
    animation: dash 1.8s ease-in-out; /* Увеличено до 1.8s */
  }
  &.line {
    stroke-dashoffset: 1000;
    -webkit-animation: dash 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
    animation: dash 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
  }
  &.check {
    stroke-dashoffset: -100;
    -webkit-animation: dash-check 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
    animation: dash-check 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
  }
}

@-webkit-keyframes dash {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@-webkit-keyframes dash-check {
  0% {
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dashoffset: 900;
  }
}

@keyframes dash-check {
  0% {
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dashoffset: 900;
  }
}
</style>
