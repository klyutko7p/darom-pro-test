<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
const router = useRouter();

const toast = useToast();

const token = Cookies.get("token");
let isLoading = ref(false);
const selectedPVZClient = ref("");
const address = ref("");

const settings = ref<Array<any>>([]);
const storeUsers = useUsersStore();
onMounted(async () => {
  address.value =
    JSON.parse(localStorage.getItem("addressData") as string) || "";
  let isNotAsking = localStorage.getItem("isNotAskingWB");
  showModal();
  selectedPVZClient.value = address.value;
  settings.value = await storeUsers.getSettings();
});

definePageMeta({
  layout: "client-no-pad-registration",
});

let isNotAskingWB = ref(false);
const cookieExpires = 7 * 365 * 100;

function saveAddress(address: string) {
  localStorage.setItem("addressData", JSON.stringify(address));
  selectedPVZClient.value = address;
}

function skipWindow() {
  window.open("https://www.wildberries.ru/", "_blank");
  router.push("/delivery?marketplace=wb");
  localStorage.setItem("isNotAskingWB", true);
}

let isShowModal = ref(true);

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

  if (number === 5) {
    imgUrl.value = "5-desk.png";
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

  if (number === 6) {
    imgUrl.value = "6-andr.png";
    return;
  }
}

function openIOS(number: number) {
  isShowModal.value = false;
  isOpenIOS.value = true;

  if (number === 1) {
    imgUrl.value = "1-ios.png";
    return;
  }
  if (number === 2) {
    imgUrl.value = "2-ios.png";
    return;
  }

  if (number === 3) {
    imgUrl.value = "3-ios.png";
    return;
  }

  if (number === 4) {
    imgUrl.value = "4-ios.png";
    return;
  }

  if (number === 5) {
    imgUrl.value = "5-ios.png";
    return;
  }

  if (number === 6) {
    imgUrl.value = "6-ios.png";
    return;
  }
}

function clearValue() {
  isNotAskingWB.value = false;
  isShowModal.value = true;
}
</script>

<template>
  <Head>
    <Title>Оформить заказ самостоятельно</Title>
  </Head>
  <div v-if="!isLoading">
    <div>
      <UINewModalEditNoPaddingSecond
        v-show="isShowModal"
        @close-modal="router.push('/delivery?marketplace=wb')"
      >
        <template v-slot:icon-header> </template>
        <template v-slot:header> Выбор адреса заказа </template>
        <template v-slot:body>
          <div class="text-left px-3 pb-10">
            <div>
              <div class="flex justify-center">
                <UButton
                  v-if="settings[0]"
                  @click="
                    writeClipboardText(`${settings[0].address}`), skipWindow()
                  "
                  target="_blank"
                  icon="i-mdi-package-variant-closed-check"
                  size="sm"
                  color="pink"
                  variant="solid"
                  class="font-semibold text-left duration-200 w-full max-w-[500px] mt-3"
                  :trailing="false"
                  >Нажмите сюда, чтобы указать скопированный адрес для заказа
                  товара на WILDBERRIES</UButton
                >
              </div>

              <h1 class="mt-5 mb-3 italic text-sm">
                Инструкция по выбору адреса заказа
              </h1>
              <UAccordion color="pink" :items="items">
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
                        src="/images/wb/1-desk.png"
                        @click="openDesktop(1)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">2.</h1>
                      <img
                        src="/images/wb/2-desk.png"
                        @click="openDesktop(2)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">3.</h1>
                      <img
                        src="/images/wb/3-desk.png"
                        @click="openDesktop(3)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">4.</h1>
                      <img
                        src="/images/wb/4-desk.png"
                        @click="openDesktop(4)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">5.</h1>
                      <img
                        src="/images/wb/5-desk.png"
                        @click="openDesktop(5)"
                        alt=""
                        class="cursor-pointer"
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
                            :src="'images/wb/' + imgUrl"
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
                          src="/images/wb/1-ios.png"
                          @click="openIOS(1)"
                          class="cursor-pointer"
                          alt=""
                        />

                        <h1 class="text-sm italic">2.</h1>
                        <img
                          src="/images/wb/2-ios.png"
                          @click="openIOS(2)"
                          class="cursor-pointer"
                          alt=""
                        />

                        <h1 class="text-sm italic">3.</h1>
                        <img
                          src="/images/wb/3-ios.png"
                          @click="openIOS(3)"
                          class="cursor-pointer"
                          alt=""
                        />

                        <h1 class="text-sm italic">4.</h1>
                        <img
                          src="/images/wb/4-ios.png"
                          @click="openIOS(4)"
                          class="cursor-pointer"
                          alt=""
                        />

                        <h1 class="text-sm italic">5.</h1>
                        <img
                          src="/images/wb/5-ios.png"
                          @click="openIOS(5)"
                          alt=""
                          class="cursor-pointer"
                        />

                        <h1 class="text-sm italic">6.</h1>
                        <img
                          src="/images/wb/6-ios.png"
                          @click="openIOS(6)"
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
                              :src="'images/wb/' + imgUrl"
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
                        src="/images/wb/1-andr.png"
                        @click="openAndroid(1)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">2.</h1>
                      <img
                        src="/images/wb/2-andr.png"
                        @click="openAndroid(2)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">3.</h1>
                      <img
                        src="/images/wb/3-andr.png"
                        @click="openAndroid(3)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">4.</h1>
                      <img
                        src="/images/wb/4-andr.png"
                        @click="openAndroid(4)"
                        class="cursor-pointer"
                        alt=""
                      />

                      <h1 class="text-sm italic">5.</h1>
                      <img
                        src="/images/wb/5-andr.png"
                        @click="openAndroid(5)"
                        alt=""
                        class="cursor-pointer"
                      />

                      <h1 class="text-sm italic">6.</h1>
                      <img
                        src="/images/wb/6-andr.png"
                        @click="openAndroid(6)"
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
                            :src="'images/wb/' + imgUrl"
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
