<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const router = useRouter();

let user = ref({} as User);
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  await storeRansom.getSumOfRejection();
  isLoading.value = false;
});



function signOut() {
  storeUsers.signOut();
}

definePageMeta({
  layout: "user",
});
</script>

<template>
  <Head>
    <Title>Главная страница</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="py-5">
        <h1 class="text-xl mt-10 mb-10">Приветствуем, {{ user.username }}!</h1>
        <div>
          <h1
            class="font-bold text-6xl max-[400px]:text-4xl max-md:text-center text-secondary-color mb-5"
          >
            DAROM.PRO
          </h1>
          <div
            role="button"
            @click="
              user.role !== 'SORTIROVKA'
                ? router.push('/spreadsheets/our-ransom/info')
                : router.push('/spreadsheets/our-ransom')
            "
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
          </div>
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
      </div>
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
