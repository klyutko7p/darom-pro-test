<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
const router = useRouter();

const toast = useToast();

const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login?stay=true");
  }
});

definePageMeta({
  layout: "client",
});

function skipWindow() {
  localStorage.setItem("isNotAskingWB", JSON.stringify(true));
  router.push("/client/main");
}
</script>

<template>
  <Head>
    <Title>Поздравляем!</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="h-screen flex items-center justify-center">
        <div class="text-center">
          <h1
            class="text-6xl font-semibold max-sm:text-5xl text-[#ec208b] max-[360px]:text-4xl mb-5 uppercase"
          >
            Поздравляем!
          </h1>
          <div class="flex items-center gap-5 max-lg:flex-col">
            <div class="max-sm:hidden">
              <Icon
                name="i-material-symbols-desktop-windows"
                size="32"
                class="text-[#ec208b]"
              />
              <NuxtImg
                class="w-[300px] h-[90px] border-[1px] rounded-md"
                src="/images/wb/final-wb-pc.jpg"
              />
            </div>
            <div>
              <Icon name="i-prime-apple" size="32" class="text-[#ec208b]" />
              <NuxtImg
                class="w-[300px] h-[90px] border-[1px] rounded-md"
                src="/images/wb/final-wb-ios.jpg"
              />
            </div>
            <div>
              <Icon
                name="i-material-symbols-android"
                size="32"
                class="text-[#ec208b]"
              />
              <NuxtImg
                class="w-[300px] h-[90px] border-[1px] rounded-md"
                src="/images/wb/final-wb-and.jpg"
              />
            </div>
          </div>
          <div class="max-w-[910px] mt-5">
            <h1>
              Если Вы верно указали адрес, то можете заказывать товар и после
              уведомления о доставке по адресу:
              <span class="text-[#ec208b] font-semibold">
                Ростовская область, Матвеево-Курганский район, Село Ряженое,
                Улица Ленина 6
              </span>
              прикрепите Ваш Штрих-код (QR) в: <br />
              <UButton
                @click="router.push('/client/delivery?marketplace=wb')"
                class="font-bold m-5 text-left"
                icon="i-mdi-truck-delivery"
                size="xl"
                color="pink"
                >Оформить доставку Вашего <br class="hidden max-sm:block" /> заказа 
                из интернет-магазина по QR</UButton
              >
              <br />
              для оформления доставки на пункт выдачи заказов на территории ДНР
            </h1>
          </div>
          <div class="mt-5">
            <UButton
              @click="skipWindow"
              icon="i-line-md-circle-to-confirm-circle-transition"
              size="xl"
              color="pink"
              class="font-semibold"
              >Подтвердить</UButton
            >
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
