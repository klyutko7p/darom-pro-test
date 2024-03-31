<script setup lang="ts">
import Cookies from "js-cookie";

const storeClients = useClientsStore();
const router = useRouter();

let user = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeClients.getClient();
  isLoading.value = false;
});

onMounted(() => {
  if (!token) {
    router.push("/auth/client/login");
  }
});

function signOut() {
  storeClients.signOut();
}

definePageMeta({
  layout: "client",
});
</script>

<template>
  <Head>
    <Title>Главная страница</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="py-5">
        <h1 class="text-xl mt-10 mb-10">Приветствуем, {{ user.fio }}!</h1>
        <h1
          class="font-bold text-6xl max-[400px]:text-4xl max-md:text-center text-secondary-color mb-5"
        >
          DAROM.PRO
        </h1>
        <div
        role="button"
        @click="router.push('/client/order')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols-light:order-approve-outline" size="20" />
        </div>
        <h1>Оформить заказ</h1>
      </div>
      <div
        role="button"
        @click="router.push('/client/delivery')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="carbon:delivery-truck" size="20" />
        </div>
        <h1>Доставить мой заказ</h1>
      </div>
      <div
        role="button"
        @click="router.push('/client/my-orders')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:shopping-cart-outline" size="20" />
        </div>
        <h1>Мои заказы</h1>
      </div>
      <div
        role="button"
        @click="router.push('/client/goods')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="streamline:shopping-bag-hand-bag-2-shopping-bag-purse-goods-item-products" size="20" />
        </div>
        <h1>Купленные товары</h1>
      </div>
      <div
        role="button"
        @click="router.push('/client/profile')"
        tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
      >
        <div class="grid place-items-center mr-4">
          <Icon name="material-symbols:settings-account-box-outline" size="20" />
        </div>
        <h1>Личные данные</h1>
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
    <UISpinner />
  </div>
</template>
