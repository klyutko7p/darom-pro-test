<script lang="ts" setup>
import { useUsersStore } from "../stores/users";
import { vAutoAnimate } from "@formkit/auto-animate";

const router = useRouter();
const route = useRoute();
const storeUsers = useUsersStore();
let user = ref({} as User);
let isOpen = ref(false);
const storeBalance = useBalanceStore();
const storeAdvanceReports = useAdvanceReports();
let requestsBalance = ref<Array<IBalance>>([]);
let requestsAdvanceReport = ref<Array<IAdvanceReport>>([]);

function signOut() {
  storeUsers.signOut();
}

function editMenu() {
  isOpen.value = !isOpen.value;
}

function reloadPage() {
  location.reload();
}

let quantityRequiredARRows = ref(0);
let quantityRequiredARRowsAdmin = ref(0);
let quantityRequiredBalanceRows = ref(0);

onMounted(async () => {
  try {
    const [userResult, balanceResult, advanceResult] = await Promise.all([
      storeUsers.getUser(),
      storeBalance.getBalanceRows(),
      storeAdvanceReports.getAdvancedReportsForSidebar(),
    ]);

    user.value = userResult;
    requestsBalance.value = balanceResult;
    requestsAdvanceReport.value = advanceResult;

    quantityRequiredARRows.value = requestsAdvanceReport.value?.filter(
      (row) =>
        !row.received &&
        row.issuedUser === user.value.username &&
        row.notation !== "Пополнение баланса"
    ).length;
    quantityRequiredARRowsAdmin.value = requestsAdvanceReport.value?.filter(
      (row) =>
        !row.received &&
        (row.issuedUser === user.value.username ||
          row.issuedUser === "Директор (С)") &&
        row.notation !== "Пополнение баланса"
    ).length;
    quantityRequiredBalanceRows.value = requestsBalance.value?.filter(
      (row) =>
        row.issued &&
        !row.received &&
        (row.receivedUser2 === user.value.username ||
          row.receivedUser2 === "Нет")
    ).length;
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
  <SidebarAside
    :user="user"
    @sign-out="signOut"
    @edit-menu="editMenu"
    v-auto-animate
    v-if="isOpen"
  />

  <div
    class="fixed bg-gradient-to-tr from-white via-white to-yellow-100 bg-image m-auto top-0 bottom-0 left-0 right-0 z-[200] hidden max-md:block overflow-auto"
    v-if="
      isOpen &&
      (route.fullPath.includes('+') ||
        route.fullPath === '/spreadsheets/our-ransom' ||
        route.fullPath === '/spreadsheets/client-ransom' ||
        route.fullPath === '/spreadsheets/delivery' ||
        route.fullPath === '/equipment' ||
        route.fullPath === '/advance-report/summary-tables')
    "
  >
    <nav class="gap-1 p-2 text-2xl font-sans mt-10 font-normal text-black">
      <SidebarAsideMobile
        :user="user"
        @sign-out="signOut"
        @edit-menu="editMenu"
        v-auto-animate
        v-if="isOpen"
      />
    </nav>
  </div>

  <div
    class="fixed w-screen h-screen bg-gray-50 top-0 bottom-0 z-[200] hidden max-md:flex items-start overflow-auto"
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
      class="flex flex-col pt-24 text-lg space-y-1 w-full gap-1 h-screen font-sans font-normal text-black"
    >
      <SidebarAsideMobileNormal
        :user="user"
        @sign-out="signOut"
        @edit-menu="editMenu"
        v-auto-animate
        v-if="isOpen"
      />
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
        route.fullPath === '/equipment' ||
        route.fullPath === '/advance-report/payroll',
    }"
    class="py-1 px-3 fixed z-40 max-xl:right-0 flex items-center max-sm:gap-3 justify-between duration-200 w-full bg-gradient-to-br from-purple-700 to-orange-400 backdrop-blur-2xl text-white"
  >
    <div class="flex items-center gap-1">
      <Icon
        @click="editMenu"
        size="40"
        name="i-ic-round-menu"
        class="hover:opacity-50 duration-200 cursor-pointer"
      />
      <Icon
        v-if="quantityRequiredBalanceRows"
        name="pepicons-print:exclamation"
        size="24"
        class="text-red-700"
      />
      <Icon
        v-if="user.username !== 'Директор' && quantityRequiredARRows"
        name="pepicons-print:exclamation"
        size="40"
        class="text-red-700"
      />
      <Icon
        v-if="user.username === 'Директор' && quantityRequiredARRowsAdmin"
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
      v-if="
        route.meta.name === 'Товары из' &&
        route.fullPath.includes('/our-ransom')
      "
    >
      {{ route.meta.name }} {{ route.params.pvz }} (Товары клиентов)
    </h1>
    <h1
      class="text-lg font-medium max-sm:text-sm"
      v-else-if="
        route.fullPath.includes('/client-ransom') &&
        route.params.pvz &&
        !route.params.fromName
      "
    >
      Товары из {{ route.meta.name }} {{ route.params.pvz }} (Доставка заказов по ШК (QR))
    </h1>
    <h1
      class="text-lg font-medium max-sm:text-sm"
      v-else-if="
        route.fullPath.includes('/client-ransom') &&
        route.params.pvz &&
        route.params.fromName
      "
    >
      Товары по телефону:
      {{ formatPhoneNumber(route.params.fromName as string) }} (Доставка заказов по ШК (QR))
    </h1>
    <h1
      class="text-lg font-medium max-sm:text-sm"
      v-else-if="
        route.fullPath.includes('/our-ransom') &&
        route.params.pvz &&
        route.params.fromName
      "
    >
      Товары по телефону:
      {{ formatPhoneNumber(route.params.fromName as string) }} (Товары клиентов)
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
