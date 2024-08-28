<script lang="ts" setup>
import { useUsersStore } from "../stores/users";

const router = useRouter();
const route = useRoute();
const storeUsers = useUsersStore();
const storeBalance = useBalanceStore();
const storeAdvanceReports = useAdvanceReports();
let user = ref({} as User);
let isOpen = ref(false);
let requests = ref<Array<IBalance>>();
let requests2 = ref<Array<IAdvanceReport>>();

function signOut() {
  storeUsers.signOut();
}

function editMenu() {
  isOpen.value = !isOpen.value;
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
</script>
<template>
  <div
    class="fixed z-50 backdrop-blur-2xl w-full h-screen flex flex-col bg-clip-border rounded-r-xl bg-white text-gray-700 max-w-[16rem] p-4 shadow-xl shadow-blue-gray-900/5 max-xl:hidden overflow-y-auto"
    v-if="isOpen"
  >
    <div class="p-4 flex justify-between items-center">
      <h1 class="font-bold text-xl text-secondary-color">DAROM.PRO</h1>
      <Icon
        @click="editMenu"
        name="ion:ios-arrow-back"
        size="20"
        class="hover:text-orange-300 duration-200 cursor-pointer"
      />
    </div>
    <nav
      class="flex flex-col gap-1 min-w-[240px] p-2 font-sans text-base font-normal text-gray-700 overflow-y-auto"
    >
      <div
        role="button"
        @click="router.push('/spreadsheets/our-ransom/info')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-orange-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
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
        @click="router.push('/spreadsheets/client-ransom/info')"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="
          (user.dataClientRansom === 'READ' || user.dataClientRansom === 'WRITE') &&
          user.role !== 'SORTIROVKA' &&
          user.username !== 'Волошина'
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
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="
          (user.dataClientRansom === 'READ' || user.dataClientRansom === 'WRITE') &&
          (user.role === 'SORTIROVKA' || user.username === 'Волошина')
        "
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:lock-person-outline" size="20" />
        </div>
        <h1>Выкуп Клиента</h1>
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' && user.username !== 'Светлана1') ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'PVZ' ||
          user.role === 'PPVZ'
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
          user.username === 'Волошина' ||
          user.username === 'Шарафаненко' ||
          user.username === 'Шведова' ||
          user.username === 'Директор' ||
          user.username === 'Горцуева'
        "
        role="button"
        @click="router.push('/equipment')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:rule-settings" size="20" />
        </div>
        <h1>Оборудование ПВЗ</h1>
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' && !user.username.includes('Светлана')) ||
          user.role === 'DRIVER' ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'OFFICE' ||
          user.role === 'COURIER' ||
          user.username === 'Волошина' ||
          user.role === 'RMANAGER' ||
          user.username === 'КассаЯМ'
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
        v-if="
          user.dataDelivery === 'READ' ||
          (user.dataDelivery === 'WRITE' &&
            user.role !== 'ADMINISTRATOR' &&
            user.role !== 'RMANAGER')
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
          (user.role === 'ADMIN' && !user.username.includes('Светлана')) ||
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
            requests?.filter((row) => row.pvz === user.visiblePVZ && row.issued === null)
              .length > 0
          "
          name="pepicons-print:exclamation"
          size="24"
          class="text-red-700"
        />
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
          <Icon name="ic:baseline-mode-edit-location-alt-outline" size="20" />
        </div>
        <h1>Карта</h1>
      </div>
      <div
        role="button"
        tabindex="0"
        @click="signOut()"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-orange-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
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
    class="absolute bg-gradient-to-tr from-white via-white to-yellow-100 bg-image top-0 bottom-0 left-0 right-0 z-50 hidden max-xl:flex items-center justify-center bg-white"
    v-if="isOpen"
  >
    <Icon
      name="material-symbols:cancel-rounded"
      class="absolute duration-200 cursor-pointer hover:text-orange-400 top-2 right-4"
      size="40"
      @click="editMenu"
    />
    <nav
      class="flex flex-col gap-1 min-w-[240px] p-2 font-sans text-base font-normal text-gray-700"
    >
      <h1 class="text-center font-bold text-3xl text-secondary-color mb-5">DAROM.PRO</h1>
      <div
        role="button"
        @click="router.push('/spreadsheets/our-ransom/info')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-orange-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
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
        @click="router.push('/spreadsheets/client-ransom/info')"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="
          (user.dataClientRansom === 'READ' || user.dataClientRansom === 'WRITE') &&
          user.role !== 'SORTIROVKA' &&
          user.username !== 'Волошина'
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
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="
          (user.dataClientRansom === 'READ' || user.dataClientRansom === 'WRITE') &&
          (user.role === 'SORTIROVKA' || user.username === 'Волошина')
        "
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:lock-person-outline" size="20" />
        </div>
        <h1>Выкуп Клиента</h1>
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' && user.username !== 'Светлана1') ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'PVZ' ||
          user.role === 'PPVZ'
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
          user.username === 'Волошина' ||
          user.username === 'Шарафаненко' ||
          user.username === 'Шведова' ||
          user.username === 'Директор' ||
          user.username === 'Горцуева'
        "
        role="button"
        @click="router.push('/equipment')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:rule-settings" size="20" />
        </div>
        <h1>Оборудование ПВЗ</h1>
      </div>
      <div
        v-if="
          (user.role === 'ADMIN' && !user.username.includes('Светлана')) ||
          user.role === 'DRIVER' ||
          user.role === 'ADMINISTRATOR' ||
          user.role === 'OFFICE' ||
          user.role === 'COURIER' ||
          user.username === 'Волошина' ||
          user.role === 'RMANAGER' ||
          user.username === 'КассаЯМ'
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
        v-if="
          user.dataDelivery === 'READ' ||
          (user.dataDelivery === 'WRITE' &&
            user.role !== 'ADMINISTRATOR' &&
            user.role !== 'RMANAGER')
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
          (user.role === 'ADMIN' && !user.username.includes('Светлана')) ||
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
            requests?.filter((row) => row.pvz === user.visiblePVZ && row.issued === null)
              .length > 0
          "
          name="pepicons-print:exclamation"
          size="24"
          class="text-red-700"
        />
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
          <Icon name="ic:baseline-mode-edit-location-alt-outline" size="20" />
        </div>
        <h1>Карта</h1>
      </div>
      <div
        role="button"
        tabindex="0"
        @click="signOut()"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-orange-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
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
        route.fullPath === '/spreadsheets/client-ransom',
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
          requests?.filter((row) => row.pvz === user.visiblePVZ && row.issued === null)
            .length > 0
        "
        name="pepicons-print:exclamation"
        size="40"
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
      <h1 class="font-medium">{{ user.username }}</h1>
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
    <Icon
      @click="router.go(-1)"
      name="ion:ios-arrow-back"
      size="32"
      class="cursor-pointer hover:opacity-50 duration-200"
    />
  </div>
</template>
