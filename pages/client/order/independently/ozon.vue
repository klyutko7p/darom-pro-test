<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();
const route = useRoute();

const token = Cookies.get("token");
let isLoading = ref(false);
const selectedPVZClient = ref("");
const address = ref("");

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }
  address.value = localStorage.getItem("addressData") || "";
  let isNotAsking = localStorage.getItem("isNotAskingOZ");
  if (isNotAsking) {
    isNotAskingOzon.value = true;
  }
  selectedPVZClient.value = address.value;
});

definePageMeta({
  layout: "client",
});

let isNotAskingOzon = ref(false);
const cookieExpires = 7 * 365 * 100;

function saveAddress(address: string) {
  localStorage.setItem("addressData", JSON.stringify(address));
  selectedPVZClient.value = address;

  if (route.query.change === "true") {
    toast.success("Вы успешно сменили адрес пункта выдачи!");
    router.push("/client/main?notification=false");
  }

  if (route.query.accept === "true") {
    router.push("/client/order/accept-order");
  }
}

function skipWindow() {
  if (isNotAskingOzon.value) {
    localStorage.setItem("isNotAskingOZ", JSON.stringify(true));
  }

  router.push("/client/order/info/ozon");
}
</script>

<template>
  <Head>
    <Title>Оформить заказ самостоятельно</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div>
        <div v-if="selectedPVZClient && route.query.change !== 'true'">
          <div
            v-if="!isNotAskingOzon"
            class="flex items-center justify-center flex-col h-screen"
          >
            <UButton
              @click="skipWindow()"
              to="https://ozon.ru/point/443054"
              target="_blank"
              icon="i-mdi-package-variant-closed-plus"
              size="xl"
              color="blue"
              variant="solid"
              class="font-semibold duration-200 w-full max-w-[500px]"
              :trailing="false"
              >Нажмите тут для подтверждения адреса пункта заказа
              интернет-магазина</UButton
            >
          </div>
          <div class="h-screen flex items-center justify-center" v-else>
            <div class="text-center">
              <div class="max-w-[910px] mt-5">
                <h1>
                  Вам необязательно снова выбирать адрес, Вы можете сразу
                  переходить в раздел: <br />
                  <UButton
                    @click="router.push('/client/delivery')"
                    class="font-bold m-5 text-left"
                    icon="i-mdi-truck-delivery"
                    size="xl"
                    color="blue"
                    >Оформить доставку заказа <br class="hidden max-sm:block" />
                    по ШК (QR)</UButton
                  >
                  <br />
                  для оформления доставки на пункт выдачи заказов на территории
                  ДНР
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <IndependentlyMap :marketplace="'OZON'" @save-address="saveAddress" />
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
