<script setup lang="ts">
import { read, utils, writeFile, write } from "xlsx";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://mgbbkkgyorhwryabwabx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nYmJra2d5b3Jod3J5YWJ3YWJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzE0NjQ5OCwiZXhwIjoyMDE4NzIyNDk4fQ.Ogcld2z2P5M3V5N2yEpyfmHPsXor9Mv_5fUya5wgEoY"
);

const router = useRouter();
const route = useRoute();

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();

const emit = defineEmits([
  "openModal",
  "deleteRow",
  "deleteSelectedRows",
  "updateDeliveryRows",
  "createCopyRow",
  "showDeletedRows",
]);

function updateDeliveryRows(flag: string, allSumData: string = "0") {
  emit("updateDeliveryRows", {
    idArray: checkedRows.value,
    flag: flag,
    allSum: allSumData,
  });
  checkedRows.value = [];
  allSum.value = [];
  getAllSum.value = 0;
}

function openModal(row: IOurRansom) {
  emit("openModal", row);
}

function showDeletedRowsEmit(flag: boolean) {
  emit("showDeletedRows", flag);
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

async function exportToExcelOnServer() {
  perPage.value = await totalRows.value;
  await updateCurrentPageDataDeleted();

  let table = await document.querySelector("#theTable");

  let wb = await utils.table_to_book(table);
  let wbout = write(wb, { type: "binary", bookType: "xlsx" });

  let buf = new ArrayBuffer(wbout.length);
  let view = new Uint8Array(buf);
  for (let i = 0; i < wbout.length; i++) {
    view[i] = wbout.charCodeAt(i) & 0xff;
  }

  let blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, "0");
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const year = currentDate.getFullYear().toString();

  const { data, error } = await supabase.storage
    .from("data")
    .upload(`data-1-${day}.${month}.${year}.xlsx`, blob);

  perPage.value = await 100;
}

async function exportToExcel() {
  perPage.value = await totalRows.value;
  await updateCurrentPageDataDeleted();

  let table = await document.querySelector("#theTable");

  let wb = await utils.table_to_book(table);
  await writeFile(wb, "наш_выкуп.xlsx");

  perPage.value = await 100;

  // let formData = new FormData();
  // formData.append("chat_id", "-1002055393875");
  // formData.append("document", blob, 'наш_выкуп.xlsx');
  // formData.append("caption", "Дата и время: " + getCurrentDateTime());

  // let response = await fetch("https://api.telegram.org/bot6997552821:AAH_0b0457h-oNj4DxBnQCBylpX5xZVo6Fc/sendDocument", {
  //     method: "POST",
  //     body: formData
  // });

  // let data = await response.json();
  // console.log(data);

  // await writeFile(wb, "наш_выкуп.xlsx");
}

// function getCurrentDateTime() {
//     let options = {
//         year: 'numeric',
//         month: 'numeric',
//         day: 'numeric',
//         hour: 'numeric',
//         minute: 'numeric',
//         second: 'numeric',
//         timeZone: 'Europe/Moscow',
//         timeZoneName: 'short'
//     };
//     return new Date().toLocaleString('ru-RU', options);
// }

// async function sendFileToTelegram(file: any) {
//   const token = "6997552821:AAH_0b0457h-oNj4DxBnQCBylpX5xZVo6Fc";
//   const chatId = "-1002055393875";

//   const url = `https://api.telegram.org/bot${token}/sendDocument`;

//   const formData = new FormData();
//   formData.append("chat_id", chatId);
//   formData.append("document", file, "наш_выкуп.xlsx");

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       body: formData,
//     });
//     const data = await response.json();
//     console.log(data);
//     console.log(formData);
//   } catch (error) {
//     console.error("Error sending file to Telegram:", error);
//   }
// }

const allSum: Ref<RowData[]> = ref([]);
const checkedRows: Ref<number[]> = ref([]);

const getAllSum: Ref<number> = ref(0);
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
    let rowData = await storeRansom.getRansomRowsById(+scannedLink, "OurRansom");
    handleCheckboxChange(rowData);
    scanStringItem.value = "";
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

