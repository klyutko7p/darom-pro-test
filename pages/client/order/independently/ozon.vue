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
const storePVZ = usePVZStore();
const pvzs = ref<Array<PVZ>>([]);
onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login?stay=true");
  }
  address.value =
    JSON.parse(localStorage.getItem("addressData") as string) || "";
  let isNotAsking = localStorage.getItem("isNotAskingOZ");
  if (isNotAsking) {
    isNotAskingOZ.value = true;
  }
  selectedPVZClient.value = address.value;
  isLoading.value = true;
  pvzs.value = await storePVZ.getPVZ();
  settings.value = await storeUsers.getSettings();
  isLoading.value = false;
});

definePageMeta({
  layout: "client-map",
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
  router.push("/client/delivery?marketplace=ozon");
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
    <div v-if="token">
      <div>
        <div v-if="selectedPVZClient && route.query.change !== 'true'">
          <div
            v-if="!isNotAskingOZ"
            class="flex items-center justify-center flex-col h-screen"
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
              интернет-магазина «{{ settings[0].address }}»</UButton
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
        <div v-else>
          <IndependentlyMap
            :pvzs="pvzs"
            :marketplace="'OZON'"
            @save-address="saveAddress"
          />

          <div>
            <UModal
              :ui="{
                container: 'flex items-center justify-center text-center',
              }"
              v-auto-animate
              v-model="isShowWarning"
              prevent-close
            >
              <UCard
                v-auto-animate
                :ui="{
                  ring: '',
                  divide: 'divide-y divide-gray-100 dark:divide-gray-800',
                }"
              >
                <template #header>
                  <div class="flex items-center justify-between">
                    <h3
                      class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                    >
                      Пункт выдачи
                    </h3>
                    <Icon
                      @click="isShowWarning = !isShowWarning"
                      name="i-heroicons-x-mark-20-solid"
                      size="24"
                      class="cursor-pointer hover:text-secondary-color duration-200"
                    />
                  </div>
                </template>
                <div class="text-center">
                  <h1>Для продолжения Вам нужно выбрать пункт выдачи!</h1>
                  <div class="max-md:flex items-center justify-center">
                    <UButton
                      @click="isShowWarning = !isShowWarning"
                      class="my-3 font-semibold uppercase"
                      >Понятно</UButton
                    >
                  </div>
                </div>
              </UCard>
            </UModal>
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
