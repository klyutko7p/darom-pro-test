<script setup lang="ts">
import { vAutoAnimate } from "@formkit/auto-animate";
import type { PropType } from "vue";

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
});

const storeBalance = useBalanceStore();
const storeAdvanceReports = useAdvanceReports();
let requestsBalance = ref<Array<IBalance>>([]);
let requestsAdvanceReport = ref<Array<IAdvanceReport>>([]);

const emits = defineEmits(["editMenu", "signOut"]);

function editMenu() {
  emits("editMenu");
}

function signOut() {
  emits("signOut");
}

let quantityRequiredARRows = ref(0);
let quantityRequiredARRowsAdmin = ref(0);
let quantityRequiredBalanceRows = ref(0);
onMounted(async () => {
  try {
    const [balanceResult, advanceResult] = await Promise.all([
      storeBalance.getBalanceRows(),
      storeAdvanceReports.getAdvancedReportsForSidebar(),
    ]);

    requestsBalance.value = balanceResult;
    requestsAdvanceReport.value = advanceResult;

    quantityRequiredARRows.value = requestsAdvanceReport.value?.filter(
      (row) =>
        !row.received &&
        row.issuedUser === props.user.username &&
        row.notation !== "Пополнение баланса"
    ).length;
    quantityRequiredARRowsAdmin.value = requestsAdvanceReport.value?.filter(
      (row) =>
        !row.received &&
        (row.issuedUser === props.user.username ||
          row.issuedUser === "Директор (С)") &&
        row.notation !== "Пополнение баланса"
    ).length;
    quantityRequiredBalanceRows.value = requestsBalance.value?.filter(
      (row) =>
        row.issued &&
        !row.received &&
        (row.receivedUser2 === props.user.username ||
          row.receivedUser2 === "Нет")
    ).length;
  } catch (error) {
    console.error("Ошибка:", error);
  }
});

const router = useRouter();

let isShowGoodsList = ref(false);
let isShowFinancesList = ref(false);
let isShowEquipmentsList = ref(false);
let isShowDSList = ref(false);
let isShowSettingsList = ref(false);

function showGoodsList() {
  isShowGoodsList.value = !isShowGoodsList.value;
}

function showFinancesList() {
  isShowFinancesList.value = !isShowFinancesList.value;
}

function showEquipmentsList() {
  isShowEquipmentsList.value = !isShowEquipmentsList.value;
}

function showDSList() {
  isShowDSList.value = !isShowDSList.value;
}

function showSettingsList() {
  isShowSettingsList.value = !isShowSettingsList.value;
}

