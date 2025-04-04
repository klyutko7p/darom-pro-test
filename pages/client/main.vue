<script setup lang="ts">
import Cookies from "js-cookie";

const storeClients = useClientsStore();
const router = useRouter();
const route = useRoute();

let client = ref({} as Client);
let clientData = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);

let pvzData = ref("");
let isShowModalWB = ref(false);
let isShowModalOZ = ref(false);
let isShowModalYM = ref(false);
let isShowModal = ref(false);
let isShowModal2 = ref(false);
let isShowModal3 = ref(false);
let isShowModal4 = ref(false);
let items = ref<Array<any>>([]);

let isPersonalDataProcessingPolicyAgreed = ref(false);
let isPrivacyPolicyAgreed = ref(false);
let gender = ref("");

const genders = ref([
  { id: 1, name: "Мужской" },
  { id: 2, name: "Женский" },
]);
let age = ref("");

const settings = ref<Array<any>>([]);
const storePVZ = usePVZStore();
const pvzs = ref<Array<PVZ>>([]);
const storeUsers = useUsersStore();
onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login?stay=true");
  }
  requestPermission();

  client.value = await storeClients.getClient();
  clientData.value = await storeClients.getClientById(client.value.id);

  const storedItems = localStorage.getItem("cardItems");
  if (storedItems) {
    items.value = JSON.parse(storedItems);
  }

  if (!clientData.value.age || !clientData.value.gender) {
    isShowModal4.value = true;
  }

  if (
    !clientData.value.isPersonalDataProcessingPolicyAgreed ||
    !clientData.value.isPrivacyPolicyAgreed
  ) {
    isShowModal3.value = true;
  }

  const storeFileName = localStorage.getItem("fileName");
  if (storeFileName && route.query.notification !== "false") {
    isShowModal2.value = true;
  }

  if (items.value.length && route.query.notification !== "false") {
    isShowModal.value = true;
  }

  if (route.query.modal === "wb") {
    isShowModalWB.value = true;
  }

  if (route.query.modal === "oz") {
    isShowModalWB.value = true;
  }

  if (route.query.modal === "ym") {
    isShowModalWB.value = true;
  }

  pvzData.value = localStorage.getItem("addressData") || "";
  pvzData.value = pvzData.value.replace(/"/g, "");
  isLoading.value = true;
  settings.value = await storeUsers.getSettings();
  pvzs.value = await storePVZ.getPVZ();
  isLoading.value = false;
});

function signOut() {
  storeClients.signOut();
}

async function updateClient() {
  isLoading.value = true;
  await storeClients.acceptDocs(client.value);
  isShowModal3.value = false;
  isLoading.value = false;
}

async function updateClientInfo() {
  isLoading.value = true;
  client.value.age = Number(age.value);
  client.value.gender = gender.value;
  await storeClients.acceptInfo(client.value);
  isShowModal4.value = false;
  isLoading.value = false;
}

import { getToken } from "firebase/messaging";

const messagingToken = ref("");

async function setToken() {
  const { $messaging } = useNuxtApp();
  const token = await getToken($messaging, {
    vapidKey:
      "BLA8pMjiR3G7gYFd09kR1ZSHyIypsNJlQV5ZP-uXtW0_eslYlfZjpVHmE9XwMu_91v8BhEarXKFJiXKJFMk3QTk",
  });
  messagingToken.value = token;
  await storeClients.createTokenDevice(client.value.phoneNumber, token);
}

function requestPermission() {
  if (!window.Notification) return;

  if (window.Notification.permission === "granted") {
    setToken();
  } else {
    window.Notification.requestPermission((value) => {
      if (value === "granted") {
        setToken();
      }
    });
  }
}

definePageMeta({
  layout: "client",
});

let isShowInfo = ref(false);

