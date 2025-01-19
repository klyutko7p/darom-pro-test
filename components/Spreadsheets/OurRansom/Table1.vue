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
  isShowModalValue: { type: Boolean, required: true },
});

function openModalEmit() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

watch([props.isShowModalValue], openModalEmit);

async function exportToExcel() {
  perPage.value = await totalRows.value;
  await updateCurrentPageDataDeleted();

  let table = document.querySelector(".table-fixed");

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
      storeRansom.announce(`${rowData.cell}`);

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
      storeRansom.announce(rowData.cell);
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

const updateRowBackground = (rowId: string, isChecked: boolean): void => {
  const tdElements = document.querySelectorAll("td");
  tdElements.forEach((td) => {
    const linkElement = td.querySelector("a");
    if (linkElement?.innerHTML === rowId) {
      if (isChecked) {
        td.parentElement?.classList.add("bg-orange-100");
      } else {
        td.parentElement?.classList.remove("bg-orange-100");
      }
    }
  });
};

const handleCheckboxChange = (row: IOurRansom): void => {
  phoneNumberClient.value = "";
  allSumInput.value = "";
  if (isChecked(row.id)) {
    checkedRows.value = checkedRows.value.filter((id) => id !== row.id);
    allSum.value = allSum.value.filter((obj) => obj.rowId !== row.id);
    updateRowBackground(row.id.toString(), false);
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
    updateRowBackground(row.id.toString(), true);
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

let returnRows = ref<Array<IOurRansom>>([]);
let expiredRows = ref<Array<IOurRansom>>([]);
let processingRows = ref<Array<IOurRansom>>([]);
let waitingRows = ref<Array<IOurRansom>>([]);

let searchingQuery = ref("");
function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;

  returnRows.value = props.rows?.slice(startIndex, endIndex);

  if (props.user.role === "PPVZ") {
    returnRows.value = props.rows?.filter(
      (row) => row.dispatchPVZ && props.user.PVZ.includes(row.dispatchPVZ)
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let arrayOfProcessing = props.rows?.filter(
    (row) =>
      row.orderPVZ === null &&
      row.deliveredSC === null &&
      !row.deleted &&
      row.dispatchPVZ !== "НаДом"
  );
  arrayOfProcessing?.forEach((row: any) => {
    processingRows.value.push(row);
    processingRows.value = [...new Set(processingRows.value)];
  });

  if (searchingQuery.value !== "") {
    if (!searchingQuery.value.includes("https")) {
      searchingQuery.value = searchingQuery.value.replace(/\./g, "");
    }
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
      const searchField = searchingQuery.value.includes("https")
        ? "productLink"
        : "notation";
      returnRows.value = filterRows(searchField);
      currentPage.value = 1;
    }
  } else {
    returnRows.value = props.rows
      ?.filter((row) => !row.deleted)
      .slice(startIndex, endIndex);
  }
}

function updateCurrentPageData2() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;

  returnRows.value = props.rows?.slice(startIndex, endIndex);

  if (props.user.role === "PPVZ") {
    returnRows.value = props.rows?.filter(
      (row) => row.dispatchPVZ && props.user.PVZ.includes(row.dispatchPVZ)
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (searchingQuery.value !== "") {
    if (!searchingQuery.value.includes("https")) {
      searchingQuery.value = searchingQuery.value.replace(/\./g, "");
    }
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
      const searchField = searchingQuery.value.includes("https")
        ? "productLink"
        : "notation";
      returnRows.value = filterRows(searchField);
      currentPage.value = 1;
    }
  } else {
    returnRows.value = props.rows
      ?.filter((row) => !row.deleted)
      .slice(startIndex, endIndex);
  }
}

function filterRows(searchField) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return props.rows?.filter((row) => {
    const deliveredSC = new Date(row.deliveredSC);
    deliveredSC.setHours(0, 0, 0, 0);
    const deliveredSCTimeDif = deliveredSC - today;

    return (
      row[searchField] &&
      row[searchField]
        .toLowerCase()
        .includes(searchingQuery.value.trim().toLowerCase()) &&
      !row.deliveredPVZ &&
      (deliveredSCTimeDif === 0 || !row.deliveredSC)
    );
  });
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
      (row) => row.dispatchPVZ && props.user.PVZ.includes(row.dispatchPVZ)
    );
  }
}

