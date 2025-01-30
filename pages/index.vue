<script lang="ts" setup>
import { YandexMap } from "vue-yandex-maps";
import Cookies from "js-cookie";

const router = useRouter();
const route = useRoute();
const coordinates = ref([47.640497, 37.689974]);
const controls = ["geolocationControl", "zoomControl", "typeSelector"];

const storeClients = useClientsStore();

const token = Cookies.get("token");
let user = ref({} as User);
onMounted(async () => {
  user.value = await storeClients.getClient();

  // if (token && user.value.role === "CLIENT" && !route.query.home) {
  //   router.push("/auth/client/login?stay=true");
  // }

  if (token && user.value.username === "Власенкова") {
    router.push("/auth/login");
  }

  await getPercents();
});

const addressItems = ref([
  {
    id: 1,
    address: [47.98958366983051, 37.8955255423278],
    text: "г. Донецк, ул. Антропова, 16",
  },
  {
    id: 2,
    address: [47.995839, 37.846517],
    text: "г. Донецк, ул. Харитоново, 8",
  },
  {
    id: 3,
    address: [47.955214, 37.963109],
    text: "г. Донецк, ул. Палладина, 16",
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
    id: 8,
    address: [47.134833, 37.58217],
    text: "г. Мариуполь, ул. Макара Мазая, 37А",
  },
  {
    id: 9,
    address: [47.160469, 37.587497],
    text: "г. Мариуполь, ул. 8 Марта, 77",
  },
  {
    id: 10,
    address: [47.045055, 37.479126],
    text: "г. Мариуполь, ул. Азовской Военной Флотилии, 2",
  },
  {
    id: 11,
    address: [47.100255, 37.662614],
    text: "г. Мариуполь, ул. Азовстальская, 131",
  },
  {
    id: 12,
    address: [47.093065, 37.672873],
    text: "г. Мариуполь, ул. Центральная, 43",
  },
  {
    id: 14,
    address: [47.161166, 37.490362],
    text: "г. Мариуполь, пос. Старый Крым, павильон на центральном рынке",
  },
]);

let selectedAddress = ref();

let counter = ref(0);
async function changeAddress(arrayCoordinates: Array<number>) {
  if (!counter.value) {
    zoomValue.value = 8;
    coordinates.value = arrayCoordinates;
    selectedAddress.value = addressItems.value.find(
      (item) => item.address[0] === arrayCoordinates[0]
    )?.address;
  } else {
    zoomValue.value = 8;
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
      "ул. Антропова 16. Вход «ремонт обуви». Нет примерочной. Пн-пт 09:00-17:00; Сб 09:00-14:00; Выходной - воскресенье",
    workTime: "Пн-пт 09:00-17:00; Сб 09:00-14:00; Выходной - воскресенье",
    info: "Вход «ремонт обуви». Нет примерочной",
  },
  {
    id: 2,
    coords: [47.995839, 37.846517],
    commentary: "ул. Харитоново, 8. Есть примерочная. Ежедневно 9:00-18:00",
    workTime: "Ежедневно 9:00-18:00",
    info: "Есть примерочная",
  },
  {
    id: 3,
    coords: [47.955214, 37.963109],
    commentary: "ул. Палладина, 16. Есть примерочная. Ежедневно 9:00-18:00",
    workTime: "Ежедневно 9:00-18:00",
    info: "Есть примерочная",
  },
  {
    id: 4,
    coords: [47.945142, 37.960908],
    commentary:
      "ул. Нартова, 1. Возле магазина «Добрый». Есть примерочная. Ежедневно 9:00-18:00",
    workTime: "Ежедневно 9:00-18:00",
    info: "Возле магазина «Добрый». Есть примерочная",
  },
  {
    id: 5,
    coords: [47.946192, 37.90365],
    commentary: "ул. Дудинская 4. Домашний пункт. Ежедневно 10:00-21:00",
    workTime: "Ежедневно 10:00-21:00",
    info: "Домашний пункт",
  },
  {
    id: 8,
    coords: [47.134833, 37.58217],
    commentary:
      "ул. Макара Мазая, 37А. Есть примерочная. Ежедневно 09:00-18:00",
    workTime: "Ежедневно 09:00-18:00",
    info: "Есть примерочная",
  },
  {
    id: 9,
    coords: [47.160469, 37.587497],
    commentary: "ул. 8 Марта, 77. Есть примерочная. Ежедневно 09:00-19:00",
    workTime: "Ежедневно 09:00-19:00",
    info: "Есть примерочная",
  },
  {
    id: 10,
    coords: [47.045055, 37.479126],
    commentary:
      "ул. Азовской Военной Флотилии, 2. Вход магазин «Радуга». Ежедневно 9:00-18:00",
    workTime: "Ежедневно 9:00-18:00",
    info: "Вход магазин «Радуга»",
  },
  {
    id: 11,
    coords: [47.100255, 37.662614],
    commentary: "ул. Азовстальская, 131. Ежедневно 9:00-18:00",
    workTime: "Ежедневно 09:00-18:00",
    info: "Вход в магазин «Семейный»",
  },
  {
    id: 12,
    coords: [47.093065, 37.672873],
    commentary: "ул. Центральная, 43. Ежедневно",
    workTime: "Ежедневно",
  },
  {
    id: 14,
    coords: [47.161166, 37.490362],
    commentary: "пос. Старый Крым, павильон на центральном рынке",
    workTime: "Ежедневно 09:00-18:00",
  },
];