const handleCheckboxChange = (row: IOurRansom): void => {
  if (isChecked(row.id)) {
    checkedRows.value = checkedRows.value.filter((id) => id !== row.id);
    allSum.value = allSum.value.filter((obj) => obj.rowId !== row.id);
  } else {
    checkedRows.value.push(row.id);
    allSum.value.push({
      rowId: row.id,
      amount: Math.ceil(row.amountFromClient1 / 10) * 10,
      issued: row.issued,
      deliveredPVZ: row.deliveredPVZ,
      orderPVZ: row.orderPVZ,
      deliveredSC: row.deliveredSC,
    });
  }
  getAllSum.value = allSum.value
    .filter((obj) => obj.issued === null)
    .reduce((sum, obj) => sum + obj.amount, 0);
  showButton.value = allSum.value.every((obj) => obj.issued === null);
  showButtonPVZ.value = allSum.value.every((obj) => obj.deliveredPVZ === null);
  showButtonSC.value = allSum.value.every((obj) => obj.deliveredSC === null);
};

const showDeletedRows = ref(false);

const perPage = ref(100);
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil((props.rows?.length || 0) / perPage.value));
const totalRows = computed(() =>
  Math.ceil(props.rows?.filter((row) => row.deleted === null).length || 0)
);

let returnRows = ref<Array<IOurRansom>>();
let expiredRows = ref<Array<IOurRansom>>([]);
let processingRows = ref<Array<IOurRansom>>([]);

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

  if (props.user.role === "RMANAGER" || props.user.role === 'PPVZ') {
    returnRows.value = props.rows?.filter(
      (row) => row.dispatchPVZ && row.dispatchPVZ.includes(props.user.PVZ)
    );
    expiredRows.value = []
    processingRows.value = []
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

  if (props.user.role === "RMANAGER" || props.user.role === 'PPVZ') {
    returnRows.value = props.rows?.filter(
      (row) => row.dispatchPVZ && row.dispatchPVZ.includes(props.user.PVZ)
    );
  }
}

watch([currentPage, totalRows, props.rows, returnRows.value], updateCurrentPageData);

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

onMounted(async () => {
  focusInput();

  updateCurrentPageData();

  if (props.user.role === "SORTIROVKA") {
    perPage.value = totalRows.value;
    updateCurrentPageData();
  }

  await storeRansom.getSumOfRejection();

  downloadIssuedRowsTimer();
});

let showOthersVariants = ref(false);
const myInput = ref(null);

let isScanActive = ref(false);
function focusInput() {
  myInput.value.focus();
  isScanActive.value = true;
}

function downloadIssuedRowsTimer() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  if (
    (currentHour === 20 && currentMinute >= 0) ||
    (currentHour === 23 && currentMinute <= 59)
  ) {
    exportToExcelOnServer();
  }
}

