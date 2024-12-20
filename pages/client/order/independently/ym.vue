<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
const router = useRouter();
const toast = useToast();
const token = Cookies.get("token");
let isLoading = ref(false);
const selectedPVZClient = ref("");
const address = ref("");

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login?stay=true");
  }
  address.value = localStorage.getItem("addressData") || "";
  let isNotAsking = localStorage.getItem("isNotAskingYM");
  if (isNotAsking) {
    isNotAskingYM.value = true;
  } else {
    showModal();
  }
  selectedPVZClient.value = address.value;
});

definePageMeta({
  layout: "client",
});

let isNotAskingYM = ref(false);
const cookieExpires = 7 * 365 * 100;

function saveAddress(address: string) {
  localStorage.setItem("addressData", JSON.stringify(address));
  selectedPVZClient.value = address;
}

function skipWindow() {
  window.open("https://market.yandex.ru/", "_blank");
  router.push("/client/delivery?marketplace=ym");
  localStorage.setItem("isNotAskingYM", true);
}

let isShowModal = ref(false);

function showModal() {
  isShowModal.value = true;
}

let isClickedCounter = ref(0);
async function writeClipboardText(text: any) {
  try {
    await navigator.clipboard.writeText(text);
    isClickedCounter.value += 1;
  } catch (error: any) {
    console.error(error.message);
  }
}

const items = [
  {
    label: "Компьютер",
    icon: "i-material-symbols-desktop-windows",
    defaultOpen: false,
    slot: "desktop",
  },
  {
    label: "iOS",
    icon: "i-prime-apple",
    defaultOpen: false,
    slot: "ios",
  },
  {
    label: "Android",
    icon: "i-material-symbols-android",
    defaultOpen: false,
    slot: "android",
  },
];

let imgUrl = ref("");
let isOpenDesktop = ref(false);
let isOpenIOS = ref(false);
let isOpenAndroid = ref(false);

function openDesktop(number: number) {
  isShowModal.value = false;
  isOpenDesktop.value = true;

  if (number === 1) {
    imgUrl.value = "1-desk.png";
    return;
  }
  if (number === 2) {
    imgUrl.value = "2-desk.png";
    return;
  }

  if (number === 3) {
    imgUrl.value = "3-desk.png";
    return;
  }

  if (number === 4) {
    imgUrl.value = "4-desk.png";
    return;
  }
}

function openAndroid(number: number) {
  isShowModal.value = false;
  isOpenAndroid.value = true;

  if (number === 1) {
    imgUrl.value = "1-andr.png";
    return;
  }
  if (number === 2) {
    imgUrl.value = "2-andr.png";
    return;
  }

  if (number === 3) {
    imgUrl.value = "3-andr.png";
    return;
  }

  if (number === 4) {
    imgUrl.value = "4-andr.png";
    return;
  }

  if (number === 5) {
    imgUrl.value = "5-andr.png";
    return;
  }
}

function openIOS(number: number) {
  isShowModal.value = false;
  isOpenIOS.value = true;

  if (number === 1) {
    imgUrl.value = "1-andr.png";
    return;
  }
  if (number === 2) {
    imgUrl.value = "2-andr.png";
    return;
  }

  if (number === 3) {
    imgUrl.value = "3-andr.png";
    return;
  }

  if (number === 4) {
    imgUrl.value = "4-andr.png";
    return;
  }

  if (number === 5) {
    imgUrl.value = "5-andr.png";
    return;
  }
}