function clearCookies() {
  localStorage.removeItem("isNotAskingOZ");
  localStorage.removeItem("isNotAskingWB");
  localStorage.removeItem("isNotAskingYM");
  router.push("/client/order/independently/ozon?change=true");
}

useSeoMeta({
  title: "Личный кабинет",
  ogTitle: "Личный кабинет",
  description:
    "Авторизуйтесь и получите доступ к заказу из любых интернет-магазинов!",
  ogDescription:
    "Авторизуйтесь и получите доступ к заказу из любых интернет-магазинов!",
});

const config = useRuntimeConfig();
const linkToDB = config.public.supabaseUrl as string;
</script>

<template>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="py-5">
        <div class="flex items-center justify-between mt-3">
          <div
            class="flex items-center justify-between w-full max-sm:flex-col-reverse max-sm:items-start max-md:gap-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="bg-secondary-color text-white pt-2 rounded-full px-1.5"
              >
                <Icon name="i-material-symbols-package-2" size="32" />
              </div>
              <div class="flex flex-col gap-0">
                <span class="text-sm text-gray-400 font-semibold"
                  >Пункт выдачи заказов</span
                >
                <h1
                  @click="clearCookies"
                  class="text-lg font-semibold cursor-pointer hover:text-secondary-color duration-200"
                >
                  {{
                    pvzs.find((pvz) => pvz.name === pvzData)?.address
                      ? pvzs.find((pvz) => pvz.name === pvzData)?.address
                      : "Не выбран"
                  }}
                </h1>
              </div>
            </div>
            <div>
              <h1
                class="text-5xl text-secondary-color max-md:text-3xl font-bold max-sm:text-center"
              >
                ЛИЧНЫЙ КАБИНЕТ
              </h1>
            </div>
          </div>

          <!-- <div
            @click="router.push('/client/referral')"
            class="cursor-pointer hover:animate-pulse bg-secondary-color text-white pt-2 pb-1 rounded-full px-2 animate-bounce"
          >
            <Icon name="i-streamline-gift-2-solid" size="32" />
          </div> -->
        </div>

        <div class="mt-7 mb-1 flex items-center gap-3">
          <h1 v-if="client.fio" class="text-xl">
            Приветствуем, {{ client.fio }}!
          </h1>
          <h1
            v-else-if="!client.fio && client.phoneNumber !== '+70000000001'"
            class="text-xl"
          >
            Приветствуем!
            <span class="text-sm italic"
              >Вы можете настроить личные данные в соответствующей
              вкладке.</span
            >
          </h1>
          <h1 v-else class="text-xl">Приветствуем!</h1>

          <div
            @click="requestPermission"
            class="bg-orange-100 duration-200 cursor-pointer hover:opacity-50 pt-1 rounded-full px-1"
          >
            <Icon
              name="material-symbols:add-alert"
              size="24"
              class="text-secondary-color"
            />
          </div>
        </div>

        <div v-if="client.phoneNumber === '+70000000001'" class="">
          <UButton
            @click="router.push('/auth/client')"
            class="my-3 font-semibold uppercase"
            >Войти или зарегистрироваться</UButton
          >
        </div>

        <h1
          v-if="settings[0]"
          class="font-bold text-6xl max-[400px]:text-4xl max-md:text-center text-secondary-color mb-5"
        >
          {{ settings[0].title }}
        </h1>

        <SidebarClientAsideBody
          :client="client"
          @sign-out="signOut"
          v-auto-animate
        />
      </div>

      <div
        v-auto-animate
        v-if="isShowModal"
        class="fixed top-0 bottom-0 left-0 bg-black bg-opacity-70 right-0 z-[100]"
      >
        <div
          class="flex items-center justify-center h-screen text-black font-semibold"
        >
          <div
            class="bg-white relative p-10 max-sm:p-3 rounded-lg flex items-center flex-col gap-3"
          >
            <div class="absolute top-4 right-4 max-sm:top-2 max-sm:right-2">
              <Icon
                name="material-symbols:cancel-rounded"
                size="32"
                class="cursor-pointer hover:text-secondary-color duration-200"
                @click="isShowModal = !isShowModal"
              />
            </div>
            <h1
              class="text-xl max-w-[500px] text-center text-secondary-color font-bold w-full max-sm:text-xl py-3 max-sm:mt-5"
            >
              Вы не закончили с оформлением заказа. <br />
              Количество товаров: {{ items.length }} шт.
            </h1>
            <div class="flex items-center gap-3 max-sm:flex-col">
              <UButton
                @click="router.push('/client/order/accept-order?card=true')"
                class="font-bold"
                icon="i-material-symbols-shopping-cart"
                size="xl"
                >ПРОДОЛЖИТЬ</UButton
              >
            </div>
          </div>
        </div>
      </div>

      <div
        v-auto-animate
        v-if="isShowModal2"
        class="fixed top-0 bottom-0 left-0 bg-black bg-opacity-70 right-0 z-[100]"
      >
        <div
          class="flex items-center justify-center h-screen text-black font-semibold"
        >
          <div
            class="bg-white relative p-10 max-sm:p-3 rounded-lg flex items-center flex-col gap-3"
          >
            <div class="absolute top-4 right-4 max-sm:top-2 max-sm:right-2">
              <Icon
                name="material-symbols:cancel-rounded"
                size="32"
                class="cursor-pointer hover:text-secondary-color duration-200"
                @click="isShowModal2 = !isShowModal2"
              />
            </div>
            <h1
              class="text-xl max-w-[400px] text-center text-secondary-color font-bold w-full max-sm:text-xl py-3 max-sm:mt-5"
            >
              Вы не закончили с оформлением заказа по штрих-коду
            </h1>
            <div class="flex items-center gap-3 max-sm:flex-col">
              <UButton
                @click="router.push('/client/delivery?qr=true')"
                class="font-bold"
                icon="i-material-symbols-shopping-cart"
                size="xl"
                >ПРОДОЛЖИТЬ</UButton
              >
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isShowModal4"
        v-auto-animate
        class="fixed top-0 bottom-0 left-0 bg-black bg-opacity-70 right-0 z-[100]"
      >
        <div
          class="flex items-center justify-center h-screen text-black font-semibold"
        >
          <div
            class="bg-white relative p-10 max-sm:p-3 rounded-lg flex items-center flex-col gap-3"
          >
            <h1
              class="text-2xl text-center text-secondary-color font-bold w-full max-sm:text-xl py-3 max-sm:mt-5"
            >
              Пожалуйста, укажите Ваши персональные данные
            </h1>
            <div class="flex max-sm:flex-col max-sm:gap-5 items-center gap-24">
              <div class="space-y-1">
                <h1>Укажите свой пол</h1>

                <USelect
                  class="w-full"
                  v-model="gender"
                  :options="genders"
                  option-attribute="name"
                  value-attribute="name"
                />
              </div>

              <div class="space-y-1">
                <h1>Укажите свой возраст</h1>
                <input
                  type="number"
                  class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-2.5 py-1.5 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                  v-model="age"
                  required
                  min="13"
                  max="100"
                />
              </div>
            </div>
            <UButton
              class="mt-5 font-bold"
              :disabled="!gender || Number(age) < 13 || Number(age) > 100"
              @click="updateClientInfo"
              >ПОДТВЕРДИТЬ</UButton
            >
          </div>
        </div>
      </div>

      <div
        v-auto-animate
        v-if="isShowModal3"
        class="fixed top-0 bottom-0 left-0 bg-black bg-opacity-70 right-0 z-[100]"
      >
        <div
          class="flex items-center justify-center h-screen text-black font-semibold"
        >
          <div
            class="bg-white relative p-10 max-sm:p-3 rounded-lg flex items-center flex-col gap-3"
          >
            <h1
              class="text-2xl text-center text-secondary-color font-bold w-full max-sm:text-xl py-3 max-sm:mt-5"
            >
              Подтвердите доступ к Вашей информации
            </h1>
            <div class="flex items-center gap-3 max-sm:flex-col space-y-3">
              <div class="max-w-[500px] max-sm:w-full max-sm:max-w-none">
                <div class="flex items-start gap-3 p-2">
                  <div>
                    <input
                      class="h-3 w-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color bg-transparent"
                      type="checkbox"
                      required
                      v-model="isPersonalDataProcessingPolicyAgreed"
                    />
                  </div>
                  <label class="italic text-sm"
                    >Подтверждаю, что я ознакомлен и согласен с условиями
                    <a
                      class="underline text-secondary-color duration-200 cursor-pointer hover:opacity-50"
                      :href="`${linkToDB}/storage/v1/object/public/files/docx/policy_info_tb.pdf`"
                      >Политики обработки персональных данных</a
                    ></label
                  >
                </div>

                <div class="flex items-start gap-3 p-2">
                  <div>
                    <input
                      class="h-3 w-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 focus:ring-secondary-color checked:ring-[2px] checked:ring-secondary-color focus:ring-offset-transparent form-checkbox rounded bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white text-orange-500 ring-[2px] ring-secondary-color bg-transparent"
                      type="checkbox"
                      required
                      v-model="isPrivacyPolicyAgreed"
                    />
                  </div>
                  <label class="italic text-sm"
                    >Подтверждаю, что я ознакомлен и согласен с условиями
                    <a
                      class="underline text-secondary-color duration-200 cursor-pointer hover:opacity-50"
                      :href="`${linkToDB}/storage/v1/object/public/files/docx/policy_conf_tb.pdf`"
                      >Политики конфиденциальности</a
                    ></label
                  >
                </div>
              </div>
            </div>
            <div
              v-if="
                isPersonalDataProcessingPolicyAgreed && isPrivacyPolicyAgreed
              "
              @click="updateClient"
            >
              <UButton>ПОДТВЕРДИТЬ</UButton>
            </div>
          </div>
        </div>
      </div>

      <UINewModalEdit
        v-show="isShowInfo"
        @close-modal="isShowInfo = !isShowInfo"
      >
        <template v-slot:icon-header> </template>
        <template v-slot:header> ВАЖНАЯ ИНФОРМАЦИЯ </template>
        <template v-slot:body>
          <div class="text-left px-0">
            <div>
              <h1 class="font-bold text-xl">Стоимость доставки:</h1>
              <h1 class="italic text-base">≈7% от стоимости товара</h1>
            </div>
            <div class="mt-3">
              <h1 class="font-bold text-xl">Невозвратные товары:</h1>
              <ul class="list-disc px-5 max-sm:px-3">
                <li class="italic">товары Ozon global</li>
                <li class="max-h-[150px] italic overflow-auto">
                  товары WB парфюмерия, косметика, предметы личной гигиены,
                  бытовая химия, лекарственные ср-ва, пищевые продукты,
                  ювелирные украшения, нижнее белье, термобелье, постельное
                  белье, купальник, плавки, носки, колготки, технически сложные
                  устройства (смартфоны, планшеты и т.п.)
                </li>
              </ul>
            </div>
            <div class="mt-3">
              <h1
                class="font-bold text-lg text-left max-sm:text-left max-sm:text-lg"
              >
                Проверяйте товары в пункте выдачи на комплектность, размер и
                брак. <br />
                Возврат из дома не принимаем!
              </h1>
            </div>
            <div class="mt-3">
              <h1
                class="font-bold text-lg text-left max-sm:text-left max-sm:text-lg"
              >
                При заказе товаров OZON GLOBAL и WB доставка из-за рубежа, с
                Вами свяжется менеджер для внесения предоплаты
              </h1>
            </div>
          </div>
        </template>
      </UINewModalEdit>
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
