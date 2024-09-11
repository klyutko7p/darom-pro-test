<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();
const route = useRoute();

const token = Cookies.get("token");
let isLoading = ref(false);
const selectedPVZClient = ref("");
const address = ref(Cookies.get("addressCookie") || "");

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }
  let isNotAsking = Cookies.get("isNotAskingOzon");
  if (isNotAsking) {
    router.push("/client/delivery?marketplace=ozon");
  }
  selectedPVZClient.value = address.value;
});

definePageMeta({
  layout: "client",
});

let isNotAskingOzon = ref(false);
const cookieExpires = 7 * 365 * 100;

function saveAddress(address: string) {
  Cookies.set("addressCookie", JSON.stringify(address), {
    expires: cookieExpires,
  });
  selectedPVZClient.value = address;

  if (route.query.change === "true") {
    toast.success("Вы успешно сменили адрес пункта выдачи!");
    router.push("/client/main");
  }

  if (route.query.accept === "true") {
    router.push("/client/order/accept-order");
  }
}

function skipWindow() {
  if (isNotAskingOzon.value) {
    Cookies.set("isNotAskingOzon", JSON.stringify(true), {
      expires: cookieExpires,
    });
  }

  router.push("/client/delivery?marketplace=ozon");
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
          <div class="flex items-center justify-center flex-col py-56">
            <UButton
              @click="router.push('/client/delivery?marketplace=ozon')"
              to="https://ozon.ru/point/443054"
              target="_blank"
              icon="i-mdi-package-variant-closed-plus"
              size="xl"
              color="blue"
              variant="solid"
              class="font-semibold duration-200 w-full max-w-[500px]"
              :trailing="false"
              >Нажмите тут для подтверждения адреса пункта заказа интернет-заказа</UButton
            >
            <h1 class="text-6xl my-16">ИЛИ</h1>
            <UButton
              @click="skipWindow"
              target="_blank"
              icon="i-solar-skip-next-bold"
              size="xl"
              color="blue"
              variant="solid"
              class="font-semibold duration-200 w-full max-w-[500px]"
              :trailing="false"
              >Пропустить</UButton
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