function clearValue() {
  isNotAskingYM.value = false;
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
          <div
            class="h-screen flex items-center justify-center"
            v-if="isNotAskingYM"
          >
            <div class="text-center">
              <div class="max-w-[910px] mt-5">
                <h1>
                  Вам необязательно снова выбирать адрес, Вы можете сразу
                  переходить в раздел: <br />
                  <UButton
                    @click="router.push('/client/delivery?marketplace=ym')"
                    class="font-bold m-5 text-left"
                    icon="i-mdi-truck-delivery"
                    size="xl"
                    color="yellow"
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
                  color="yellow"
                  >Всё равно продолжить</UButton
                >
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <IndependentlyMap :marketplace="'YM'" @save-address="saveAddress" />
        </div>
      </div>

      <UINewModalEditNoPaddingSecond
        v-show="isShowModal"
        @close-modal="router.push('/client/delivery?marketplace=ym')"
      >
        <template v-slot:icon-header> </template>
        <template v-slot:header>Выбор адреса заказа </template>
        <template v-slot:body>
          <div class="text-left px-3 pb-10">
            <div>
              <div
                class="bg-gray-100 font-semibold rounded-xl p-3 flex items-center justify-center flex-col"
              >
                <h1 class="text-sm font-semibold">
                  Село Ряженое, Улица Ленина 6
                </h1>
                <UButton
                  @click="writeClipboardText('Село Ряженое, Улица Ленина 6')"
                  target="_blank"
                  icon="i-material-symbols-content-copy"
                  size="sm"
                  color="yellow"
                  variant="solid"
                  class="font-semibold duration-200 mt-3"
                  :trailing="false"
                  >Скопировать адрес</UButton
                >
              </div>

              <div class="flex justify-center">
                <UButton
                  :disabled="isClickedCounter === 0"
                  @click="
                    writeClipboardText('Село Ряженое, Улица Ленина 6'),
                      skipWindow()
                  "
                  target="_blank"
                  icon="i-mdi-package-variant-closed-check"
                  size="sm"
                  color="yellow"
                  variant="solid"
                  class="font-semibold text-left duration-200 w-full max-w-[500px] mt-3"
                  :trailing="false"
                  >Нажмите сюда, чтобы указать скопированный адрес для заказа
                  товара на ЯНДЕКС МАРКЕТ</UButton
                >
              </div>

              <h1 class="mt-5 mb-3 italic text-sm">
                Инструкция по выбору адреса заказа
              </h1>
              <UAccordion color="yellow" :items="items">
                <template #item="{ item }">
                  <p
                    class="italic text-gray-900 dark:text-white text-center font-semibold"
                  >
                    {{ item.description }}
                  </p>
                </template>

                <template #desktop>
                  <div
                    class="text-gray-900 dark:text-white text-left bg-gray-50 px-3 py-1"
                  >
                    <div class="space-y-3">
                      <h1 class="text-sm italic">1.</h1>
                      <img
                        src="/images/ym/1-desk.png"
                        @click="openDesktop(1)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">2.</h1>
                      <img
                        src="/images/ym/2-desk.png"
                        @click="openDesktop(2)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">3.</h1>
                      <img
                        src="/images/ym/3-desk.png"
                        @click="openDesktop(3)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">4.</h1>
                      <img
                        src="/images/ym/4-desk.png"
                        @click="openDesktop(4)"
                        class="cursor-pointer"
                        alt=""
                      />
                    </div>

                    <UModal v-model="isOpenDesktop" fullscreen>
                      <UCard
                        :ui="{
                          base: 'h-full flex flex-col',
                          background: 'bg-gray-100',
                          rounded: '',
                          divide:
                            'divide-y divide-gray-300 dark:divide-gray-800',
                          body: {
                            base: 'grow',
                          },
                        }"
                      >
                        <template #header>
                          <div class="flex items-center justify-between">
                            <h3
                              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                            >
                              Компьютер
                            </h3>
                            <UButton
                              color="gray"
                              variant="ghost"
                              icon="i-heroicons-x-mark-20-solid"
                              class="-my-1"
                              @click="
                                (isOpenDesktop = false), (isShowModal = true)
                              "
                            />
                          </div>
                        </template>

                        <div class="flex justify-center">
                          <NuxtImg
                            :src="'images/ym/' + imgUrl"
                            class="w-full max-w-[1000px]"
                            alt=""
                          />
                        </div>
                      </UCard>
                    </UModal>
                  </div>
                </template>

                <template #ios>
                  <div class="text-gray-900 dark:text-white text-left">
                    <div
                      class="text-gray-900 dark:text-white text-left bg-gray-50 px-3 py-1"
                    >
                      <div class="space-y-3">
                        <h1 class="text-sm italic">1.</h1>
                        <img
                          src="/images/ym/1-andr.png"
                          @click="openIOS(1)"
                          class="cursor-pointer"
                          alt=""
                        />

                        <h1 class="text-sm italic">2.</h1>
                        <img
                          src="/images/ym/2-andr.png"
                          @click="openIOS(2)"
                          class="cursor-pointer"
                          alt=""
                        />

                        <h1 class="text-sm italic">3.</h1>
                        <img
                          src="/images/ym/3-andr.png"
                          @click="openIOS(3)"
                          class="cursor-pointer"
                          alt=""
                        />

                        <h1 class="text-sm italic">4.</h1>
                        <img
                          src="/images/ym/4-andr.png"
                          @click="openIOS(4)"
                          class="cursor-pointer"
                          alt=""
                        />

                        <h1 class="text-sm italic">5.</h1>
                        <img
                          src="/images/ym/5-andr.png"
                          @click="openIOS(5)"
                          alt=""
                          class="cursor-pointer"
                        />
                      </div>

                      <UModal v-model="isOpenIOS" fullscreen>
                        <UCard
                          :ui="{
                            base: 'h-full flex flex-col',
                            background: 'bg-gray-100',
                            rounded: '',
                            divide:
                              'divide-y divide-gray-300 dark:divide-gray-800',
                            body: {
                              base: 'grow',
                            },
                          }"
                        >
                          <template #header>
                            <div class="flex items-center justify-between">
                              <h3
                                class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                              >
                                IOS
                              </h3>
                              <UButton
                                color="gray"
                                variant="ghost"
                                icon="i-heroicons-x-mark-20-solid"
                                class="-my-1"
                                @click="
                                  (isOpenIOS = false), (isShowModal = true)
                                "
                              />
                            </div>
                          </template>

                          <div class="flex justify-center">
                            <NuxtImg
                              :src="'images/ym/' + imgUrl"
                              class="w-full max-w-[350px]"
                              alt=""
                            />
                          </div>
                        </UCard>
                      </UModal>
                    </div>
                  </div>
                </template>

                <template #android>
                  <div
                    class="text-gray-900 dark:text-white text-left bg-gray-50 px-3 py-1"
                  >
                    <div class="space-y-3">
                      <h1 class="text-sm italic">1.</h1>
                      <img
                        src="/images/ym/1-andr.png"
                        @click="openAndroid(1)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">2.</h1>
                      <img
                        src="/images/ym/2-andr.png"
                        @click="openAndroid(2)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">3.</h1>
                      <img
                        src="/images/ym/3-andr.png"
                        @click="openAndroid(3)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">4.</h1>
                      <img
                        src="/images/ym/4-andr.png"
                        @click="openAndroid(4)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">5.</h1>
                      <img
                        src="/images/ym/5-andr.png"
                        @click="openAndroid(5)"
                        alt=""
                        class="cursor-pointer"
                      />
                    </div>

                    <UModal v-model="isOpenAndroid" fullscreen>
                      <UCard
                        :ui="{
                          base: 'h-full flex flex-col',
                          background: 'bg-gray-100',
                          rounded: '',
                          divide:
                            'divide-y divide-gray-300 dark:divide-gray-800',
                          body: {
                            base: 'grow',
                          },
                        }"
                      >
                        <template #header>
                          <div class="flex items-center justify-between">
                            <h3
                              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                            >
                              Android
                            </h3>
                            <UButton
                              color="gray"
                              variant="ghost"
                              icon="i-heroicons-x-mark-20-solid"
                              class="-my-1"
                              @click="
                                (isOpenAndroid = false), (isShowModal = true)
                              "
                            />
                          </div>
                        </template>

                        <div class="flex justify-center">
                          <NuxtImg
                            :src="'images/ym/' + imgUrl"
                            class="w-full max-w-[350px]"
                            alt=""
                          />
                        </div>
                      </UCard>
                    </UModal>
                  </div>
                </template>
              </UAccordion>
            </div>
          </div>
        </template>
      </UINewModalEditNoPaddingSecond>
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
