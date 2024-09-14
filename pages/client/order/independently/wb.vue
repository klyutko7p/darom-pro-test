<script setup lang="ts">
import Cookies from "js-cookie";
const router = useRouter();

const token = Cookies.get("token");
let isLoading = ref(false);
const selectedPVZClient = ref("");
const address = ref(localStorage.getItem("addressData") || "");

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }
  let isNotAsking = localStorage.getItem("isNotAskingWB");
  if (isNotAsking) {
    router.push("/client/delivery?marketplace=wb");
  }
  selectedPVZClient.value = address.value;
});

definePageMeta({
  layout: "client",
});

let isNotAskingWB = ref(false);
const cookieExpires = 7 * 365 * 100;

function saveAddress(address: string) {
  localStorage.setItem("addressData", JSON.stringify(address));
  selectedPVZClient.value = address;
}

function skipWindow() {
  if (isNotAskingWB.value) {
    localStorage.setItem("isNotAskingWB", JSON.stringify(true));
  }

  router.push("/client/delivery?marketplace=wb");
}

let isShowModal = ref(false);

function showModal() {
  isShowModal.value = true;
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
              icon="i-mdi-package-variant-closed-plus"
              @click="showModal"
              size="xl"
              color="pink"
              variant="solid"
              class="font-semibold text-left duration-200 w-full max-w-[500px]"
              :trailing="false"
              >Нажмите тут для подтверждения адреса пункта заказа
              интернет-магазина</UButton
            >
            <div class="flex items-center gap-3 mt-7">
              <div>
                <input
                  class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 checked:ring-[2px] focus:ring-offset-transparent form-checkbox rounded bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ring-[2px] bg-transparent checked:ring-[#ec208b] text-[#ec208b] ring-[#ec208b] focus-visible:ring-[#ec208b] focus:ring-[#ec208b]"
                  v-model="isNotAskingWB"
                  id="isNotAskingWB"
                  name="isNotAskingWB"
                  type="checkbox"
                />
              </div>
              <label for="isNotAskingWB" class="italic text-base"
                >Больше не спрашивать</label
              >
            </div>
          </div>
        </div>
        <div v-else>
          <IndependentlyMap :marketplace="'WB'" @save-address="saveAddress" />
        </div>
      </div>

      <UINewModalEditNoPadding
        v-show="isShowModal"
        @close-modal="isShowModal = !isShowModal"
      >
        <template v-slot:icon-header> </template>
        <template v-slot:header>Инструкция</template>
        <template v-slot:body>
          <div class="text-left px-3 pt-10 pb-10">
            <div>
              <h1 class="text-lg text-center mb-5">
                При заказе на WILDBERRIES выберите пункт выдачи по этому адресу
              </h1>
              <h1 class="italic text-sm font-bold bg-gray-100 p-3">
                Ростовская обл, Матвеево-Курганский <br />
                р-н, с. Ряженое, ул. Ленина 6
              </h1>
            </div>
            <div class="flex items-center justify-center">
              <UButton
                @click="skipWindow()"
                icon="i-octicon-tracked-by-closed-completed-16"
                size="lg"
                color="pink"
                variant="solid"
                class="font-semibold duration-200 mt-10"
                :trailing="false"
                >Сделано</UButton
              >
            </div>
          </div>
        </template>
      </UINewModalEditNoPadding>
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
