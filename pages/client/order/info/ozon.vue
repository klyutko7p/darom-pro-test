<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
const router = useRouter();

const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }
});

definePageMeta({
  layout: "client",
});

function skipWindow() {
  localStorage.setItem("isNotAskingOZ", JSON.stringify(true));
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
            class="text-6xl text-[#005df6] font-semibold max-sm:text-5xl max-[360px]:text-4xl mb-5 uppercase"
          >
            Поздравляем!
          </h1>
          <div class="flex items-center gap-5 max-lg:flex-col">
            <div class="max-sm:hidden">
              <Icon
                name="i-material-symbols-desktop-windows"
                size="32"
                class="text-[#005df6]"
              />
              <NuxtImg
                class="w-[300px] h-[90px] border-[1px] rounded-md"
                src="/images/ozon/final-ozon-pc.jpg"
              />
            </div>
            <div>
              <Icon name="i-prime-apple" size="32" class="text-[#005df6]" />
              <NuxtImg
                class="w-[300px] h-[90px] border-[1px] rounded-md"
                src="/images/ozon/final-ozon-ios.jpg"
              />
            </div>
            <div>
              <Icon
                name="i-material-symbols-android"
                size="32"
                class="text-[#005df6]"
              />
              <NuxtImg
                class="w-[300px] h-[90px] border-[1px] rounded-md"
                src="/images/ozon/final-ozon-and.jpg"
              />
            </div>
          </div>
          <div class="max-w-[910px] mt-5">
            <h1>
              Если адрес указан верный, то можете заказывать товар и после
              уведомления о доставке по адресу:
              <span class="text-[#005df6] font-semibold">
                Ростовская область, Матвеево-Курганский район, Село Ряженое,
                Улица Ленина 6
              </span>
              переходите в раздел: <br />
              <UButton
                @click="router.push('/client/delivery?marketplace=oz')"
                class="font-bold m-5 text-left"
                icon="i-mdi-truck-delivery"
                size="xl"
                color="blue"
                >Оформить доставку заказа <br class="hidden max-sm:block" />
                по Штрих-коду (QR)</UButton
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
              color="blue"
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
