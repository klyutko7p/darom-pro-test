<script setup lang="ts">
import Cookies from "js-cookie";

const storeClients = useClientsStore();
const router = useRouter();

let user = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login?stay=true");
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
    <Title>Доставка по Штрих-коду (QR)</Title>
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
              Выберите как оформить доставку по Штрих-коду (QR)
            </h1>
            <div class="flex items-center gap-5 flex-col max-w-[500px]">
              <UIMainButton
                class="w-full min-w-[400px]"
                @click="router.push('/client/delivery')"
                >Через личный кабинет</UIMainButton
              >
              <a
                href="https://t.me/darom_pro_bot"
                target="_blank"
                class="w-full"
              >
                <UIMainButton
                  class="w-full min-w-[400px]"
                  @click="router.push('/client/main?notification=false')"
                  >Через телеграм-бота</UIMainButton
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
