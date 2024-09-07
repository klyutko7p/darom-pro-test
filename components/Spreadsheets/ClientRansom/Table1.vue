<script setup lang="ts">
import { read, utils, writeFile } from "xlsx";
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const toast = useToast();
const emit = defineEmits([
  "openModal",
  "deleteRow",
  "deleteSelectedRows",
  "updateDeliveryRows",
  "createCopyRow",
]);

function updateDeliveryRows(flag: string) {
  emit("updateDeliveryRows", { idArray: checkedRows.value, flag: flag });
  checkedRows.value = [];
  allSum.value = [];
  getAllSum.value = 0;
}

function openModal(row: IClientRansom) {
  emit("openModal", row);
}

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
  rows: { type: Array as PropType<IClientRansom[]> },
  pvzLink: { type: String },
});

async function exportToExcel() {
  perPage.value = await totalRows.value;
  await updateCurrentPageData();

  let table = await document.querySelector("#theTable");

  let wb = await utils.table_to_book(table);

  await writeFile(wb, "выкуп_клиента.xlsx");

  perPage.value = await 100;
}

interface RowData {
  rowId: number;
  amount: number;
  issued: Date | null | string | number;
  deliveredPVZ: Date | null | string | number;
  orderPVZ: Date | null | string | number;
}

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

function isDateGreaterThanReference(dateString: string | Date): boolean {
  const referenceDate = new Date("2024-06-05T00:00:01");
  const inputDate = new Date(dateString);
  return inputDate > referenceDate;
}

function roundToNearestTen(num: number): number {
  const lastDigit = num % 10;
  if (lastDigit >= 5) {
    return Math.ceil(num / 10) * 10;
  } else {
    return Math.floor(num / 10) * 10;
  }
}