function isExpired(row: any) {
  if (row.deliveredSC !== null && row.deliveredPVZ !== null && row.issued === null) {
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
let showProcessingRowsFlag = ref(false);
function showProcessingRows() {
  if (showProcessingRowsFlag.value === false) {
    showProcessingRowsFlag.value = true;
    returnRows.value = processingRows.value;
    perPage.value = 2000;
  } else {
    showProcessingRowsFlag.value = false;
    perPage.value = 100;
    updateCurrentPageDataDeleted();
  }
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
</script>

<template>
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
      <div class="flex items-center max-sm:flex-col max-sm:items-start gap-5 mb-5">
        <h1 class="text-xl" v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'">
          Товаров в работе:
          <span class="text-secondary-color font-bold">{{ totalRows }}</span>
        </h1>
        <h1 class="text-xl" v-if="user.role === 'PVZ' || user.role === 'PPVZ'">
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
          {{ showDeletedRows ? "Скрыть удаленное" : "Показать удаленное за неделю" }}
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
            <Icon name="material-symbols:arrow-back-ios-new-rounded" class="text-white" />
          </button>
          <button
            @click="nextPage(), updateCurrentPageData()"
            :disabled="currentPage === totalPages"
            class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
          >
            <Icon name="material-symbols:arrow-forward-ios-rounded" class="text-white" />
          </button>
        </div>
      </div>
      <Icon
        class="duration-200 hover:text-secondary-color cursor-pointer"
        size="40"
        name="material-symbols:sheets-add-on"
        @click="exportToExcel"
      />
    </div>
  </div>

  <div
    class="fixed top-16 z-40 left-1/2 translate-x-[-50%] translate-y-[-50%]"
    v-if="getAllSum > 0"
  >
    <h1
      class="text-base text-center backdrop-blur-xl p-2 rounded-xl border-2 text-secondary-color font-bold"
    >
      К оплате: {{ getAllSum }} <br />
      Количество товаров: {{ checkedRows.length }}
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
        @click="updateDeliveryRows('additionally', getAllSum)"
        >Оплата онлайн
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
        @click="updateDeliveryRows('additionally')"
        >Оплата онлайн
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

  <div class="flex flex-col">
    <span
      v-if="
        user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' || user.role === 'RMANAGER'
      "
      class="text-xl text-red-500 font-bold hover:opacity-50 cursor-pointer duration-200"
      @click="showExpiredRows"
    >
      Истекает срок хранения {{ expiredRows?.length }} товаров
    </span>
    <span
      v-if="
        user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' || user.role === 'RMANAGER'
      "
      class="text-xl text-yellow-400 font-bold hover:opacity-50 cursor-pointer duration-200"
      @click="showProcessingRows"
    >
      Ждут обработку {{ processingRows?.length }} товаров
    </span>
  </div>

  <div class="relative max-h-[610px] mt-5 mb-10 mr-5">
    <div id="up"></div>
    <table
      id="theTable"
      class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50"
      >
        <tr>
          <th scope="col" class="border-2" v-if="user.dataOurRansom === 'WRITE'">
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
            v-if="user.productLink1 === 'READ' || user.productLink1 === 'WRITE'"
          >
            товар (ссылка)
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.productName1 === 'READ' || user.productName1 === 'WRITE'"
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
            v-if="user.percentClient1 === 'READ' || user.percentClient1 === 'WRITE'"
          >
            процент с клиента (%)
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.deliveredKGT1 === 'READ' || user.deliveredKGT1 === 'WRITE'"
          >
            дополнительный доход
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.amountFromClient1 === 'READ' || user.amountFromClient1 === 'WRITE'"
          >
            сумма с клиента
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'"
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
            v-if="user.orderAccount === 'READ' || user.orderAccount === 'WRITE'"
          >
            аккаунт заказа
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'"
          >
            доставлено на сц
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.deliveredPVZ1 === 'READ' || user.deliveredPVZ1 === 'WRITE'"
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
            v-if="user.additionally1 === 'READ' || user.additionally1 === 'WRITE'"
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
          <td v-if="user.dataOurRansom === 'WRITE'" class="border-2 text-secondary-color">
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
          <td v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'" class="border-2">
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
            v-if="user.productLink1 === 'READ' || user.productLink1 === 'WRITE'"
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
            v-if="user.productName1 === 'READ' || user.productName1 === 'WRITE'"
          >
            {{ row.productName }}
          </td>
          <td
            class="border-2"
            v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'"
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
            v-if="user.percentClient1 === 'READ' || user.percentClient1 === 'WRITE'"
          >
            {{ row.percentClient }}
          </td>
          <td
            class="border-2"
            v-if="user.deliveredKGT1 === 'READ' || user.deliveredKGT1 === 'WRITE'"
          >
            {{ row.deliveredKGT }}
          </td>
          <td
            class="border-2"
            v-if="user.amountFromClient1 === 'READ' || user.amountFromClient1 === 'WRITE'"
          >
            {{ Math.ceil(row.amountFromClient1 / 10) * 10 }}
          </td>
          <td
            class="px-2 py-4 border-2"
            v-if="user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'"
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
            v-if="user.orderAccount === 'READ' || user.orderAccount === 'WRITE'"
          >
            {{ row.orderAccount }}
          </td>
          <td
            class="border-2"
            v-if="user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'"
          >
            <h1 class="font-bold text-green-500">
              {{ row.deliveredSC ? storeUsers.getNormalizedDate(row.deliveredSC) : "" }}
            </h1>
          </td>
          <td
            class="border-2"
            v-if="user.deliveredPVZ1 === 'READ' || user.deliveredPVZ1 === 'WRITE'"
          >
            <h1 class="font-bold text-green-500">
              {{ row.deliveredPVZ ? storeUsers.getNormalizedDate(row.deliveredPVZ) : "" }}
            </h1>
          </td>
          <td class="border-2" v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'">
            <h1 class="font-bold text-green-500">
              {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
            </h1>
          </td>
          <td
            class="px-6 py-4 border-2"
            v-if="user.additionally1 === 'READ' || user.additionally1 === 'WRITE'"
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
              !row.prepayment
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
              row.prepayment
            "
          >
            {{
              row.percentClient !== 0
                ? Math.ceil((row.priceSite * row.percentClient) / 100 + row.deliveredKGT)
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
            <h1 @click="deleteRow(row.id)" class="cursor-pointer">❌</h1>
          </td>
          <div id="right"></div>
        </tr>
      </tbody>
    </table>
    <div id="down"></div>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
