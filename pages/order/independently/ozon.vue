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

const settings = ref<Array<any>>([]);
const storeUsers = useUsersStore();
onMounted(async () => {
  address.value =
    JSON.parse(localStorage.getItem("addressData") as string) || "";
  let isNotAsking = localStorage.getItem("isNotAskingOZ");
  if (isNotAsking) {
    isNotAskingOZ.value = true;
  }
  selectedPVZClient.value = address.value;
  settings.value = await storeUsers.getSettings();
});

definePageMeta({
  layout: "client-no-pad-registration",
});

let isNotAskingOZ = ref(false);
const cookieExpires = 7 * 365 * 100;

function saveAddress(address: string) {
  localStorage.setItem("addressData", JSON.stringify(address));
  selectedPVZClient.value = address;

  if (route.query.change === "true" && route.query.card !== "true") {
    toast.success("Вы успешно сменили адрес пункта выдачи!");
    router.push("/client/main?notification=false");
  }

  if (route.query.change === "true" && route.query.card === "true") {
    toast.success("Вы успешно сменили адрес пункта выдачи!");
    router.push("/client/order/accept-order?card=true");
  }

  if (
    route.query.change === "true" &&
    route.query.delivery === "true" &&
    route.query.marketplace
  ) {
    router.push(`/client/delivery?marketplace=${route.query.marketplace}`);
  }

  if (route.query.accept === "true") {
    router.push("/client/order/accept-order");
  }
}

function skipWindow() {
  localStorage.setItem("isNotAskingOZ", true);
  router.push("/delivery?marketplace=ozon");
}

function clearValue() {
  isNotAskingOZ.value = false;
}

let isShowWarning = ref(true);
</script>

<template>
  <Head>
    <Title>Оформить заказ самостоятельно</Title>
  </Head>
  <div v-if="!isLoading">
    <div>
      <div class="flex items-center justify-center">
        <div
          class="flex items-center justify-center"
          v-if="selectedPVZClient && route.query.change !== 'true'"
        >
          <div
            v-if="!isNotAskingOZ"
            class="flex items-center justify-center w-screen px-3 flex-col h-screen"
          >
            <UButton
              v-if="settings[0]"
              @click="skipWindow()"
              to="https://ozon.ru/point/468539"
              target="_blank"
              icon="i-mdi-package-variant-closed-plus"
              size="xl"
              color="blue"
              variant="solid"
              class="font-semibold duration-200 w-full max-w-[500px]"
              :trailing="false"
              >Нажмите тут для подтверждения адреса пункта заказа
              интернет-магазина « {{ settings[0].address }} »</UButton
            >
          </div>
          <div class="h-screen flex items-center justify-center" v-else>
            <div class="text-center">
              <div class="max-w-[910px] mt-5">
                <h1>
                  Вам необязательно снова выбирать адрес, Вы можете сразу
                  переходить в раздел: <br />
                  <UButton
                    @click="router.push('/client/delivery?marketplace=ozon')"
                    class="font-bold m-5 text-left"
                    icon="i-mdi-truck-delivery"
                    size="xl"
                    color="blue"
                    >Оформить доставку Вашего <br class="hidden max-sm:block" />
                    заказа из интернет-магазина по Штрих-коду (QR)</UButton
                  >
                  <br />
                  для оформления доставки на пункт выдачи заказов на территории
                  ДНР
                </h1>
                <UButton
                  @click="clearValue"
                  class="font-bold mt-24 text-left"
                  icon="i-carbon-continue"
                  size="xl"
                  color="blue"
                  >Всё равно продолжить</UButton
                >
              </div>
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