let zoomValue = ref(8);
let isHiddenMenu = ref(true);
let isShowModal = ref(false);

function openModal() {
  isShowModal.value = true;
}

definePageMeta({
  layout: false,
});

const storePVZPercent = usePVZPercentStore();
const rows = ref<Array<IPVZPercent>>();

async function getPercents() {
  const [rowsData] = await Promise.all([storePVZPercent.getPVZ()]);

  rows.value = rowsData;

  markers = markers.map((marker) => {
    const row = rows.value?.find(
      (r) =>
        r.pvz.name.includes(marker.id.toString()) && r.flag === "ClientRansom"
    );
    if (row && row.wb) {
      marker.commentary += `. Доставка Ваших заказов по QR-коду: Ozon - ${
        row.ozon
      }%, Wildberries - ${row.wb}%, ${
        row.ozon === 0 ? `Ozon - 5%, если вес товара от 25кг,` : ""
      } Другие интернет-магазины - ${row.ym}%`;
    }
    return marker;
  });

  markers = markers.map((marker) => {
    const row = rows.value?.find(
      (r) => r.pvz.name.includes(marker.id.toString()) && r.flag === "OurRansom"
    );
    if (row && row.wb) {
      marker.commentary += `. Доставка товаров по постоплате: 10%`;
    }
    return marker;
  });
}

const items = [
  {
    label: "Платежи",
    icon: "streamline:money-wallet-money-payment-finance-wallet",
    defaultOpen: true,
    slot: "payment",
  },
];

useSeoMeta({
  title: "DAROM.PRO — Доставка товаров",
  ogTitle: "DAROM.PRO — Доставка товаров",
  description:
    "Доставка из интернет-магазинов WILDBERRIES, OZON, ЯНДЕКС МАРКЕТ И ДР. По всем вопросам и для оформления заказа звоните: +7(949)612-47-60",
  ogDescription:
    "Доставка из интернет-магазинов WILDBERRIES, OZON, ЯНДЕКС МАРКЕТ И ДР. По всем вопросам и для оформления заказа звоните: +7(949)612-47-60",
});

let isShowModalInfo = ref(false);
let selectedPVZ = ref({} as any);
async function showInfo(arrayCoordinates: Array<number>) {
  if (!counter.value) {
    zoomValue.value = 8;
    coordinates.value = arrayCoordinates;
    selectedPVZ.value = markers.find(
      (item) => item.coords[0] === arrayCoordinates[0]
    );
  } else {
    zoomValue.value = 8;
    coordinates.value = arrayCoordinates;
    selectedPVZ.value = markers.find(
      (item) => item.coords[0] === arrayCoordinates[0]
    );
  }
  counter.value++;
  isShowModalInfo.value = true;
}

