<script setup lang="ts">
import Cookies from "js-cookie";

const storeClients = useClientsStore();
const router = useRouter();

let user = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }

  isLoading.value = true;
  user.value = await storeClients.getClient();
  isLoading.value = false;
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
          <div
            class="text-white flex items-center justify-center flex-col h-screen px-3"
          >
            <h1 class="font-bold text-2xl mb-5 max-sm:text-lg">
              Выберите как оформить заказ
            </h1>
            <div class="flex items-center gap-5 flex-col max-w-[500px]">
              <UIMainButton
                class="w-full"
                @click="router.push('order/independently')"
                >заказать Самостоятельно в интернет-магазине
                <br />
                (OZON, WB, ЯМ и другие) <br />
                с последующей доставкой
              </UIMainButton>
              <UIMainButton
                class="w-full"
                @click="router.push('order/accept-order')"
                >Заказать через личный кабинет DAROM.PRO</UIMainButton
              >
              <a
                href="https://t.me/Svetlana_Darompro"
                target="_blank"
                class="w-full"
              >
                <UIMainButton
                  class="w-full"
                  @click="router.push('/client/main?notification=false')"
                  >Заказать через администратора</UIMainButton
                >
              </a>
              <UIMainButton
                class="w-full"
                @click="router.push('/client/main?notification=false')"
                >Назад</UIMainButton
              >
            </div>
          </div>
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
