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

definePageMeta({
  layout: "client",
});
</script>

<template>
  <Head>
    <Title>Оформить заказ</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="py-10">
        <div
          class="absolute top-0 bottom-0 left-0 right-0 bg-opacity-70 bg-black z-[100] h-screen"
        >
          <div class="text-white flex items-center justify-center flex-col h-screen">
            <h1 class="font-bold text-2xl mb-5 max-sm:text-xl">Выберите как оформить заказ</h1>
            <div class="flex items-center gap-5 flex-col">
              <UIMainButton class="w-full" @click="router.push('order/independently')">Самостоятельно закажу на маркетплейсе</UIMainButton>
              <UIMainButton class="w-full" @click="router.push('order/accept-order')">Примите заказ</UIMainButton>
              <UIMainButton class="w-full" @click="router.push('/client/main')">Назад</UIMainButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center">
      <UISpinner />
  </div>
</template>
