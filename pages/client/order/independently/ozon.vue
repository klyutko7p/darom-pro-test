<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();
const route = useRoute();

const token = Cookies.get("token");
let isLoading = ref(false);
const selectedPVZClient = ref("");
const address = ref(localStorage.getItem("addressData") || "");

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }
  let isNotAsking = localStorage.getItem("isNotAskingOzon");
  if (isNotAsking) {
    router.push("/client/main?notification=false");
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
    localStorage.setItem("isNotAskingOzon", JSON.stringify(true));
  }

  toast.success("Вы успешно назначили адрес!");
  router.push("/client/main?notification=false");
}
</script>

<template>
  <Head>
    <Title>Оформить заказ самостоятельно</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div>
        <div v-if="selectedPVZClient">
          <div class="flex items-center justify-center flex-col h-screen">
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
            <div class="flex items-center gap-3 mt-7">
              <div>
                <input
                  class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 checked:ring-[2px] focus:ring-offset-transparent form-checkbox rounded bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ring-[2px] bg-transparent checked:ring-[#005df6] text-[#005df6] ring-[#005df6] focus-visible:ring-[#005df6] focus:ring-[#005df6]"
                  v-model="isNotAskingOzon"
                  id="isNotAskingOzon"
                  name="isNotAskingOzon"
                  type="checkbox"
                />
              </div>
              <label for="isNotAskingOzon" class="italic text-base"
                >Больше не спрашивать</label
              >
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
