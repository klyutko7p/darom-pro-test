<script lang="ts" setup>
import { useUsersStore } from "../stores/users";

const router = useRouter();
const route = useRoute();
const storeUsers = useUsersStore();
let user = ref({} as User);
let isOpen = ref(false);
const storeBalance = useBalanceStore();
const storeAdvanceReports = useAdvanceReports();
let requests = ref<Array<IBalance>>();
let requests2 = ref<Array<IAdvanceReport>>();

function signOut() {
  storeUsers.signOut();
}

function editMenu() {
  isOpen.value = !isOpen.value;
}

function reloadPage() {
  location.reload();
}

onMounted(async () => {
  try {
    const [userResult, balanceResult, advanceResult] = await Promise.all([
      storeUsers.getUser(),
      storeBalance.getBalanceRows(),
      storeAdvanceReports.getAdvancedReports(),
    ]);

    user.value = userResult;
    requests.value = balanceResult;
    requests2.value = advanceResult;
  } catch (error) {
    console.error("Ошибка:", error);
  }
});

function formatPhoneNumber(phoneNumber: string) {
  if (!phoneNumber) {
    return "Номер телефона не указан";
  }

  const digitsOnly = phoneNumber.replace(/\D/g, "");

  if (digitsOnly.length < 11) {
    return "Неправильный формат номера телефона";
  }

  const maskedPhoneNumber =
    "+7" + "*".repeat(digitsOnly.length - 5) + digitsOnly.slice(-4);

  return maskedPhoneNumber;
}

