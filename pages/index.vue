<script lang="ts" setup>
import { YandexMap } from "vue-yandex-maps";

const router = useRouter();

const coordinates = ref([47.98958366983051, 37.8955255423278]);
const controls = ["geolocationControl", "zoomControl", "typeSelector"];

let selectedAddress = ref([47.98958366983051, 37.8955255423278]);
function changeAddress(arrayCoordinates: Array<number>) {
  coordinates.value = arrayCoordinates;
  zoomValue.value = 10;
}

let markers = [
  [47.98958366983051, 37.8955255423278],
  [47.945142, 37.960908],
  [47.955462, 37.964951],
  [47.946192, 37.90365],
  [47.974937, 37.837714],
];

let zoomValue = ref(10);
let isHiddenMenu = ref(true);
let isShowModal = ref(false);

function openModal() {
  isShowModal.value = true;
}

definePageMeta({
  layout: false,
});

const items = [
  {
    label: "Платежи",
    icon: "streamline:money-wallet-money-payment-finance-wallet",
    defaultOpen: true,
    slot: "payment",
  },
];
</script>

<template>
  <Head>
    <Title>DAROM.pro</Title>
  </Head>
  <NuxtLayout name="main-page">
    <div class="bg-main-page">
      <div class="py-5 max-md:px-5 mx-auto container" v-cloak>
        <div class="flex items-center justify-between gap-5">
          <UIMainButton @click="router.push('/auth/client/login')"
            >Вход клиента</UIMainButton
          >
          <UIMainButton @click="router.push('/auth/login')">Вход сотрудника</UIMainButton>
        </div>
        <div class="flex items-center justify-center flex-col">
          <h1 class="text-secondary-color font-bold text-8xl max-lg:text-6xl mt-3">
            DAROM.pro
          </h1>
          <h1 class="text-secondary-color font-bold uppercase mt-3 max-md:text-center">
            Доставка из интернет-магазинов WILDBERRIES, OZON, ЯНДЕКС МАРКЕТ И ДР.
          </h1>
          <h1 class="text-xl mt-5 max-md:text-center">
            по всем вопросам и для оформления заказа звоните:
          </h1>
          <h1 class="text-xl max-[500px]:mt-3 text-center">
            <a
              class="underline text-secondary-color hover:opacity-50 duration-200 mr-2"
              href="tel:+79496124760"
            >
              +7(949)612-47-60
            </a>
            <br class="hidden max-[500px]:block" />
            Telegram, WhatsApp
          </h1>
        </div>
        <div
          class="flex items-center justify-between mt-24 max-xl:flex-col-reverse max-xl:gap-10 max-xl:mt-10"
        >
          <div class="mb-24">
            <h1 class="text-center text-xl">Мы в Вконтакте и Telegram!</h1>
            <h1 class="text-center text-xl max-[500px]:hidden">
              Сканируй и присоединяйся к нам!
            </h1>
            <h1 class="text-center text-xl hidden max-[500px]:block">
              Кликай и присоединяйся к нам!
            </h1>
            <div class="flex items-center gap-10 mt-6 max-[500px]:justify-center">
              <div class="flex flex-col items-center">
                <img
                  class="max-w-[160px] max-[500px]:hidden"
                  src="../assets/images/qr_vk.png"
                  alt=""
                />
                <a href="https://vk.com/daromproforyou" target="_blank">
                  <Icon
                    name="mdi:vk"
                    class="text-blue-500 hover:text-secondary-color duration-200"
                    size="40"
                  />
                </a>
              </div>
              <div class="flex flex-col items-center">
                <img
                  class="max-w-[160px] max-[500px]:hidden"
                  src="../assets/images/qr_tg.png"
                  alt=""
                />
                <a href="https://t.me/DaromProForYou" target="_blank">
                  <Icon
                    name="ic:baseline-telegram"
                    class="mt-1 text-blue-500 hover:text-secondary-color duration-200"
                    size="40"
                  />
                </a>
              </div>
            </div>
          </div>
          <div class="max-md:w-full w-[770px]">
            <div class="flex mb-3 items-center gap-3 text-xl">
              <h1>Выберите адрес</h1>
              <Icon
                @click="isHiddenMenu = !isHiddenMenu"
                class="hover:text-secondary-color duration-200 cursor-pointer"
                name="material-symbols:arrow-downward"
              />
            </div>

            <div v-if="!isHiddenMenu">
              <ul class="gap-3 flex flex-col text-sm">
                <li
                  class="border-2 border-secondary-color p-3 hover:bg-secondary-color hover:text-white duration-200 cursor-pointer"
                  @click="changeAddress([47.98958366983051, 37.8955255423278])"
                >
                  г. Донецк, Буденовский р-н, Заперевальная, ул. Антропова 16, вход
                  "ремонт обуви" (нет примерочной)
                </li>
                <li
                  class="border-2 border-secondary-color p-3 hover:bg-secondary-color hover:text-white duration-200 cursor-pointer"
                  @click="changeAddress([47.945142, 37.960908])"
                >
                  г. Донецк, ул. Нартова, 1. Возле магазина "Добрый" (есть примерочная)
                </li>
                <li
                  class="border-2 border-secondary-color p-3 hover:bg-secondary-color hover:text-white duration-200 cursor-pointer"
                  @click="changeAddress([47.955462, 37.964951])"
                >
                  г. Донецк, ул. Палладина, 20. (есть примерочная)
                </li>
                <li
                  class="border-2 border-secondary-color p-3 hover:bg-secondary-color hover:text-white duration-200 cursor-pointer"
                  @click="changeAddress([47.946192, 37.90365])"
                >
                  г. Донецк, ул. Дудинская, д. 4, кв7
                </li>
                <li
                  class="border-2 border-secondary-color p-3 hover:bg-secondary-color hover:text-white duration-200 cursor-pointer"
                  @click="changeAddress([47.974937, 37.837714])"
                >
                  г. Донецк, ул. Жебелева, д. 7
                </li>
              </ul>
            </div>
            <ClientOnly>
              <YandexMap
                class="w-[770px] max-md:w-full"
                style="height: 300px; margin-top: 20px"
                v-if="true"
                :coordinates="coordinates"
                :controls="controls"
                :zoom="zoomValue"
              >
                <YandexMarker
                  v-for="marker in markers"
                  :coordinates="marker"
                  :marker-id="marker"
                >
                </YandexMarker>
              </YandexMap>
            </ClientOnly>
          </div>
        </div>
        <div class="flex items-center justify-center mt-24 max-lg:m-0">
          <UIMainButton @click="openModal">ИНФОРМАЦИЯ</UIMainButton>
        </div>
      </div>
    </div>

    <UINewModalEditNoPadding
      v-show="isShowModal"
      @close-modal="isShowModal = !isShowModal"
      class="text-black"
    >
      <template v-slot:icon-header> </template>
      <template v-slot:header>Информация</template>
      <template v-slot:body>
        <UAccordion color="orange" :items="items">
          <template #item="{ item }">
            <p class="italic text-gray-900 dark:text-white text-center">
              {{ item.description }}
            </p>
          </template>

          <template #payment>
            <div class="text-gray-900 dark:text-white text-left px-3">
              <img src="../assets/images/tochka-bank.png" class="w-auto h-8 mx-auto" />

              <p
                class="text-sm grid grid-cols-2 border-b-2 pb-3 text-gray-500 dark:text-gray-400 mt-3"
              >
                <span class="font-bold"> Услуги: </span>
                <span class="text-right">Доставка товаров</span>
              </p>
              <p
                class="text-sm grid grid-cols-2 border-b-2 pb-3 text-gray-500 dark:text-gray-400 mt-3"
              >
                <span class="font-bold"> Условия: </span>
                <span class="text-right">
                  Мы осуществляем сбор заказов клиента в другом городе, а затем доставку
                  товаров в указанный клиентом населенный пункт
                </span>
              </p>
              <p
                class="text-sm grid grid-cols-2 border-b-2 pb-3 text-gray-500 dark:text-gray-400 mt-3"
              >
                <span class="font-bold"> Стоимость: </span>
                <span class="text-right">Рассчитывается индивидуально </span>
              </p>
              <p class="text-sm text-center text-gray-500 dark:text-gray-400 mt-10">
                Просмотреть
                <a
                  class="font-bold underline text-secondary-color duration-200 cursor-pointer hover:opacity-50"
                  href="https://fomoljxhkywsdgnchewy.supabase.co/storage/v1/object/public/files/docx/requisite.docx?t=2024-08-19T23%3A56%3A36.401Z"
                  >реквизиты юридического лица</a
                >
              </p>
            </div>
          </template>
        </UAccordion>
      </template>
    </UINewModalEditNoPadding>
  </NuxtLayout>
</template>
