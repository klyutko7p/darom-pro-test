<script setup lang="ts">
import Cookies from "js-cookie";

const storeClients = useClientsStore();
const router = useRouter();

let user = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);
const settings = ref<Array<any>>([]);
const storeUsers = useUsersStore();
onMounted(async () => {
  getActualNameSite();
  if (!token) {
    router.push("/auth/client/login?stay=true");
  }
  settings.value = await storeUsers.getSettings();
  isLoading.value = true;
  user.value = await storeClients.getClient();
  isLoading.value = false;
});

definePageMeta({
  layout: "client",
});

let linkData = ref("");
function getActualNameSite() {
  if (window) {
    linkData.value = window.location.href.split("/")[2].split("/")[0];
  }
}
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
            <div
              v-if="linkData.includes('trackbiz.netlify.app')"
              class="flex items-center gap-5 flex-col max-w-[500px]"
            >
              <a href="https://t.me/WBDok" target="_blank" class="w-full">
                <UIMainButton
                  class="w-full"
                  @click="router.push('/client/main?notification=false')"
                  >Заказать через администратора (улица Ленина,
                  34/5)</UIMainButton
                >
              </a>
              <a href="https://t.me/WBsever" target="_blank" class="w-full">
                <UIMainButton
                  class="w-full"
                  @click="router.push('/client/main?notification=false')"
                  >Заказать через администратора (Центральная улица,
                  83)</UIMainButton
                >
              </a>
              <a
                href="https://t.me/punkt1off_bot"
                target="_blank"
                class="w-full"
              >
                <UIMainButton
                  class="w-full"
                  @click="router.push('/client/main?notification=false')"
                  >Заказать через телеграм-бота</UIMainButton
                >
              </a>
              <!-- <UIMainButton
                class="w-full"
                @click="router.push('order/accept-order')"
                >Заказать через личный кабинет</UIMainButton
              > -->
              <UIMainButton
                class="w-full"
                @click="router.push('/client/main?notification=false')"
                >Назад</UIMainButton
              >
            </div>
            <div v-else class="flex items-center gap-5 flex-col max-w-[500px]">
              <a
                target="_blank"
                class="w-full"
              >
                <UIMainButton
                  class="w-full"
                  @click="router.push('/client/main?notification=false')"
                  >Заказать через администратора</UIMainButton
                >
              </a>
              <a
                href="https://t.me/punkt1off_bot"
                target="_blank"
                class="w-full"
              >
                <UIMainButton
                  class="w-full"
                  @click="router.push('/client/main?notification=false')"
                  >Заказать через телеграм-бота</UIMainButton
                >
              </a>
              <UIMainButton
                class="w-full"
                @click="router.push('order/accept-order')"
                >Заказать через личный кабинет</UIMainButton
              >
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
