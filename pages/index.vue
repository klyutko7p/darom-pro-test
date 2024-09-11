<script lang="ts" setup>
import { YandexMap } from "vue-yandex-maps";

const router = useRouter();

const coordinates = ref([47.971605, 37.860323]);
const controls = ["geolocationControl", "zoomControl", "typeSelector"];

const addressItems = ref([
  {
    id: 1,
    address: [47.98958366983051, 37.8955255423278],
    text: "г. Донецк, Буденовский р-н, Заперевальная, ул. Антропова 16",
  },
  {
    id: 3,
    address: [47.955462, 37.964951],
    text: "г. Донецк, ул. Палладина, 20",
  },
  {
    id: 4,
    address: [47.945142, 37.960908],
    text: "г. Донецк, ул. Нартова, 1",
  },
  {
    id: 5,
    address: [47.946192, 37.90365],
    text: "г. Донецк, ул. Дудинская, д. 4, кв7",
  },
  {
    id: 7,
    address: [47.974937, 37.837714],
    text: "г. Донецк, ул. Жебелева, д. 7",
  },
]);

let selectedAddress = ref();

let counter = ref(0);
async function changeAddress(arrayCoordinates: Array<number>) {
  if (!counter.value) {
    zoomValue.value = 12;
    coordinates.value = arrayCoordinates;
    selectedAddress.value = addressItems.value.find(
      (item) => item.address[0] === arrayCoordinates[0]
    )?.address;
  } else {
    zoomValue.value = 12;
    coordinates.value = arrayCoordinates;
    selectedAddress.value = addressItems.value.find(
      (item) => item.address[0] === arrayCoordinates[0]
    )?.address;
  }
  counter.value++;
}

let markers = [
  {
    id: 1,
    coords: [47.98958366983051, 37.8955255423278],
    commentary:
      "Вход «ремонт обуви». Нет примерочной. Пн-пт 09:00-17:00; Сб 09:00-14:00; Выходной - воскресенье",
  },
  {
    id: 3,
    coords: [47.955462, 37.964951],
    commentary: "Есть примерочная. Ежедневно 9:00-17:00",
  },
  {
    id: 4,
    coords: [47.945142, 37.960908],
    commentary:
      "Возле магазина «Добрый». Есть примерочная. Ежедневно 9:00-17:00",
  },
  {
    id: 5,
    coords: [47.946192, 37.90365],
    commentary: "Домашний пункт. Ежедневно 10:00-21:00",
  },
  {
    id: 7,
    coords: [47.974937, 37.837714],
    commentary: "Домашний пункт. Ежедневно 12:00-20:00",
  },
];

let zoomValue = ref(12);
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
        <div class="flex items-center justify-center flex-col space-y-5">
          <h1
            class="text-secondary-color font-bold text-8xl max-lg:text-6xl mt-3"
          >
            DAROM.pro
          </h1>
          <h1
            class="text-secondary-color font-bold uppercase mt-3 max-md:text-center"
          >
            Доставка из интернет-магазинов WILDBERRIES, OZON, ЯНДЕКС МАРКЕТ И
            ДР.
          </h1>
          <h1 class="text-xl mt-5 max-md:text-center">
            По всем вопросам и для оформления заказа звоните:
          </h1>
          <h1 class="text-xl max-[500px]:mt-3 text-center">
            <div>
              <a
                class="text-secondary-color underline underline-offset-2 font-bold px-5 rounded-xl hover:opacity-50 duration-200 mr-2"
                href="tel:+79496124760"
              >
                +7 (949) 612-47-60
              </a>
            </div>
            <br class="hidden max-[500px]:block" />
            <div class="mt-5 space-x-5">
              <a
                class="hover:opacity-50 duration-200"
                href="https://t.me/Svetlana_Darompro"
              >
                <Icon name="logos:telegram" size="32" />
              </a>
              <a
                class="hover:opacity-50 duration-200"
                href="https://wa.me/79496124760"
              >
                <Icon name="logos:whatsapp-icon" size="32" />
              </a>
            </div>
          </h1>
        </div>
        <div class="flex items-center justify-center gap-5 mt-5">
          <UIMainButton @click="router.push('/auth/client/login')"
            >оформить заказ</UIMainButton
          >
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
            <div
              class="flex items-center gap-10 mt-6 max-[500px]:justify-center"
            >
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
            </div>
            <UInputMenu
              @change="changeAddress"
              :options="addressItems"
              v-model="selectedAddress"
              size="xl"
              placeholder="Поиск адреса..."
              option-attribute="text"
              value-attribute="address"
            />
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
                  :coordinates="marker.coords"
                  @click="changeAddress(marker.coords)"
                  :marker-id="marker.id"
                >
                  <template #component>
                    <CustomBalloonMainPage :commentary="marker.commentary" />
                  </template>
                </YandexMarker>
              </YandexMap>
            </ClientOnly>
          </div>
        </div>
        <div class="flex items-center justify-center mt-24 max-lg:m-0">
          <UIMainButton @click="openModal">ИНФОРМАЦИЯ</UIMainButton>
        </div>
      </div>
      <div class="flex justify-end mr-5 py-10">
        <UIMainButton @click="router.push('/auth/login')"
          >Вход исполнителя</UIMainButton
        >
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
              <img
                src="../assets/images/tochka-bank.png"
                class="w-auto h-8 mx-auto"
              />

              <p
                class="text-sm grid grid-cols-2 max-sm:grid-cols-1 border-b-2 pb-3 text-gray-500 dark:text-gray-400 mt-3"
              >
                <span class="font-bold"> Услуги: </span>
                <span class="text-right max-sm:text-left"
                  >Доставка товаров</span
                >
              </p>
              <p
                class="text-sm grid grid-cols-2 max-sm:grid-cols-1 border-b-2 pb-3 text-gray-500 dark:text-gray-400 mt-3"
              >
                <span class="font-bold"> Условия: </span>
                <span class="text-right max-sm:text-left">
                  Мы осуществляем сбор заказов клиента в другом городе, а затем
                  доставку товаров в указанный клиентом населенный пункт
                </span>
              </p>
              <p
                class="text-sm grid grid-cols-2 max-sm:grid-cols-1 border-b-2 pb-3 text-gray-500 dark:text-gray-400 mt-3"
              >
                <span class="font-bold"> Стоимость: </span>
                <span class="text-right max-sm:text-left"
                  >Рассчитывается индивидуально
                </span>
              </p>
              <p
                class="text-sm text-center text-gray-500 dark:text-gray-400 mt-10"
              >
                Просмотреть
                <a
                  class="font-bold underline text-secondary-color duration-200 cursor-pointer hover:opacity-50"
                  href="https://fomoljxhkywsdgnchewy.supabase.co/storage/v1/object/public/files/docx/requisite.docx"
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

<style>
.yandex-balloon {
  width: 200px;
  height: 100px;
  font-size: 10px;
}

@media (max-width: 640px) {
  .yandex-balloon {
    width: 100%;
    height: 70px;
  }
}
</style>
