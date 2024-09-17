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
  layout: "client-no-pad",
});
</script>

<template>
  <Head>
    <Title>Оформить заказ самостоятельно</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div>
        <div
          class="bg-[#0763f6cd] w-screen flex items-center justify-center h-[230px] max-sm:h-[200px] cursor-pointer hover:opacity-70 duration-200"
          @click="router.push('independently/ozon')"
        >
        <img
            src="@/assets/images/ozon-bg-1.png"
            class="max-w-[170px] max-sm:max-w-[130px] shadow-2xl shadow-black rounded-full"
            alt=""
          />
        </div>
        <div
          class="bg-gradient-to-r from-[#7c2570] via-[#bb3c95] to-[#ec208b] w-screen flex items-center justify-center h-[230px] max-sm:h-[200px] cursor-pointer hover:opacity-70 duration-200"
          @click="router.push('independently/wb')"
        >
          <img
            src="@/assets/images/wb.png"
            class="max-w-[470px] max-sm:max-w-[300px] z-[10]"
            alt=""
          />
        </div>
        <div
          class="bg-[#f8cf02] w-screen flex items-center justify-center h-[230px] max-sm:h-[200px] cursor-pointer hover:opacity-70 duration-200"
          @click="router.push('independently/ym')"
        >
          <img
            src="@/assets/images/ym.png"
            class="max-w-[470px] max-sm:max-w-[300px]"
            alt=""
          />
        </div>
        <a
          href="https://t.me/Svetlana_Darompro"
          target="_blank"
          class="bg-secondary-color h-[230px] max-sm:h-[200px] flex items-center justify-center cursor-pointer hover:opacity-70 duration-200"
        >
          <h1
            class="uppercase text-5xl max-sm:text-3xl font-bold text-white text-center"
          >
            Другой интернет-магазин
          </h1>
        </a>
      </div>
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