watch(
  [currentPage, totalRows, props.rows, returnRows.value],
  updateCurrentPageData
);

let debounceTimer = null;

watch(searchingQuery, (newValue) => {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    updateCurrentPageData();
  }, 500);
});

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

const restrictedKeys = [
  { key: "cell", access: props.user.cell1 },
  { key: "additionally", access: props.user.additionally1 },
  { key: "deliveredSC", access: props.user.deliveredSC1 },
  { key: "deliveredPVZ", access: props.user.deliveredPVZ1 },
  { key: "deliveredKGT", access: props.user.deliveredKGT1 },
  { key: "dispatchPVZ", access: props.user.dispatchPVZ1 },
  { key: "fromName", access: props.user.fromName1 },
  { key: "issued", access: props.user.issued1 },
  { key: "orderAccount", access: props.user.orderAccount },
  { key: "orderPVZ", access: props.user.orderPVZ1 },
  { key: "percentClient", access: props.user.percentClient1 },
  { key: "notation", access: props.user.notation1 },
  { key: "prepayment", access: props.user.prepayment1 },
  { key: "priceSite", access: props.user.priceSite },
  { key: "productLink", access: props.user.productLink1 },
  { key: "productName", access: props.user.productName1 },
  { key: "amountFromClient1", access: props.user.amountFromClient1 },
  { key: "clientLink1", access: props.user.clientLink1 },
  { key: "profit1", access: props.user.profit1 },
];