let usersOfIssued = ref([
  "Директор",
  "Власенкова",
  "Алиса",
  "Василенко",
  "Волошина",
  "Горцуева",
  "Косой",
  "Кулешов",
  "Мешков",
  "Шарафаненко",
  "Шведова",
]);
</script>
<template>
  <div v-auto-animate class="px-3">
    <div v-auto-animate>
      <ul
        v-if="
          !isShowGoodsList &&
          !isShowFinancesList &&
          !isShowEquipmentsList &&
          !isShowDSList &&
          !isShowSettingsList
        "
        class="space-y-5 font-medium"
      >
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/acceptance')"
            v-if="
              (user.role === 'ADMINISTRATOR' ||
                user.role === 'PVZ' ||
                user.role === 'PPVZ' ||
                user.role === 'RMANAGER' ||
                user.role === 'ADMIN') &&
              user.username !== 'Сошников'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="mingcute:qrcode-fill"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Приёмка</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="showGoodsList"
            v-if="
              user.username !== 'Шарафаненко' &&
              user.username !== 'Кулешов' &&
              user.username !== 'Алиса' &&
              user.username !== 'Миллер' &&
              user.username !== 'Косой' &&
              user.username !== 'Василенко' &&
              user.username !== 'Сошников' &&
              user.username !== '+7'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="lucide:boxes"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Товары</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="showFinancesList"
            v-if="
              user.role !== 'SORTIROVKA' &&
              user.username !== 'Светлана1' &&
              user.username !== 'Светлана3' &&
              user.username !== 'Светлана2' &&
              user.role !== 'COURIER'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="material-symbols:finance-rounded"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Финансы</span>
            <span
              v-if="
                (quantityRequiredARRows || quantityRequiredBalanceRows) &&
                user.username !== 'Директор' &&
                user.username !== 'Власенкова'
              "
              class="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300"
            >
              {{ quantityRequiredARRows + quantityRequiredBalanceRows }}
            </span>
            <span
              v-if="
                (quantityRequiredBalanceRows || quantityRequiredARRowsAdmin) &&
                (user.username === 'Директор' || user.username === 'Власенкова')
              "
              class="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300"
            >
              {{ quantityRequiredARRowsAdmin + quantityRequiredBalanceRows }}
            </span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="showDSList"
            v-if="
              ((user.dataDelivery === 'READ' ||
                user.dataDelivery === 'WRITE') &&
                (user.role === 'ADMIN' || user.role === 'OPT') &&
                user.username !== 'Светлана1' &&
                user.username !== 'Светлана3' &&
                user.username !== 'Светлана2') ||
              user.dataDelivery === 'READ' ||
              (user.dataDelivery === 'WRITE' &&
                user.role !== 'ADMINISTRATOR' &&
                user.role !== 'RMANAGER' &&
                user.username !== 'Светлана1' &&
                user.username !== 'Светлана3' &&
                user.username !== 'Светлана2')
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-mage-delivery-truck-fill"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap"
              >Доставка и сортировка</span
            >
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="showEquipmentsList"
            v-if="
              user.username === 'Волошина' ||
              user.username === 'Шарафаненко' ||
              user.username === 'Кулешов' ||
              user.username === 'Алиса' ||
              user.username === 'Миллер' ||
              user.username === 'Шведова' ||
              user.username === 'Мешков' ||
              user.username === 'Директор' ||
              user.username === 'Горцуева' ||
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR' ||
              user.username === 'Власенкова' ||
              user.username === 'Сошников' ||
              usersOfIssued.includes(user.username)
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-material-symbols-contextual-token-add"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Дополнительно</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="showSettingsList"
            v-if="
              user.username === 'Директор' ||
              user.username === 'Горцуева' ||
              user.username === 'Власенкова'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-material-symbols-settings-account-box-rounded"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Настройки</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="signOut"
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-majesticons-door-exit"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Выйти</span>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="isShowGoodsList">
      <ul class="space-y-5 font-medium">
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="showGoodsList"
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="ic:round-keyboard-backspace"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Назад</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/spreadsheets/our-ransom/info')"
            v-if="
              user.dataOurRansom === 'READ' ||
              (user.dataOurRansom === 'WRITE' &&
                user.username !== 'Светлана1' &&
                user.username !== 'Светлана3' &&
                user.username !== 'Светлана2')
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="icon-park-solid:buy"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Товары клиентов</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/spreadsheets/our-ransom')"
            v-if="
              user.dataOurRansom === 'READ' ||
              (user.dataOurRansom === 'WRITE' &&
                user.username.includes('Светлана'))
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="icon-park-solid:buy"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Товары клиентов</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/spreadsheets/client-ransom/info')"
            v-if="
              user.dataClientRansom === 'READ' ||
              (user.dataClientRansom === 'WRITE' &&
                user.username !== 'Светлана1' &&
                user.username !== 'Светлана3' &&
                user.username !== 'Светлана2' &&
                !user.username.includes('Горцуева'))
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="material-symbols:lock-person-rounded"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap"
              >Доставка заказов <br />
              по ШК (QR)</span
            >
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/spreadsheets/client-ransom')"
            v-if="
              user.dataClientRansom === 'READ' ||
              (user.dataClientRansom === 'WRITE' &&
                user.username.includes('Светлана')) ||
              user.username.includes('Горцуева')
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="material-symbols:lock-person-rounded"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap"
              >Доставка заказов <br />
              по ШК (QR)</span
            >
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/spreadsheets/distribution')"
            v-if="
              user.username === 'Директор' ||
              user.username === 'Власенкова' ||
              user.username === 'Горцуева' ||
              user.username === 'Шведова' ||
              user.username === 'Мешков' ||
              user.role === 'COURIER' ||
              user.role === 'SORTIROVKA'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-material-symbols-move-to-inbox-rounded"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap"
              >Распределение товара</span
            >
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/spreadsheets/refunds')"
            v-if="
              (user.role === 'ADMIN' &&
                user.username !== 'Светлана1' &&
                user.username !== 'Светлана3' &&
                user.username !== 'Светлана2') ||
              user.role === 'ADMINISTRATOR' ||
              user.role === 'PVZ' ||
              user.role === 'PPVZ' ||
              user.username === 'Шведова' ||
              user.username === 'Мешков'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="ic:baseline-assignment-return"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Возвраты</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/spreadsheets/all-data')"
            v-if="
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR' ||
              user.role === 'PVZ' ||
              user.role === 'PPVZ'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-material-symbols-backup-table-rounded"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap"
              >Все данные: <br />
              Товары клиентов</span
            >
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/spreadsheets/inventory')"
            v-if="
              user.username === 'Шведова' ||
              user.username === 'Мешков' ||
              user.role === 'PVZ' ||
              user.role === 'PPVZ' ||
              user.username === 'Директор' ||
              user.username === 'Власенкова'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="material-symbols:inventory-rounded"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Инвентаризация</span>
          </div>
        </li>
      </ul>
    </div>

    <div v-auto-animate v-if="isShowFinancesList">
      <ul class="space-y-5">
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="showFinancesList"
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="ic:round-keyboard-backspace"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Назад</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/balance')"
            v-if="
              (user.role === 'ADMIN' &&
                user.username !== 'Светлана1' &&
                user.username !== 'Светлана3' &&
                user.username !== 'Светлана2' &&
                !user.username.includes('Горцуева')) ||
              user.role === 'ADMINISTRATOR' ||
              user.role === 'PVZ' ||
              user.username === 'Рейзвих' ||
              user.role === 'PPVZ' ||
              user.username === 'Сошников' ||
              user.role === 'RMANAGER'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="material-symbols-light:account-balance-wallet"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Баланс</span>
            <span
              v-if="quantityRequiredBalanceRows"
              class="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300"
            >
              {{ quantityRequiredBalanceRows }}
            </span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/advance-report')"
            v-if="
              (user.role === 'ADMIN' &&
                user.username !== 'Светлана1' &&
                user.username !== 'Светлана3' &&
                user.username !== 'Светлана2') ||
              user.role === 'DRIVER' ||
              user.role === 'ADMINISTRATOR' ||
              user.role === 'OFFICE' ||
              user.username === 'Рейзвих' ||
              user.username === 'Волошина' ||
              user.username === 'Сошников' ||
              user.role === 'RMANAGER'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="icon-park-solid:table-report"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Авансовый отчёт</span>
            <span
              v-if="
                user.username !== 'Директор' &&
                user.username !== 'Власенкова' &&
                quantityRequiredARRows
              "
              class="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300"
            >
              {{ quantityRequiredARRows }}
            </span>
            <span
              v-if="
                (user.username === 'Директор' ||
                  user.username === 'Власенкова') &&
                quantityRequiredARRowsAdmin
              "
              class="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300"
            >
              {{ quantityRequiredARRowsAdmin }}
            </span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/monthly-payments')"
            v-if="
              user.username === 'Директор' ||
              user.username === 'Власенкова' ||
              user.username === 'Шведова' ||
              user.username === 'Мешков'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-material-symbols-calendar-month"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap"
              >Ежемесячные платежи</span
            >
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            v-if="
              user.username === 'Директор' || user.username === 'Власенкова'
            "
            @click="router.push('/advance-report/summary-tables')"
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="material-symbols:table-chart"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Сводные таблицы</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            v-if="
              user.username === 'Директор' || user.username === 'Власенкова'
            "
            @click="router.push('/advance-report/payroll')"
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-solar-ruble-bold"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Расчёт ЗП</span>
          </div>
        </li>
      </ul>
    </div>

    <div v-auto-animate v-if="isShowEquipmentsList">
      <ul class="space-y-5">
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="showEquipmentsList"
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="ic:round-keyboard-backspace"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Назад</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/equipment')"
            v-if="
              user.username === 'Волошина' ||
              user.username === 'Шарафаненко' ||
              user.username === 'Кулешов' ||
              user.username === 'Алиса' ||
              user.username === 'Миллер' ||
              user.username === 'Шведова' ||
              user.username === 'Мешков' ||
              user.username === 'Директор' ||
              user.username === 'Горцуева' ||
              user.username === 'Власенкова' ||
              user.username === 'Сошников'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-icon-park-solid-connection-point"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Оборудование ПВЗ</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/auto-storage')"
            v-if="
              user.username === 'Директор' ||
              user.username === 'Власенкова' ||
              user.username === 'Косой'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-material-symbols-emoji-transportation"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">АвтоСклад</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/map')"
            v-if="
              user.role === 'RMANAGER' ||
              user.role === 'ADMIN' ||
              user.role === 'ADMINISTRATOR' ||
              user.username === 'Сошников'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-material-symbols-add-location-rounded"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Карта</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/tasks')"
            v-if="usersOfIssued.includes(user.username)"
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="material-symbols:add-task"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Задачи</span>
          </div>
        </li>
      </ul>
    </div>

    <div v-auto-animate v-if="isShowDSList">
      <ul class="space-y-5">
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="showDSList"
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="ic:round-keyboard-backspace"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Назад</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/spreadsheets/delivery')"
            v-if="
              ((user.dataDelivery === 'READ' ||
                user.dataDelivery === 'WRITE') &&
                (user.role === 'ADMIN' || user.role === 'OPT') &&
                user.username !== 'Светлана1' &&
                user.username !== 'Светлана3' &&
                user.username !== 'Светлана2') ||
              user.dataDelivery === 'READ' ||
              (user.dataDelivery === 'WRITE' &&
                user.role !== 'ADMINISTRATOR' &&
                user.role !== 'RMANAGER' &&
                user.username !== 'Светлана1' &&
                user.username !== 'Светлана3' &&
                user.username !== 'Светлана2')
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-mdi-truck-delivery"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap"
              >Доставка и сортировка</span
            >
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/summary-tables/delivery')"
            v-if="
              (user.dataDelivery === 'READ' || user.dataDelivery === 'WRITE') &&
              (user.role === 'ADMIN' || user.role === 'OPT') &&
              user.username !== 'Светлана1' &&
              user.username !== 'Светлана3' &&
              user.username !== 'Светлана2'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="material-symbols:table-chart-view"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Сводные таблицы</span>
          </div>
        </li>
      </ul>
    </div>

    <div v-auto-animate v-if="isShowSettingsList">
      <ul class="space-y-5">
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="showSettingsList"
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="ic:round-keyboard-backspace"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Назад</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/admin/users')"
            v-if="
              user.username === 'Директор' || user.username === 'Власенкова'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-ph-users-fill"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Пользователи</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/admin/marketplaces')"
            v-if="
              user.username === 'Директор' || user.username === 'Власенкова'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-solar-shop-2-bold"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Маркетплейсы</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/admin/phone-numbers')"
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-streamline-contact-phonebook-2-solid"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Телефоны и адреса</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/admin/cells')"
            v-if="
              user.username === 'Директор' || user.username === 'Власенкова'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-fluent-table-cells-split-28-filled"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Ячейки</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/admin/pvz')"
            v-if="
              user.username === 'Директор' || user.username === 'Власенкова'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-material-symbols-quick-reorder-rounded"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">ПВЗ</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/admin/pvz-percent')"
            v-if="
              user.username === 'Директор' ||
              user.username === 'Власенкова' ||
              user.username === 'Горцуева'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="material-symbols:percent"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Проценты ПВЗ</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/admin/sorting-centers')"
            v-if="
              user.username === 'Директор' || user.username === 'Власенкова'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-heroicons-building-storefront-solid"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">СЦ</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/admin/pvz-delivery')"
            v-if="
              user.username === 'Директор' || user.username === 'Власенкова'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-material-symbols-quick-reorder-rounded"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">ПВЗ (Доставка)</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/admin/sorting-centers-delivery')"
            v-if="
              user.username === 'Директор' || user.username === 'Власенкова'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-heroicons-building-storefront-solid"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">СЦ (Доставка)</span>
          </div>
        </li>
        <li>
          <div
            class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
            @click="router.push('/admin/order-accounts')"
            v-if="
              user.username === 'Директор' ||
              user.username === 'Власенкова' ||
              user.username === 'Горцуева'
            "
          >
            <Icon
              class="text-gray-500 transition duration-75 group-hover:text-gray-900"
              name="i-material-symbols-shield-person"
              size="24"
            />
            <span class="flex-1 ms-3 whitespace-nowrap">Аккаунты заказа</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