let isShowFirstAddInfo = ref(false);
let isShowSecondAddInfo = ref(false);

// async function sendMessages() {
//   let clients = await storeClients.getClients();

//   clients.forEach(async (client: any) => {
//     await storeClients.sendMessageToClient(
//       "Важное уведомление!!!",
//       "Основной аккаунт администратора взломан, если будут приходить СМС с просьбой перейти по ссылке❗️❗️❗️ НЕ ПЕРЕХОДИТЕ🙏",
//       client.phoneNumber
//     );
//   });
// }
</script>

<template>
  <NuxtLayout name="main-page">
    <div class="bg-main-page">
      <div class="py-5 max-md:px-5 mx-auto container" v-cloak>
        <div class="flex items-center justify-center flex-col space-y-5">
          <!-- <UButton @click="sendMessages">Отправить</UButton> -->
          <h1
            class="text-secondary-color font-bold text-8xl max-lg:text-6xl mt-3"
          >
            DAROM.PRO
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
        <div
          class="flex items-center justify-center gap-5 mt-5 max-md:flex-col"
        >
          <UIMainButton
            class="min-w-[300px] max-xl:w-full max-xl:max-w-[770px]"
            @click="router.push('/auth/client/login')"
          >
            оформить заказ в личном кабинете
          </UIMainButton>
          <UIMainButton
            class="min-w-[300px] max-xl:w-full max-xl:max-w-[770px]"
            @click="router.push('/delivery')"
          >
            Доставка в один клик
          </UIMainButton>
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
                  @click="changeAddress(marker.coords), showInfo(marker.coords)"
                  :marker-id="marker.id"
                >
                  <!-- <template #component>
                    <CustomBalloonMainPage :commentary="marker.commentary" />
                  </template> -->
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

    <UModal
      :ui="{
        container: 'flex items-center justify-center text-center',
      }"
      v-auto-animate
      v-model="isShowModalInfo"
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
              Информация о пункте выдачи
            </h3>
            <Icon
              @click="isShowModalInfo = !isShowModalInfo"
              name="i-heroicons-x-mark-20-solid"
              size="24"
              class="cursor-pointer hover:text-secondary-color duration-200"
            />
          </div>
        </template>
        <div>
          <div class="mb-3">
            <h1 class="font-bold text-xl max-sm:text-base">Пункт выдачи</h1>
            <h1>
              {{ addressItems.find((row) => row.id === selectedPVZ.id)?.text }}
            </h1>
          </div>
          <div class="mb-3" v-if="selectedPVZ.info">
            <h1 class="font-bold text-xl max-sm:text-base">
              Дополнительная информация
            </h1>
            <h1>
              {{ selectedPVZ.info }}
            </h1>
          </div>
          <div class="mb-3">
            <h1 class="font-bold text-xl max-sm:text-base">Время работы</h1>
            <h1>
              {{ selectedPVZ.workTime }}
            </h1>
          </div>
          <div class="mb-3">
            <div class="flex items-center gap-3">
              <h1 class="font-bold text-base max-sm:text-base">
                Доставка Ваших заказов по Штрих-Коду (QR)
              </h1>
              <UButton
                @click="isShowFirstAddInfo = !isShowFirstAddInfo"
                class="font-semibold"
                >Подробнее</UButton
              >
            </div>
            <h1 v-if="isShowFirstAddInfo">
              {{
                selectedPVZ.commentary
                  .split("Доставка Ваших заказов по QR-коду:")[1]
                  .split(".")[0]
              }}
            </h1>
          </div>
          <div class="mb-3">
            <div class="flex items-center gap-3">
              <h1 class="font-bold text-base max-sm:text-base">
                Доставка товаров по постоплате
              </h1>
              <UButton
                @click="isShowSecondAddInfo = !isShowSecondAddInfo"
                class="font-semibold"
                >Подробнее</UButton
              >
            </div>
            <h1 v-if="isShowSecondAddInfo">Все интернет-магазины - 10%</h1>
          </div>
        </div>
      </UCard>
    </UModal>

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