const handleCheckboxChange = (row: IClientRansom): void => {
  if (isChecked(row.id)) {
    checkedRows.value = checkedRows.value.filter((id) => id !== row.id);
    allSum.value = allSum.value.filter((obj) => obj.rowId !== row.id);
  } else {
    checkedRows.value.push(row.id);
    let amountData = 0;
    if (isDateGreaterThanReference(row.created_at)) {
      amountData = roundToNearestTen(row.amountFromClient2);
    } else {
      amountData = Math.ceil(row.amountFromClient2 / 10) * 10;
    }
    allSum.value.push({
      rowId: row.id,
      amount: Math.ceil(row.amountFromClient2 / 10) * 10,
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
const totalPages = computed(() =>
  Math.ceil((props.rows?.length || 0) / perPage.value)
);
const totalRows = computed(() => Math.ceil(props.rows?.length || 0));

let returnRows = ref<Array<IClientRansom>>();

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

  // if (props.user.role === "RMANAGER") {
  //   returnRows.value = props.rows?.filter(
  //     (row) => row.dispatchPVZ && row.dispatchPVZ.includes(props.user.PVZ)
  //   );
  // }

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
}

watch([currentPage, totalRows, props.rows], updateCurrentPageData);

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

const toggleShowDeletedRows = () => {
  showDeletedRows.value = !showDeletedRows.value;
  updateCurrentPageData();
};

let isVisiblePages = ref(true);

onMounted(async () => {
  updateCurrentPageData();

  if (props.user.role === "SORTIROVKA") {
    perPage.value = totalRows.value;
    updateCurrentPageData();
  }

  await storeRansom.getSumOfRejection();
});

const router = useRouter();

let showOthersVariants = ref(false);

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

let showPayRejectClient = ref(false);
let processingRows = ref<Array<IClientRansom>>([]);

let showProcessingRowsFlag = ref(
  Cookies.get("showProcessingRowsFlag") === "true"
);

function showProcessingRows() {
  if (showProcessingRowsFlag.value === true) {
    returnRows.value = processingRows.value;
    perPage.value = 2000;
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
const storeQR = useQRStore();
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
    "Онлайн оплата доставки"
  );
  await checkPaymentStatus(qrBodyInfo.value.Data.qrcId);
  qrBody.value = await storeQR.getQRCode(qrBodyInfo.value.Data.qrcId);
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
    updateDeliveryRows("additionally");
  }
}

function closeModalAfterDelay() {
  setTimeout(() => {
    isOpenModalStatus.value = false;
    if (paymentStatusMessage.value) {
      updateDeliveryRows("additionally");
    }
  }, 6000);
}

async function checkPaymentStatus(qrcId: string) {
  const interval = 3000;

  intervalId.value = setInterval(async () => {
    try {
      let paymentData = (await storeQR.getPaymentStatusQR(
        qrcId
      )) as QRPaymentStatus;

      if (
        paymentData.Data &&
        paymentData.Data.paymentList &&
        paymentData.Data.paymentList.length > 0
      ) {
        const status = paymentData.Data.paymentList[0].status;
        paymentStatusMessage.value = status;

        if (status === "Accepted") {
          toast.success("Операция завершена успешно!");
          closeModalQR();
          isOpenModalStatus.value = true;
          closeModalAfterDelay();
          clearInterval(intervalId.value);
        } else if (status === "Rejected") {
          toast.error("Операция отклонена!");
          closeModalQR();
          isOpenModalStatus.value = true;
          closeModalAfterDelay();
          clearInterval(intervalId.value);
        }
      } else {
        console.error("Статус платежа не найден или не существует.");
      }
    } catch (error) {
      console.error("Ошибка при получении статуса платежа:", error);
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

watch(isOpenModalQR, (newValue) => {
  if (newValue) {
    lockScroll();
  } else {
    unlockScroll();
  }
});
</script>

<template>
  <div v-if="!isLoading">
    <div class="flex items-center justify-between max-lg:block mt-10">
      <div>
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
          <UIActionButton @click="toggleShowDeletedRows">
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
      class="fixed top-24 z-40 left-1/2 translate-x-[-50%] translate-y-[-50%]"
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
        user.dataClientRansom === 'WRITE' &&
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
          user.deliveredPVZ2 === 'WRITE' &&
          showButtonPVZ &&
          user.role === 'ADMIN'
        "
        @click="updateDeliveryRows('PVZ')"
        >Доставить на пвз
      </UIActionButton>
      <UIActionButton
        v-if="user.deliveredSC2 === 'WRITE' && showButtonSC"
        @click="updateDeliveryRows('SC')"
        >Доставить на сц
      </UIActionButton>
      <UIActionButton
        v-if="user.issued2 === 'WRITE' && showButton"
        @click="showOthersVariants = !showOthersVariants"
      >
        Выдать клиенту
      </UIActionButton>
      <div v-if="showOthersVariants" class="flex flex-col gap-3">
        <UIActionButton2
          v-if="user.additionally2 === 'WRITE'"
          @click="updateDeliveryRows('additionally3')"
          >Оплата наличными
        </UIActionButton2>
        <UIActionButton2
          v-if="user.additionally2 === 'WRITE' && getAllSum > 0"
          @click="openModalQR"
          >Оплата онлайн (QR)
        </UIActionButton2>
        <UIActionButton2
          v-if="user.additionally2 === 'WRITE'"
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
          v-if="user.additionally2 === 'WRITE'"
          @click="updateDeliveryRows('additionally2')"
          >Отказ брак
        </UIActionButton2>
      </div>
    </div>

    <div
      class="fixed z-40 flex flex-col gap-3 top-44 left-1/2 translate-x-[-50%] translate-y-[-50%]"
      v-if="
        user.dataClientRansom === 'WRITE' &&
        checkedRows.length > 0 &&
        (user.role === 'PVZ' || user.role === 'PPVZ')
      "
    >
      <UIActionButton
        v-if="user.issued2 === 'WRITE' && showButton"
        @click="showOthersVariants = !showOthersVariants"
      >
        Выдать клиенту
      </UIActionButton>
      <div v-if="showOthersVariants" class="flex flex-col gap-3">
        <UIActionButton2
          v-if="user.additionally2 === 'WRITE'"
          @click="updateDeliveryRows('additionally3')"
          >Оплата наличными
        </UIActionButton2>
        <UIActionButton2
          v-if="user.additionally2 === 'WRITE' && getAllSum > 0"
          @click="openModalQR"
          >Оплата онлайн (QR)
        </UIActionButton2>
        <UIActionButton2
          v-if="user.additionally2 === 'WRITE'"
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
          v-if="user.additionally2 === 'WRITE'"
          @click="updateDeliveryRows('additionally2')"
          >Отказ брак
        </UIActionButton2>
      </div>
    </div>

    <div class="py-3 flex max-sm:flex-col gap-5 max-sm:w-full">
      <span
        v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
        class="bg-yellow-400 px-5 py-3 text-white font-bold rounded-full border-yellow-400 border-2 hover:bg-transparent hover:text-black duration-200 cursor-pointer"
        @click="changeProcessingRows(), showProcessingRows()"
      >
        Ждут обработку {{ processingRows?.length }} товаров
      </span>
    </div>

    <div :class="{'overflow-x-auto max-h-[300px] overflow-y-auto': isOpenModalQR}" class="relative mt-5 mb-10 mr-5">
      <div id="up"></div>
      <table
        id="theTable"
        class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500"
        v-if="totalRows > 0"
      >
        <thead
          class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50"
        >
          <tr>
            <th
              scope="col"
              class="border-2"
              v-if="user.dataClientRansom === 'WRITE'"
            >
              Выделение
            </th>
            <th
              scope="col"
              class="exclude-row border-2 text-[10px]"
              v-if="
                (user.dataClientRansom === 'WRITE' && user.role === 'ADMIN') ||
                user.role === 'SORTIROVKA' ||
                user.username === 'Волошина'
              "
            >
              изменение
            </th>
            <th scope="col" class="border-2 px-3">id</th>
            <th scope="col" class="border-2 px-3">Штрих-код</th>
            <th
              scope="col"
              class="border-2"
              v-if="user.clientLink2 === 'READ' || user.clientLink2 === 'WRITE'"
            >
              ссылка для клиента
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.cell2 === 'READ' || user.cell2 === 'WRITE'"
            >
              ячейка
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.fromName2 === 'READ' || user.fromName2 === 'WRITE'"
            >
              телефон
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.productLink2 === 'READ' || user.productLink2 === 'WRITE'
              "
            >
              маркетплейс
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.productName2 === 'READ' || user.productName2 === 'WRITE'
              "
            >
              количество товаров
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.priceProgram === 'READ' || user.priceProgram === 'WRITE'
              "
            >
              стоимость выкупа товара
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.prepayment2 === 'READ' || user.prepayment2 === 'WRITE'"
            >
              предоплата
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.percentClient2 === 'READ' ||
                user.percentClient2 === 'WRITE'
              "
            >
              процент с клиента (%)
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.deliveredKGT2 === 'READ' || user.deliveredKGT2 === 'WRITE'
              "
            >
              дополнительный доход
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.amountFromClient2 === 'READ' ||
                user.amountFromClient2 === 'WRITE'
              "
            >
              сумма с клиента
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.dispatchPVZ2 === 'READ' || user.dispatchPVZ2 === 'WRITE'
              "
            >
              отправка в пвз
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.orderPVZ2 === 'READ' || user.orderPVZ2 === 'WRITE'"
            >
              заказано на сц
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.deliveredSC2 === 'READ' || user.deliveredSC2 === 'WRITE'
              "
            >
              доставлено на сц
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.deliveredPVZ2 === 'READ' || user.deliveredPVZ2 === 'WRITE'
              "
            >
              доставлено на пвз
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.issued2 === 'READ' || user.issued2 === 'WRITE'"
            >
              выдан клиенту
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="
                user.additionally2 === 'READ' || user.additionally2 === 'WRITE'
              "
            >
              дополнительно
            </th>
            <th
              scope="col"
              class="border-2"
              v-if="user.profit2 === 'READ' || user.profit2 === 'WRITE'"
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
              class="exclude-row border-2"
              v-if="user.dataClientRansom === 'WRITE' && user.role === 'ADMIN'"
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
            }"
            class="border-b text-center text-sm"
            v-for="row in returnRows"
          >
            <td
              v-if="user.dataClientRansom === 'WRITE'"
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
                (user.dataClientRansom === 'WRITE' && user.role === 'ADMIN') ||
                user.role === 'SORTIROVKA' ||
                user.username === 'Волошина'
              "
            >
              <div
                @click="openModal(row)"
                class="bg-green-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
              >
                <Icon
                  class="text-green-500"
                  name="ic:baseline-mode-edit"
                  size="18"
                />
              </div>
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
                :to="`/spreadsheets/record/2/${row.id}`"
              >
                {{ row.id }}
              </NuxtLink>
              <h1 v-else>{{ row.id }}</h1>
            </th>
            <td
              scope="row"
              class="border-2 font-medium underline text-secondary-color whitespace-nowrap"
            >
              <a
                target="_blank"
                class="text-secondary-color hover:opacity-60 duration-200 font-bold"
                v-if="row.img && row.img.length > 2"
                :href="`https://fomoljxhkywsdgnchewy.supabase.co/storage/v1/object/public/image/img-${row.img}`"
              >
                Фото
              </a>
            </td>
            <td
              class="px-3 py-4 border-2 underline text-secondary-color whitespace-nowrap uppercase overflow-hidden max-w-[50px]"
              v-if="user.clientLink2 === 'READ' || user.clientLink2 === 'WRITE'"
            >
              <NuxtLink
                target="_blank"
                class="cursor-pointer hover:text-orange-200 duration-200"
                :to="`/spreadsheets/order/${row.clientLink2}`"
              >
                {{ row.clientLink2 }}
              </NuxtLink>
            </td>
            <td
              v-if="user.cell2 === 'READ' || user.cell2 === 'WRITE'"
              class="border-2"
            >
              {{ row.cell }}
            </td>
            <td
              v-if="user.fromName2 === 'READ' || user.fromName2 === 'WRITE'"
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
              class="border-2 whitespace-nowrap overflow-hidden max-w-[30px]"
              v-if="
                user.productLink2 === 'READ' || user.productLink2 === 'WRITE'
              "
            >
              {{ row.productLink }}
            </td>
            <td
              class="border-2"
              v-if="
                user.productName2 === 'READ' || user.productName2 === 'WRITE'
              "
            >
              {{ row.productName }}
            </td>
            <td
              class="border-2"
              v-if="
                user.priceProgram === 'READ' || user.priceProgram === 'WRITE'
              "
            >
              {{ row.priceProgram }}
            </td>
            <td
              class="border-2"
              v-if="user.prepayment2 === 'READ' || user.prepayment2 === 'WRITE'"
            >
              {{ row.prepayment }}
            </td>
            <td
              class="border-2"
              v-if="
                user.percentClient2 === 'READ' ||
                user.percentClient2 === 'WRITE'
              "
            >
              {{ row.percentClient }}
            </td>
            <td
              class="border-2"
              v-if="
                user.deliveredKGT2 === 'READ' || user.deliveredKGT2 === 'WRITE'
              "
            >
              {{ row.deliveredKGT }}
            </td>
            <td
              class="border-2"
              v-if="
                user.amountFromClient2 === 'READ' ||
                user.amountFromClient2 === 'WRITE'
              "
            >
              {{ row.amountFromClient2 }}
            </td>
            <td
              class="border-2"
              v-if="
                user.dispatchPVZ2 === 'READ' || user.dispatchPVZ2 === 'WRITE'
              "
            >
              {{ row.dispatchPVZ }}
            </td>
            <td
              class="border-2"
              v-if="user.orderPVZ2 === 'READ' || user.orderPVZ2 === 'WRITE'"
            >
              {{ row.orderPVZ }}
            </td>
            <td
              class="border-2"
              v-if="
                user.deliveredSC2 === 'READ' || user.deliveredSC2 === 'WRITE'
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
                user.deliveredPVZ2 === 'READ' || user.deliveredPVZ2 === 'WRITE'
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
              v-if="user.issued2 === 'READ' || user.issued2 === 'WRITE'"
            >
              <h1 class="font-bold text-green-500">
                {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
              </h1>
            </td>
            <td
              class="border-2"
              v-if="
                user.additionally2 === 'READ' || user.additionally2 === 'WRITE'
              "
            >
              {{ row.additionally ? row.additionally : "Пусто" }}
            </td>

            <td
              class="border-2"
              v-if="
                (user.profit2 === 'READ' || user.profit2 === 'WRITE') &&
                row.additionally !== 'Отказ клиент' &&
                row.additionally !== 'Отказ клиент онлайн' &&
                row.additionally !== 'Отказ клиент наличные' &&
                row.additionally !== 'Отказ брак'
              "
            >
              {{ row.profit2 }}
            </td>
            <td
              class="border-2"
              v-if="
                (user.profit2 === 'READ' || user.profit2 === 'WRITE') &&
                (row.additionally === 'Отказ клиент' ||
                  row.additionally === 'Отказ клиент онлайн' ||
                  row.additionally === 'Отказ клиент наличные' ||
                  row.additionally === 'Отказ брак')
              "
            >
              {{ row.profit2 }}
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
                (user.dataClientRansom === 'WRITE' && user.role === 'ADMIN') ||
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
            <div id="right"></div>
          </tr>
        </tbody>
      </table>
      <div
        v-else
        class="flex items-center flex-col justify-center mt-10 text-2xl"
      >
        <Icon name="ion:ios-close-empty" size="100" class="text-red-500" />
        <h1>Извините, записи по данным фильтрам не были найдены!</h1>
        <h1>Попробуйте поставить другие фильтры или очистить их</h1>
      </div>
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
          <h1 v-if="paymentStatusMessage === 'NotStarted'">
            Статус: <span class="text-secondary-color"> ОЖИДАНИЕ </span>
          </h1>
          <h1
            v-if="
              paymentStatusMessage === 'Received' ||
              paymentStatusMessage === 'InProgress'
            "
          >
            Статус: <span class="text-secondary-color"> ОБРАБОТКА </span>
          </h1>
          <h1 v-if="paymentStatusMessage === 'Accepted'">
            Статус: <span class="text-green-500"> УСПЕШНО </span>
          </h1>
          <h1 v-if="paymentStatusMessage === 'Rejected'">
            Статус: <span class="text-red-500"> ОТКЛОНЁН </span>
          </h1>
        </div>
      </template>
      <template v-slot:body>
        <div>
          <h1 class="text-left mb-3">
            Сумма:
            <span class="text-secondary-color font-bold"
              >{{ getAllSum }} ₽</span
            >
          </h1>
          <div>
            <CodeModalQR :value="qrBody.Data?.payload" />
          </div>
          <div class="mt-3 max-w-[300px]">
            <h1>Отсканируйте QR-код для оплаты</h1>
            <UISpinnerQR />
            <div class="text-left">
              <h1>
                Стоимость оплаты: <b>{{ qrBody.Data?.amount / 100 }} ₽ </b>
              </h1>
              <h1>
                Дата и время создания:
                <b
                  >{{ storeUsers.getNormalizedDate(qrBody.Data?.createdAt) }}
                  (МСК)
                </b>
              </h1>
              <h1>
                Уникальный идентификатор QR-кода:
                <b>{{ qrBody.Data?.qrcId }} </b>
              </h1>
              <h1>
                Источник создания QR-кода: <b>{{ qrBody.Data?.sourceName }} </b>
              </h1>
              <h1>
                Комментарий:
                <b>
                  {{ qrBody.Data?.paymentPurpose }}
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
    <UISpinner />
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