let isShowAddSettings = ref(false);
</script>
<template>
  <div
    class="fixed z-50 backdrop-blur-2xl w-full h-screen flex flex-col bg-clip-border rounded-r-xl bg-white text-gray-700 max-w-[16rem] p-4 shadow-xl shadow-blue-gray-900/5 max-md:hidden overflow-y-auto"
    v-if="isOpen"
  >
    <div class="p-4 flex justify-between items-center">
      <h1 class="font-bold text-xl text-secondary-color">DAROM.PRO</h1>
      <div>
        <Icon
          @click="editMenu"
          name="ion:ios-arrow-back"
          size="20"
          class="hover:text-orange-300 duration-200 cursor-pointer"
        />
      </div>
    </div>
    <nav
      class="flex flex-col gap-1 min-w-[240px] p-2 font-sans text-base font-normal text-gray-700 overflow-y-auto"
    >
      <div
        role="button"
        @click="router.push('/spreadsheets/our-ransom/info')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="
          user.dataOurRansom === 'READ' ||
          (user.dataOurRansom === 'WRITE' && !user.username.includes('Светлана'))
        "
      >
        <div class="grid place-items-center mr-4">
          <Icon name="mage:bag-a" size="20" />
        </div>
        <h1>Наш Выкуп</h1>
      </div>
      <div
        role="button"
        @click="router.push('/spreadsheets/our-ransom')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="
          user.dataOurRansom === 'READ' ||
          (user.dataOurRansom === 'WRITE' && user.username.includes('Светлана'))
        "
      >
        <div class="grid place-items-center mr-4">
          <Icon name="mage:bag-a" size="20" />
        </div>
        <h1>Наш Выкуп</h1>
      </div>
      <div
        role="button"
        tabindex="0"
        @click="router.push('/spreadsheets/client-ransom/info')"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="
          user.dataClientRansom === 'READ' ||
          (user.dataClientRansom === 'WRITE' &&
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева'))
        "
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:lock-person-outline" size="20" />
        </div>
        <h1>Выкуп Клиента</h1>
      </div>
      <div
        role="button"
        tabindex="0"
        @click="router.push('/spreadsheets/client-ransom')"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="
          user.dataClientRansom === 'READ' ||
          (user.dataClientRansom === 'WRITE' && user.username.includes('Светлана')) ||
          user.username.includes('Горцуева')
        "
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:lock-person-outline" size="20" />
        </div>
        <h1>Выкуп Клиента</h1>
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' &&
            user.username !== 'Светлана1' &&
            user.username !== 'Светлана2') ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'PVZ'
        "
        role="button"
        @click="router.push('/spreadsheets/refunds')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="hugeicons:delivery-return-01" size="20" />
        </div>
        <h1>Возвраты</h1>
      </div>
      <div
        v-if="
          (user.dataDelivery === 'READ' || user.dataDelivery === 'WRITE') &&
          (user.role === 'ADMIN' || user.role === 'OPT') &&
          user.username !== 'Светлана1' &&
          user.username !== 'Светлана2'
        "
        role="button"
        @click="router.push('/spreadsheets/delivery')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="carbon:delivery" size="20" />
        </div>
        <h1>Доставка и сортировка</h1>
      </div>
      <div
        v-if="
          user.role === 'ADMINISTRATOR' ||
          user.role === 'ADMIN' ||
          user.role === 'PVZ' ||
          user.role === 'PPVZ' ||
          user.role === 'RMANAGER'
        "
        role="button"
        @click="router.push('/acceptance')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="mdi:qrcode-scan" size="20" />
        </div>
        <h1>Приёмка</h1>
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' &&
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева')) ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'PVZ' ||
          user.role === 'COURIER' ||
          user.role === 'PPVZ' ||
          user.role === 'RMANAGER'
        "
        role="button"
        @click="router.push('/balance')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols-light:account-balance-wallet-outline" size="20" />
        </div>
        <h1>Баланс</h1>
        <Icon
          v-if="
            requests?.filter(
              (row) =>
                row.issued !== null &&
                row.received === null &&
                (row.receivedUser2 === user.username || row.receivedUser2 === 'Нет')
            ).length > 0
          "
          name="pepicons-print:exclamation"
          size="24"
          class="text-red-700"
        />
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' && !user.username.includes('Светлана')) ||
          user.role === 'DRIVER' ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'OFFICE' ||
          user.role === 'COURIER' ||
          user.username === 'Волошина' ||
          user.role === 'RMANAGER'
        "
        role="button"
        @click="router.push('/advance-report')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="oui:ml-create-advanced-job" size="20" />
        </div>
        <h1>Авансовый отчёт</h1>
        <Icon
          v-if="
            requests2?.filter(
              (row) =>
                row.received === null &&
                row.issuedUser === user.username &&
                row.notation !== 'Пополнение баланса'
            ).length > 0
          "
          name="pepicons-print:exclamation"
          size="24"
          class="text-red-700"
        />
      </div>
      <div
        v-if="user.username === 'Директор'"
        role="button"
        @click="router.push('/advance-report/payroll')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:currency-ruble" size="20" />
        </div>
        <h1>Расчёт ЗП</h1>
      </div>
      <div
        v-if="user.username === 'Директор'"
        role="button"
        @click="router.push('/tasks')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:add-task" size="20" />
        </div>
        <h1>Задачи</h1>
      </div>
      <div
        v-if="
          user.role === 'RMANAGER' ||
          user.role === 'ADMIN' ||
          user.role === 'ADMINISTRATOR'
        "
        role="button"
        @click="router.push('/map')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:edit-location-alt-outline" size="20" />
        </div>
        <h1>Карта</h1>
      </div>
      <div
        class="px-3 pt-3 font-bold flex items-center gap-3"
        v-if="user.role !== 'USER'"
      >
        <h1>Настройки доступа</h1>
        <Icon
          @click="isShowAddSettings = !isShowAddSettings"
          class="hover:text-secondary-color cursor-pointer"
          size="24"
          name="material-symbols:keyboard-double-arrow-down-rounded"
        />
      </div>
      <div v-if="isShowAddSettings">
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR' &&
            user.role !== 'RMANAGER'
          "
          role="button"
          @click="router.push('/admin/users')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              class="h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          <h1>Пользователи</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/marketplaces')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="icon-park-outline:market-analysis" size="20" />
          </div>
          <h1>Маркетплейсы</h1>
        </div>
        <div
          v-if="!user.username.includes('Светлана') && user.role !== 'ADMINISTRATOR'"
          role="button"
          @click="router.push('/admin/phone-numbers')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="ph:address-book" size="20" />
          </div>
          <h1>Телефоны и адреса</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/cells')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="material-symbols:cell-merge-rounded" size="20" />
          </div>
          <h1>Ячейки</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/pvz')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="tabler:reorder" size="20" />
          </div>
          <h1>Пункты выдачи заказов</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/sorting-centers')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="material-symbols-light:box-sharp" size="20" />
          </div>
          <h1>Сортировочные центры</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/pvz-delivery')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="solar:delivery-broken" size="20" />
          </div>
          <h1>Пункты выдачи заказов (Доставка)</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/sorting-centers-delivery')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon
              name="streamline:shipping-box-2-box-package-label-delivery-shipment-shipping-3d"
              size="20"
            />
          </div>
          <h1>Сортировочные центры (Доставка)</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/order-accounts')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon
              name="material-symbols:deployed-code-account-outline-rounded"
              size="20"
            />
          </div>
          <h1>Аккаунты заказа</h1>
        </div>
      </div>
      <div
        role="button"
        tabindex="0"
        @click="signOut()"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            class="h-5 w-5"
          >
            <path
              fill-rule="evenodd"
              d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </div>
        Выйти
      </div>
    </nav>
  </div>

  <div
    class="fixed bg-gradient-to-tr from-white via-white to-yellow-100 bg-image m-auto top-0 bottom-0 left-0 right-0 z-[200] hidden max-md:block overflow-auto"
    v-if="
      isOpen &&
      (route.fullPath.includes('+') ||
        route.fullPath === '/spreadsheets/our-ransom' ||
        route.fullPath === '/spreadsheets/client-ransom' ||
        route.fullPath === '/spreadsheets/delivery' ||
        route.fullPath === '/advance-report/summary-tables' )
    "
  >
    <nav class="flex flex-col gap-1 p-2 font-sans mt-10 pl-24 text-lg font-normal text-black">
      <div class="flex items-center mb-5 gap-24">
        <h1 class="font-bold text-3xl text-secondary-color">DAROM.PRO</h1>
        <Icon
          name="material-symbols:cancel-rounded"
          class="duration-200 cursor-pointer hover:text-orange-400"
          size="40"
          @click="editMenu"
        />
      </div>
      <div
        role="button"
        @click="
          user.role !== 'SORTIROVKA'
            ? router.push('/spreadsheets/our-ransom/info')
            : router.push('/spreadsheets/our-ransom')
        "
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="user.dataOurRansom === 'READ' || user.dataOurRansom === 'WRITE'"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="mage:bag-a" size="20" />
        </div>
        <h1>Наш Выкуп</h1>
      </div>
      <div
        role="button"
        tabindex="0"
        @click="
          user.role !== 'SORTIROVKA'
            ? router.push('/spreadsheets/client-ransom/info')
            : router.push('/spreadsheets/client-ransom')
        "
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="user.dataClientRansom === 'READ' || user.dataClientRansom === 'WRITE'"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:lock-person-outline" size="20" />
        </div>
        <h1>Выкуп Клиента</h1>
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' &&
            user.username !== 'Светлана1' &&
            user.username !== 'Светлана2') ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'PVZ'
        "
        role="button"
        @click="router.push('/spreadsheets/refunds')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="hugeicons:delivery-return-01" size="20" />
        </div>
        <h1>Возвраты</h1>
      </div>
      <div
        v-if="
          (user.dataDelivery === 'READ' || user.dataDelivery === 'WRITE') &&
          (user.role === 'ADMIN' || user.role === 'OPT') &&
          user.username !== 'Светлана1' &&
          user.username !== 'Светлана2'
        "
        role="button"
        @click="router.push('/spreadsheets/delivery')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="carbon:delivery" size="20" />
        </div>
        <h1>Доставка и сортировка</h1>
      </div>
      <div
        v-if="
          user.role === 'ADMINISTRATOR' ||
          user.role === 'ADMIN' ||
          user.role === 'PVZ' ||
          user.role === 'PPVZ' ||
          user.role === 'RMANAGER'
        "
        role="button"
        @click="router.push('/acceptance')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="mdi:qrcode-scan" size="20" />
        </div>
        <h1>Приёмка</h1>
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' &&
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева')) ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'PVZ' ||
          user.role === 'PPVZ' ||
          user.role === 'RMANAGER'
        "
        role="button"
        @click="router.push('/balance')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols-light:account-balance-wallet-outline" size="20" />
        </div>
        <h1>Баланс</h1>
        <Icon
          v-if="
            requests?.filter(
              (row) =>
                row.issued !== null &&
                row.received === null &&
                (row.receivedUser2 === user.username || row.receivedUser2 === 'Нет')
            ).length > 0
          "
          name="pepicons-print:exclamation"
          size="24"
          class="text-red-700"
        />
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' && !user.username.includes('Светлана')) ||
          user.role === 'DRIVER' ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'OFFICE' ||
          user.role === 'COURIER' ||
          user.username === 'Волошина' ||
          user.role === 'RMANAGER'
        "
        role="button"
        @click="router.push('/advance-report')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="oui:ml-create-advanced-job" size="20" />
        </div>
        <h1>Авансовый отчёт</h1>
        <Icon
          v-if="
            requests2?.filter(
              (row) =>
                row.received === null &&
                row.issuedUser === user.username &&
                row.notation !== 'Пополнение баланса'
            ).length > 0
          "
          name="pepicons-print:exclamation"
          size="24"
          class="text-red-700"
        />
      </div>
      <div
        v-if="user.username === 'Директор'"
        role="button"
        @click="router.push('/advance-report/payroll')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:currency-ruble" size="20" />
        </div>
        <h1>Расчёт ЗП</h1>
      </div>
      <div
        v-if="user.username === 'Директор'"
        role="button"
        @click="router.push('/tasks')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:add-task" size="20" />
        </div>
        <h1>Задачи</h1>
      </div>
      <div
        v-if="
          user.role === 'RMANAGER' ||
          user.role === 'ADMIN' ||
          user.role === 'ADMINISTRATOR'
        "
        role="button"
        @click="router.push('/map')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:edit-location-alt-outline" size="20" />
        </div>
        <h1>Карта</h1>
      </div>
      <div
        class="px-3 pt-3 font-bold flex items-center gap-3"
        v-if="user.role !== 'USER'"
      >
        <h1>Настройки доступа</h1>
        <Icon
          @click="isShowAddSettings = !isShowAddSettings"
          class="hover:text-secondary-color cursor-pointer"
          size="24"
          name="material-symbols:keyboard-double-arrow-down-rounded"
        />
      </div>
      <div v-if="isShowAddSettings">
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/users')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              class="h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          <h1>Пользователи</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/marketplaces')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="icon-park-outline:market-analysis" size="20" />
          </div>
          <h1>Маркетплейсы</h1>
        </div>
        <div
          v-if="!user.username.includes('Светлана') && user.role !== 'ADMINISTRATOR'"
          role="button"
          @click="router.push('/admin/phone-numbers')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="ph:address-book" size="20" />
          </div>
          <h1>Телефоны и адреса</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/cells')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="material-symbols:cell-merge-rounded" size="20" />
          </div>
          <h1>Ячейки</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/pvz')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="tabler:reorder" size="20" />
          </div>
          <h1>Пункты выдачи заказов</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/sorting-centers')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="material-symbols-light:box-sharp" size="20" />
          </div>
          <h1>Сортировочные центры</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/pvz-delivery')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="solar:delivery-broken" size="20" />
          </div>
          <h1>
            Пункты выдачи заказов <br />
            (Доставка)
          </h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/sorting-centers-delivery')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon
              name="streamline:shipping-box-2-box-package-label-delivery-shipment-shipping-3d"
              size="20"
            />
          </div>
          <h1>
            Сортировочные центры <br />
            (Доставка)
          </h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/order-accounts')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon
              name="material-symbols:deployed-code-account-outline-rounded"
              size="20"
            />
          </div>
          <h1>Аккаунты заказа</h1>
        </div>
      </div>
      <div
        role="button"
        tabindex="0"
        @click="signOut()"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            class="h-5 w-5"
          >
            <path
              fill-rule="evenodd"
              d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </div>
        Выйти
      </div>
    </nav>
  </div>

  <div
    class="fixed w-screen h-screen bg-gradient-to-tr from-white via-white to-yellow-100 top-0 bottom-0 z-[200] hidden max-md:flex items-start overflow-auto"
    v-if="
      isOpen &&
      !route.fullPath.includes('+') &&
      route.fullPath !== '/spreadsheets/our-ransom' &&
      route.fullPath !== '/spreadsheets/client-ransom' &&
      route.fullPath !== '/spreadsheets/delivery' &&
      route.fullPath !== '/advance-report/summary-tables' 
    "
  >
    <nav
      class="flex flex-col text-lg space-y-1 w-full gap-1 p-10 h-screen font-sans font-normal text-black"
    >
      <div class="text-center mb-10 mt-5">
        <h1 class="font-bold text-5xl text-secondary-color text-center">DAROM.PRO</h1>
      </div>
      <Icon
        name="material-symbols:cancel-rounded"
        class="duration-200 absolute top-2 right-2 cursor-pointer hover:text-orange-400"
        size="40"
        @click="editMenu"
      />
      <div
        role="button"
        @click="
          user.role !== 'SORTIROVKA'
            ? router.push('/spreadsheets/our-ransom/info')
            : router.push('/spreadsheets/our-ransom')
        "
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="user.dataOurRansom === 'READ' || user.dataOurRansom === 'WRITE'"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="mage:bag-a" size="20" />
        </div>
        <h1>Наш Выкуп</h1>
      </div>
      <div
        role="button"
        tabindex="0"
        @click="
          user.role !== 'SORTIROVKA'
            ? router.push('/spreadsheets/client-ransom/info')
            : router.push('/spreadsheets/client-ransom')
        "
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="user.dataClientRansom === 'READ' || user.dataClientRansom === 'WRITE'"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:lock-person-outline" size="20" />
        </div>
        <h1>Выкуп Клиента</h1>
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' &&
            user.username !== 'Светлана1' &&
            user.username !== 'Светлана2') ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'PVZ'
        "
        role="button"
        @click="router.push('/spreadsheets/refunds')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="hugeicons:delivery-return-01" size="20" />
        </div>
        <h1>Возвраты</h1>
      </div>
      <div
        v-if="
          (user.dataDelivery === 'READ' || user.dataDelivery === 'WRITE') &&
          (user.role === 'ADMIN' || user.role === 'OPT') &&
          user.username !== 'Светлана1' &&
          user.username !== 'Светлана2'
        "
        role="button"
        @click="router.push('/spreadsheets/delivery')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="carbon:delivery" size="20" />
        </div>
        <h1>Доставка и сортировка</h1>
      </div>
      <div
        v-if="
          user.role === 'ADMINISTRATOR' ||
          user.role === 'ADMIN' ||
          user.role === 'PVZ' ||
          user.role === 'PPVZ' ||
          user.role === 'RMANAGER'
        "
        role="button"
        @click="router.push('/acceptance')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="mdi:qrcode-scan" size="20" />
        </div>
        <h1>Приёмка</h1>
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' &&
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева')) ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'PVZ' ||
          user.role === 'PPVZ' ||
          user.role === 'RMANAGER'
        "
        role="button"
        @click="router.push('/balance')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols-light:account-balance-wallet-outline" size="20" />
        </div>
        <h1>Баланс</h1>
        <Icon
          v-if="
            requests?.filter(
              (row) =>
                row.issued !== null &&
                row.received === null &&
                (row.receivedUser2 === user.username || row.receivedUser2 === 'Нет')
            ).length > 0
          "
          name="pepicons-print:exclamation"
          size="24"
          class="text-red-700"
        />
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' && !user.username.includes('Светлана')) ||
          user.role === 'DRIVER' ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'OFFICE' ||
          user.role === 'COURIER' ||
          user.username === 'Волошина' ||
          user.role === 'RMANAGER'
        "
        role="button"
        @click="router.push('/advance-report')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="oui:ml-create-advanced-job" size="20" />
        </div>
        <h1>Авансовый отчёт</h1>
        <Icon
          v-if="
            requests2?.filter(
              (row) =>
                row.received === null &&
                row.issuedUser === user.username &&
                row.notation !== 'Пополнение баланса'
            ).length > 0
          "
          name="pepicons-print:exclamation"
          size="24"
          class="text-red-700"
        />
      </div>
      <div
        v-if="user.username === 'Директор'"
        role="button"
        @click="router.push('/advance-report/payroll')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:currency-ruble" size="20" />
        </div>
        <h1>Расчёт ЗП</h1>
      </div>
      <div
        v-if="user.username === 'Директор'"
        role="button"
        @click="router.push('/tasks')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:add-task" size="20" />
        </div>
        <h1>Задачи</h1>
      </div>
      <div
        v-if="
          user.role === 'RMANAGER' ||
          user.role === 'ADMIN' ||
          user.role === 'ADMINISTRATOR'
        "
        role="button"
        @click="router.push('/map')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:edit-location-alt-outline" size="20" />
        </div>
        <h1>Карта</h1>
      </div>
      <div
        class="px-3 pt-3 font-bold flex items-center gap-3"
        v-if="user.role !== 'USER'"
      >
        <h1>Настройки доступа</h1>
        <Icon
          @click="isShowAddSettings = !isShowAddSettings"
          class="hover:text-secondary-color cursor-pointer"
          size="24"
          name="material-symbols:keyboard-double-arrow-down-rounded"
        />
      </div>
      <div v-if="isShowAddSettings">
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/users')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              class="h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          <h1>Пользователи</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/marketplaces')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="icon-park-outline:market-analysis" size="20" />
          </div>
          <h1>Маркетплейсы</h1>
        </div>
        <div
          v-if="!user.username.includes('Светлана') && user.role !== 'ADMINISTRATOR'"
          role="button"
          @click="router.push('/admin/phone-numbers')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="ph:address-book" size="20" />
          </div>
          <h1>Телефоны и адреса</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/cells')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="material-symbols:cell-merge-rounded" size="20" />
          </div>
          <h1>Ячейки</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/pvz')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="tabler:reorder" size="20" />
          </div>
          <h1>Пункты выдачи заказов</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/sorting-centers')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="material-symbols-light:box-sharp" size="20" />
          </div>
          <h1>Сортировочные центры</h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/pvz-delivery')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="solar:delivery-broken" size="20" />
          </div>
          <h1>
            Пункты выдачи заказов <br />
            (Доставка)
          </h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/sorting-centers-delivery')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon
              name="streamline:shipping-box-2-box-package-label-delivery-shipment-shipping-3d"
              size="20"
            />
          </div>
          <h1>
            Сортировочные центры <br />
            (Доставка)
          </h1>
        </div>
        <div
          v-if="
            !user.username.includes('Светлана') &&
            !user.username.includes('Горцуева') &&
            user.role !== 'ADMINISTRATOR'
          "
          role="button"
          @click="router.push('/admin/order-accounts')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon
              name="material-symbols:deployed-code-account-outline-rounded"
              size="20"
            />
          </div>
          <h1>Аккаунты заказа</h1>
        </div>
      </div>
      <div
        role="button"
        tabindex="0"
        @click="signOut()"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            class="h-5 w-5"
          >
            <path
              fill-rule="evenodd"
              d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </div>
        Выйти
      </div>
    </nav>
  </div>

  <div
    v-else
    :class="{
      absolute:
        route.fullPath.includes('+') ||
        route.fullPath === '/spreadsheets/our-ransom' ||
        route.fullPath === '/spreadsheets/client-ransom' ||
        route.fullPath === '/spreadsheets/delivery' ||
        route.fullPath === '/advance-report/payroll',
    }"
    class="py-1 px-3 fixed z-40 max-xl:right-0 flex items-center max-sm:gap-3 justify-between duration-200 w-full bg-gradient-to-br from-purple-700 to-orange-400 backdrop-blur-2xl text-white"
  >
    <div class="flex items-center gap-1">
      <Icon
        @click="editMenu"
        size="40"
        name="material-symbols-light:menu"
        class="hover:opacity-50 duration-200 cursor-pointer"
      />
      <Icon
        v-if="
          requests?.filter(
            (row) =>
              row.issued !== null &&
              row.received === null &&
              (row.receivedUser2 === user.username || row.receivedUser2 === 'Нет')
          ).length > 0
        "
        name="pepicons-print:exclamation"
        size="24"
        class="text-red-700"
      />
      <Icon
        v-if="
          requests2?.filter(
            (row) =>
              row.received === null &&
              row.issuedUser === user.username &&
              row.notation !== 'Пополнение баланса'
          ).length > 0
        "
        name="pepicons-print:exclamation"
        size="40"
        class="text-red-700"
      />
      <h1 class="font-medium" v-if="user.username !== 'Директор'">
        {{ user.username }}
      </h1>
      <h1 class="font-medium" v-if="user.username === 'Директор'">Император</h1>
    </div>
    <h1
      class="text-lg font-medium max-sm:text-sm"
      v-if="route.meta.name === 'Товары из' && route.fullPath.includes('/our-ransom')"
    >
      {{ route.meta.name }} {{ route.params.pvz }} (Наш Выкуп)
    </h1>
    <h1
      class="text-lg font-medium max-sm:text-sm"
      v-else-if="
        route.fullPath.includes('/client-ransom') &&
        route.params.pvz &&
        !route.params.fromName
      "
    >
      Товары из {{ route.meta.name }} {{ route.params.pvz }} (Выкуп Клиента)
    </h1>
    <h1
      class="text-lg font-medium max-sm:text-sm"
      v-else-if="
        route.fullPath.includes('/client-ransom') &&
        route.params.pvz &&
        route.params.fromName
      "
    >
      Товары по телефону: {{ formatPhoneNumber(route.params.fromName) }} (Выкуп Клиента)
    </h1>
    <h1
      class="text-lg font-medium max-sm:text-sm"
      v-else-if="
        route.fullPath.includes('/our-ransom') &&
        route.params.pvz &&
        route.params.fromName
      "
    >
      Товары по телефону: {{ formatPhoneNumber(route.params.fromName) }} (Наш Выкуп)
    </h1>
    <h1 class="text-lg font-medium max-sm:text-sm" v-else>
      {{ route.meta.name }}
    </h1>
    <div class="flex gap-1">
      <Icon
        @click="reloadPage"
        name="material-symbols:refresh-rounded"
        size="32"
        class="cursor-pointer hover:opacity-50 duration-200"
      />
      <Icon
        @click="router.go(-1)"
        name="ion:ios-arrow-back"
        size="32"
        class="cursor-pointer hover:opacity-50 duration-200"
      />
    </div>
  </div>
</template>