onMounted(async () => {
  focusInput();

  restrictedKeys.forEach(({ key, access }) => {
    if (access !== "WRITE" && access !== "READ") {
      const index = columns.findIndex((column) => column.key === key);
      if (index !== -1) {
        columns.splice(index, 1);
      }
    }
  });

  if (props.user.role === "SORTIROVKA") {
    const index = columns.findIndex((column) => column.key === "deliveredPVZ");
    if (index !== -1) {
      columns.splice(index, 1);
    }
  }

  if (
    props.user.username !== "Директор" &&
    props.user.username !== "Власенкова" &&
    props.user.username !== "Горцуева" &&
    props.user.username !== "Шведова" &&
    !props.user.username.includes("Светлана")
  ) {
    const index = columns.findIndex((column) => column.key === "actions");
    if (index !== -1) {
      columns.splice(index, 1);
    }
  }

  showProcessingRows();

  updateCurrentPageData();

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

function isWaiting(row: any) {
  if (!row.deliveredSC) {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    return (
      !row.deliveredSC &&
      new Date(row.created_at) < tenDaysAgo &&
      props.user.username === "Горцуева"
    );
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

let showWaitingRowsFlag = ref(Cookies.get("showWaitingRowsFlag") === "true");

const updateRowBackgroundYellow = (rowId: string): void => {
  const tdElements = document.querySelectorAll("td");
  tdElements.forEach((td) => {
    const linkElement = td.querySelector("a");
    if (linkElement?.innerHTML === rowId) {
      td.parentElement?.classList.add("bg-yellow-300");
    }
  });
};

function showProcessingRows() {
  if (showProcessingRowsFlag.value === true) {
    processingRows.value.forEach((row) =>
      updateRowBackgroundYellow(row.id.toString())
    );
    returnRows.value = processingRows.value;
    perPage.value = 2000;
  } else {
    perPage.value = 100;
    updateCurrentPageData();
  }
}

const updateRowBackgroundGreen = (rowId: string): void => {
  const tdElements = document.querySelectorAll("td");
  tdElements.forEach((td) => {
    const linkElement = td.querySelector("a");
    if (linkElement?.innerHTML === rowId) {
      td.parentElement?.classList.add("bg-green-300");
    }
  });
};

function showWaitingRows() {
  if (showWaitingRowsFlag.value === true) {
    waitingRows.value.forEach((row) =>
      updateRowBackgroundGreen(row.id.toString())
    );
    returnRows.value = waitingRows.value;
    perPage.value = 500;
  } else {
    perPage.value = 100;
    updateCurrentPageData();
  }
}

function changeProcessingRows() {
  showProcessingRowsFlag.value = !showProcessingRowsFlag.value;
  Cookies.set(
    "showProcessingRowsFlag",
    JSON.stringify(showProcessingRowsFlag.value)
  );
}

function changeWaitingRows() {
  showWaitingRowsFlag.value = !showWaitingRowsFlag.value;
  Cookies.set("showWaitingRowsFlag", JSON.stringify(showWaitingRowsFlag.value));
}

let showExpiredRowsFlag = ref(false);

const updateRowBackgroundRed = (rowId: string): void => {
  const tdElements = document.querySelectorAll("td");
  tdElements.forEach((td) => {
    const linkElement = td.querySelector("a");
    if (linkElement?.innerHTML === rowId) {
      td.parentElement?.classList.add("bg-red-300");
    }
  });
};

function showExpiredRows() {
  if (showExpiredRowsFlag.value === false) {
    expiredRows.value.forEach((row) =>
      updateRowBackgroundRed(row.id.toString())
    );
    showExpiredRowsFlag.value = true;
    returnRows.value = expiredRows.value;
    perPage.value = 500;
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

async function openModalQR(flag: string) {
  if (flag === "additionally") {
    isOpenModalQR.value = true;
    isLoading.value = true;
    qrBody.value = {} as QRBodyLink;
    qrBodyInfo.value = {} as QRBodyInfo;
    qrBodyInfo.value = await storeQR.createQRCode(
      getAllSum.value,
      `Онлайн оплата доставки, ${Date.now()}`
    );
    await checkPaymentStatus(qrBodyInfo.value.Data.operationId, flag);
    qrBody.value = await storeQR.getPaymentStatusQR(
      qrBodyInfo.value.Data.operationId
    );
    isGeneratedQR.value = true;
    isLoading.value = false;
  } else if (flag === "additionally1-1") {
    isOpenModalQR.value = true;
    isLoading.value = true;
    qrBody.value = {} as QRBodyLink;
    qrBodyInfo.value = {} as QRBodyInfo;
    qrBodyInfo.value = await storeQR.createQRCode(
      100,
      `Отказ клиента, ${Date.now()}`
    );
    await checkPaymentStatus(qrBodyInfo.value.Data.operationId, flag);
    qrBody.value = await storeQR.getPaymentStatusQR(
      qrBodyInfo.value.Data.operationId
    );
    isGeneratedQR.value = true;
    isLoading.value = false;
  }
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

async function checkPaymentStatus(operationId: string, flag: string) {
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
          if (flag === "additionally") {
            updateDeliveryRows("additionally", getAllSum.value.toString());
            clearInterval(intervalId.value);
          } else if (flag === "additionally1-1") {
            updateDeliveryRows("additionally1-1");
            clearInterval(intervalId.value);
          }
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

let isShowButtonsRows = ref(false);

function showButtonsRows() {
  isShowButtonsRows.value = !isShowButtonsRows.value;

  if (isShowButtonsRows.value) {
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

    let arrayOfWaiting = props.rows?.filter((row) => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      return !row.deliveredSC && new Date(row.created_at) < tenDaysAgo;
    });

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

    arrayOfWaiting?.forEach((row: any) => {
      waitingRows.value.push(row);
      waitingRows.value = [...new Set(waitingRows.value)];
    });
    showProcessingRows();

    showWaitingRows();
  }
}

const itemsTable = (row: IOurRansom) => [
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
  [
    {
      label: "Очистить",
      icon: "i-ic-baseline-close",
      click: () => clearRow(row.id),
    },
  ],
];

const dropdownStates = ref({} as any);

const toggleDropdown = (rowId: any) => {
  dropdownStates.value = {};

  dropdownStates.value[rowId] = !dropdownStates.value[rowId];
};

const columns = [
  {
    key: "actions",
  },
  {
    key: "select",
    label: "Выделение",
  },
  {
    key: "id",
    label: "ID",
  },
  {
    key: "clientLink1",
    label: "Ссылка кл.",
  },
  {
    key: "cell",
    label: "Ячейка",
  },
  {
    key: "fromName",
    label: "Телефон",
  },
  {
    key: "productLink",
    label: "🔗 на товар ",
  },
  {
    key: "productName",
    label: "Название",
  },
  {
    key: "notation",
    label: "Примеч.",
  },
  {
    key: "priceSite",
    label: "Стоимость",
  },
  {
    key: "prepayment",
    label: "Предоплата",
  },
  {
    key: "percentClient",
    label: "Процент",
  },
  {
    key: "deliveredKGT",
    label: "Доп. доход",
  },
  {
    key: "amountFromClient1",
    label: "Сумма с кл.",
  },
  {
    key: "dispatchPVZ",
    label: "ПВЗ",
  },
  {
    key: "orderPVZ",
    label: "СЦ",
  },
  {
    key: "orderAccount",
    label: "Аккаунт",
  },
  {
    key: "deliveredSC",
    label: "Дост. на СЦ",
  },
  {
    key: "deliveredPVZ",
    label: "Дост. на ПВЗ",
  },
  {
    key: "issued",
    label: "Выдан",
  },
  {
    key: "additionally",
    label: "Доп.",
  },
  {
    key: "profit1",
    label: "Доход",
  },
];
</script>

<template>
  <div v-if="!isLoading">
    <div class="flex items-center justify-between max-lg:block mt-10 mb-2">
      <div>
        <div class="flex items-center gap-5">
          <UIMainButton @click="focusInput"
            >СКАНИРОВАТЬ товары клиента</UIMainButton
          >
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
          class="flex items-center gap-5 mb-3"
          v-if="
            user.role === 'ADMIN' ||
            user.role === 'ADMINISTRATOR' ||
            user.role === 'RMANAGER'
          "
        >
          <UIActionButton
            @click="toggleShowDeletedRows2"
            v-if="route.fullPath.includes('+')"
          >
            {{ showDeletedRows ? "Скрыть удаленное" : "Показать удаленное" }}
          </UIActionButton>
        </div>
        <div
          class="flex items-center max-sm:flex-col max-sm:items-start gap-5 mb-2"
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
      </div>

      <div class="flex items-end max-lg:mt-5 max-lg:justify-between gap-20">
        <div class="flex flex-col text-center" v-if="isVisiblePages">
          <h1 class="text-base mb-2">
            Страница: {{ currentPage }} из {{ totalPages }}
          </h1>

          <div
            class="flex items-center justify-center gap-2 max-sm:justify-start"
          >
            <button
              @click="prevPage(), updateCurrentPageData2()"
              :disabled="currentPage === 1"
              class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
            >
              <Icon
                name="material-symbols:arrow-back-ios-new-rounded"
                class="text-white"
              />
            </button>
            <button
              @click="nextPage(), updateCurrentPageData2()"
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
      class="fixed top-32 z-40 left-1/2 translate-x-[-50%] translate-y-[-50%]"
      v-if="getAllSum > 0"
    >
      <h1
        class="text-base text-center shadow-inner bg-white backdrop-blur-xl p-5 uppercase rounded-xl border-secondary-color border-[1px] text-secondary-color font-bold"
      >
        К оплате: {{ getAllSum }} ₽ <br />
        Кол-во товаров: {{ checkedRows.length }} шт. <br />
      </h1>
    </div>

    <div
      class="fixed z-40 flex flex-col gap-3 left-1/2 translate-x-[-50%] translate-y-[-35%]"
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
          @click="openModalQR('additionally')"
          >Оплата онлайн (QR)
        </UIActionButton2>
        <UIActionButton2
          v-if="
            user.additionally1 === 'WRITE' &&
            (user.username === 'Директор' ||
              user.username === 'Горцуева' ||
              user.username === 'Светлана1' ||
              user.username === 'Светлана3' ||
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
          <UIActionButton2 @click="openModalQR('additionally1-1')"
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
        <UIActionButton2 @click="updateDeliveryRows('additionally4')"
          >Отказ подмена
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
        v-if="user.deliveredPVZ1 === 'WRITE' && showButtonPVZ"
        @click="updateDeliveryRows('PVZ')"
        >Доставить на пвз
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
          @click="openModalQR('additionally')"
          >Оплата онлайн (QR)
        </UIActionButton2>
        <UIActionButton2
          v-if="
            user.additionally1 === 'WRITE' &&
            (user.username === 'Директор' ||
              user.username === 'Горцуева' ||
              user.username === 'Светлана1' ||
              user.username === 'Светлана3' ||
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
          <UIActionButton2 @click="openModalQR('additionally1-1')"
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
        <UIActionButton2 @click="updateDeliveryRows('additionally4')"
          >Отказ подмена
        </UIActionButton2>
      </div>
    </div>

    <div
      v-if="
        user.role === 'ADMIN' ||
        user.role === 'ADMINISTRATOR' ||
        user.role === 'RMANAGER'
      "
    >
      <UButton
        class="font-semibold"
        @click="showButtonsRows"
        v-if="!isShowButtonsRows"
        >Показать кнопки</UButton
      >
      <UButton
        class="font-semibold"
        @click="showButtonsRows"
        v-if="isShowButtonsRows"
        >Скрыть кнопки</UButton
      >
    </div>

    <div class="py-3 flex max-sm:flex-col gap-3 max-sm:w-full">
      <h1
        v-if="
          (user.role === 'ADMIN' ||
            user.role === 'ADMINISTRATOR' ||
            user.role === 'RMANAGER') &&
          isShowButtonsRows
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
      <h1
        v-if="user.username === 'Горцуева' && isShowButtonsRows"
        class="bg-green-400 px-5 py-1.5 text-white font-semibold rounded-md border-green-400 border-2 hover:bg-transparent hover:text-black duration-200 cursor-pointer"
        @click="changeWaitingRows(), showWaitingRows()"
      >
        Долго в пути {{ waitingRows?.length }} товаров
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

    <!-- <div
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
              'bg-green-400 text-white font-bold': isWaiting(row),
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
                row.additionally !== 'Отказ подмена' &&
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
                row.additionally !== 'Отказ подмена' &&
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
                row.additionally !== 'Отказ подмена' &&
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
                  row.additionally === 'Отказ брак' ||
                  row.additionally === 'Отказ подмена')
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
    </div> -->

    <div class="mt-5 mb-10">
      <UTable
        v-if="returnRows.length"
        class="w-full z-[20] overflow-x-visible mx-auto text-center rounded-md mt-5"
        :class="{ 'overflow-x-hidden max-h-[100px]': isShowModalValue }"
        :ui="{ wrapper: 'relative bg-white',
  td: {
    base: 'border-[1px] text-center whitespace-normal',
    padding: 'px-3 py-1',
  },
  th: {
    base: 'text-center uppercase border-[1px] sticky top-0 z-[20] bg-white',
    padding: 'px-1',
    size: 'text-xs'
  },
  default:
  {
    checkbox:
      { color: 'gray' as any }
  },
    }"
        :rows="returnRows"
        :columns="columns"
      >
        <template #select-data="{ row }">
          <input
            v-if="user.dataOurRansom === 'WRITE'"
            class="h-3 w-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded-sm bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color"
            type="checkbox"
            :value="row.id"
            :checked="isChecked(row.id)"
            @change="handleCheckboxChange(row)"
          />
        </template>

        <template #id-data="{ row }">
          <NuxtLink
            v-if="
              user.role !== 'PVZ' &&
              user.role !== 'ADMINISTRATOR' &&
              user.role !== 'RMANAGER' &&
              user.role !== 'PPVZ'
            "
            class="cursor-pointer text-secondary-color hover:opacity-50 duration-200 font-semibold"
            :to="`/spreadsheets/record/1/${row.id}`"
          >
            {{ row.id }}
          </NuxtLink>
          <h1 v-else>{{ row.id }}</h1>
        </template>

        <template #clientLink1-data="{ row }">
          <div class="flex items-center gap-2 justify-center">
            <NuxtLink
              v-if="user.clientLink1 === 'READ' || user.clientLink1 === 'WRITE'"
              class="cursor-pointer hover:opacity-50 duration-200 bg-secondary-color text-white font-bold w-6 h-6 rounded-full flex items-center justify-center"
              target="_blank"
              :to="`/spreadsheets/order/${row.clientLink1}`"
            >
              <Icon name="i-uil-external-link-alt" class="font-bold" />
            </NuxtLink>

            <div
              v-if="user.clientLink1 === 'READ' || user.clientLink1 === 'WRITE'"
              class="cursor-pointer hover:opacity-50 duration-200 bg-secondary-color text-white font-bold w-6 h-6 rounded-full flex items-center justify-center"
              @click="
                writeClipboardText(
                  `https://darom.pro/spreadsheets/order/${row.clientLink1}`
                )
              "
            >
              <Icon name="material-symbols:content-copy" class="font-bold" />
            </div>
          </div>
        </template>

        <template #cell-data="{ row }">
          <p v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'">
            {{ row.cell }}
          </p>
        </template>

        <template #fromName-data="{ row }">
          <NuxtLink
            v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'"
            class="cursor-pointer hover:text-orange-200 duration-200 text-secondary-color font-semibold"
            :to="`/phone/${row.fromName}`"
          >
            {{ row.fromName }}
          </NuxtLink>
        </template>

        <template #productLink-data="{ row }">
          <a
            :href="row.productLink"
            target="_blank"
            v-if="user.productLink1 === 'READ' || user.productLink1 === 'WRITE'"
            class="cursor-pointer hover:opacity-50 duration-200 bg-secondary-color text-white rounded-sm px-2 py-1 font-bold"
          >
            Перейти
          </a>
        </template>

        <template #productName-data="{ row }">
          <p
            v-if="user.productName1 === 'READ' || user.productName1 === 'WRITE'"
          >
            {{ row.productName }}
          </p>
        </template>

        <template #notation-data="{ row }">
          <p
            :class="{
              'bg-yellow-300 text-white font-semibold px-1': row.notation,
            }"
            v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'"
          >
            {{ row.notation ? row.notation : "Пусто" }}
          </p>
        </template>

        <template #priceSite-data="{ row }">
          <p v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'">
            {{ row.priceSite }}
          </p>
        </template>

        <template #prepayment-data="{ row }">
          <p v-if="user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'">
            {{ row.prepayment }}
          </p>
        </template>

        <template #percentClient-data="{ row }">
          <p
            v-if="
              user.percentClient1 === 'READ' || user.percentClient1 === 'WRITE'
            "
          >
            {{ row.percentClient }}
          </p>
        </template>

        <template #deliveredKGT-data="{ row }">
          <p
            v-if="
              user.deliveredKGT1 === 'READ' || user.deliveredKGT1 === 'WRITE'
            "
          >
            {{ row.deliveredKGT }}
          </p>
        </template>

        <template #amountFromClient1-data="{ row }">
          <p v-if="!isDateGreaterThanReference(row.created_at)">
            {{ Math.ceil(+row.amountFromClient1 / 10) * 10 }}
          </p>
          <p v-if="isDateGreaterThanReference(row.created_at)">
            {{ +roundToNearestTen(+row.amountFromClient1) }}
          </p>
        </template>

        <template #dispatchPVZ-data="{ row }">
          <p
            v-if="user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'"
          >
            {{ row.dispatchPVZ }}
          </p>
        </template>

        <template #orderPVZ-data="{ row }">
          <p v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'">
            {{ row.orderPVZ }}
          </p>
        </template>

        <template #orderAccount-data="{ row }">
          <p
            v-if="user.orderAccount === 'READ' || user.orderAccount === 'WRITE'"
          >
            {{ row.orderAccount }}
          </p>
        </template>

        <template #deliveredSC-data="{ row }">
          <p
            v-if="user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'"
            class="font-bold text-green-500"
          >
            {{
              row.deliveredSC
                ? storeUsers.getNormalizedDate(row.deliveredSC)
                : ""
            }}
          </p>
        </template>

        <template #deliveredPVZ-data="{ row }">
          <p
            v-if="
              user.deliveredPVZ1 === 'READ' || user.deliveredPVZ1 === 'WRITE'
            "
            class="font-bold text-green-500"
          >
            {{
              row.deliveredPVZ
                ? storeUsers.getNormalizedDate(row.deliveredPVZ)
                : ""
            }}
          </p>
        </template>

        <template #issued-data="{ row }">
          <p
            v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'"
            class="font-bold text-green-500"
          >
            {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
          </p>
        </template>

        <template #additionally-data="{ row }">
          <p
            v-if="
              user.additionally1 === 'READ' || user.additionally1 === 'WRITE'
            "
          >
            {{ row.additionally ? row.additionally : "Пусто" }}
          </p>
        </template>

        <template #profit1-data="{ row }">
          <p
            v-if="
              (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
              row.additionally !== 'Отказ клиент' &&
              row.additionally !== 'Отказ клиент онлайн' &&
              row.additionally !== 'Отказ клиент наличные' &&
              row.additionally !== 'Отказ брак' &&
              row.additionally !== 'Отказ подмена' &&
              !row.prepayment &&
              !isDateGreaterThanReference(row.created_at)
            "
          >
            {{
              Math.ceil(row.amountFromClient1 / 10) * 10 -
              row.priceSite +
              row.deliveredKGT
            }}
          </p>

          <p
            v-if="
              (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
              row.additionally !== 'Отказ клиент' &&
              row.additionally !== 'Отказ клиент онлайн' &&
              row.additionally !== 'Отказ клиент наличные' &&
              row.additionally !== 'Отказ брак' &&
              row.additionally !== 'Отказ подмена' &&
              !row.prepayment &&
              isDateGreaterThanReference(row.created_at)
            "
          >
            {{
              roundToNearestTen(row.amountFromClient1) -
              row.priceSite +
              row.deliveredKGT
            }}
          </p>

          <p
            v-if="
              (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
              row.additionally !== 'Отказ клиент' &&
              row.additionally !== 'Отказ клиент онлайн' &&
              row.additionally !== 'Отказ клиент наличные' &&
              row.additionally !== 'Отказ брак' &&
              row.additionally !== 'Отказ подмена' &&
              row.prepayment
            "
          >
            {{
              row.percentClient !== 0
                ? Math.ceil(
                    (row.priceSite * row.percentClient) / 100 + row.deliveredKGT
                  )
                : row.deliveredKGT
            }}
          </p>

          <p
            v-if="
              (user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
              (row.additionally === 'Отказ клиент' ||
                row.additionally === 'Отказ клиент онлайн' ||
                row.additionally === 'Отказ клиент наличные' ||
                row.additionally === 'Отказ брак' ||
                row.additionally === 'Отказ подмена')
            "
          >
            {{ row.profit1 }}
          </p>
        </template>

        <template
          v-if="
            user.username === 'Директор' ||
            user.username === 'Власенкова' ||
            user.username === 'Горцуева' ||
            user.username === 'Шведова' ||
            user.username.includes('Светлана')
          "
          #actions-data="{ row }"
        >
          <UDropdown :open="dropdownStates[row.id]" :items="itemsTable(row)">
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

        <template
          v-if="
            user.username === 'Директор' ||
            user.username === 'Власенкова' ||
            user.username === 'Горцуева' ||
            user.username === 'Шведова' ||
            user.username.includes('Светлана')
          "
          #expand="{ row }"
        >
          <div class="px-4 py-2 text-left text-sm text-gray-400">
            <h1
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              Дата создания: {{ storeUsers.getNormalizedDate(row.created_at) }}
            </h1>
            <h1
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              Дата последнего изменения:
              {{ storeUsers.getNormalizedDate(row.updated_at) }}
            </h1>
            <h1
              v-if="
                (user.role === 'ADMIN' ||
                  user.role === 'ADMINISTRATOR' ||
                  user.role === 'RMANAGER') &&
                row.deleted
              "
            >
              Дата удаления: {{ storeUsers.getNormalizedDate(row.deleted) }}
            </h1>
            <h1
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              Создан: {{ row.createdUser }}
            </h1>
            <h1
              v-if="
                user.role === 'ADMIN' ||
                user.role === 'ADMINISTRATOR' ||
                user.role === 'RMANAGER'
              "
            >
              Изменен: {{ row.updatedUser }}
            </h1>
          </div>
        </template>
      </UTable>
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
          <h1
            v-if="!qrBody.Data?.Operation[0]?.purpose.includes('Отказ')"
            class="text-center mb-1"
          >
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
