<script lang="ts" setup>
import { YandexMap } from "vue-yandex-maps";
import Cookies from "js-cookie";

const router = useRouter();
const route = useRoute();
const coordinates = ref([47.640497, 37.689974]);
const controls = ["geolocationControl", "zoomControl", "typeSelector"];

const storeClients = useClientsStore();
const storePVZ = usePVZStore();

const token = Cookies.get("token");
let user = ref({} as User);
const pvzs = ref<Array<PVZ>>([]);
const storeUsers = useUsersStore();
const settings = ref<Array<any>>([]);
onMounted(async () => {
  getActualNameSite();

  if (linkData.value.includes("smartsklad.netlify.app")) {
    window.location.href = "https://trackbis.ru";
  }

  user.value = await storeClients.getClient();

  if (token && user.value.role === "CLIENT" && !route.query.home) {
    router.push("/auth/client/login?stay=true");
  }

  if (token && user.value.username === "Власенкова") {
    router.push("/auth/login");
  }

  settings.value = await storeUsers.getSettings();

  pvzs.value = await storePVZ.getPVZ();

  await getPercents();
});

let linkData = ref("");
function getActualNameSite() {
  if (window) {
    linkData.value = window.location.href.split("/")[2].split("/")[0];
  }
}

let selectedAddress = ref();

let counter = ref(0);
async function changeAddress(arrayCoordinates: Array<number>) {
  if (!counter.value) {
    zoomValue.value = 8;
    coordinates.value = arrayCoordinates;
    selectedAddress.value = pvzs.value.find(
      (item: PVZ) => item.coordinates[0] === arrayCoordinates[0]
    )?.address;
  } else {
    zoomValue.value = 8;
    coordinates.value = arrayCoordinates;
    selectedAddress.value = pvzs.value.find(
      (item: PVZ) => item.coordinates[0] === arrayCoordinates[0]
    )?.address;
  }
  counter.value++;
}

// let markers = [
//   {
//     id: 1,
//     coords: [47.98958366983051, 37.8955255423278],
//     commentary:
//       "ул. Антропова 16. Вход «ремонт обуви». Нет примерочной. Пн-пт 09:00-17:00; Сб 09:00-14:00; Выходной - воскресенье",
//     workTime: "Пн-пт 09:00-17:00; Сб 09:00-14:00; Выходной - воскресенье",
//     info: "Вход «ремонт обуви». Нет примерочной",
//   },
//   {
//     id: 2,
//     coords: [47.995839, 37.846517],
//     commentary: "ул. Харитоново, 8. Есть примерочная. Ежедневно 9:00-18:00",
//     workTime: "Ежедневно 9:00-18:00",
//     info: "Есть примерочная",
//   },
//   {
//     id: 3,
//     coords: [47.955214, 37.963109],
//     commentary: "ул. Палладина, 16. Есть примерочная. Ежедневно 9:00-18:00",
//     workTime: "Ежедневно 9:00-18:00",
//     info: "Есть примерочная",
//   },
//   {
//     id: 4,
//     coords: [47.945142, 37.960908],
//     commentary:
//       "ул. Нартова, 1. Возле магазина «Добрый». Есть примерочная. Ежедневно 9:00-18:00",
//     workTime: "Ежедневно 9:00-18:00",
//     info: "Возле магазина «Добрый». Есть примерочная",
//   },
//   {
//     id: 5,
//     coords: [47.946192, 37.90365],
//     commentary: "ул. Дудинская 4. Домашний пункт. Ежедневно 10:00-21:00",
//     workTime: "Ежедневно 10:00-21:00",
//     info: "Домашний пункт",
//   },
//   {
//     id: 8,
//     coords: [47.134833, 37.58217],
//     commentary:
//       "ул. Макара Мазая, 37А. Есть примерочная. Ежедневно 09:00-18:00",
//     workTime: "Ежедневно 09:00-18:00",
//     info: "Есть примерочная",
//   },
//   {
//     id: 9,
//     coords: [47.160469, 37.587497],
//     commentary: "ул. 8 Марта, 77. Есть примерочная. Ежедневно 09:00-19:00",
//     workTime: "Ежедневно 09:00-19:00",
//     info: "Есть примерочная",
//   },
//   {
//     id: 10,
//     coords: [47.045055, 37.479126],
//     commentary:
//       "ул. Азовской Военной Флотилии, 2. Вход магазин «Радуга». Ежедневно 9:00-18:00",
//     workTime: "Ежедневно 9:00-18:00",
//     info: "Вход магазин «Радуга»",
//   },
//   {
//     id: 11,
//     coords: [47.100219, 37.66091],
//     commentary: "ул. Азовстальская, 131. Ежедневно 9:00-18:00",
//     workTime: "Ежедневно 09:00-18:00",
//     info: "Вход в магазин «Семейный»",
//   },
//   {
//     id: 12,
//     coords: [47.093065, 37.672873],
//     commentary: "ул. Центральная, 43. Ежедневно",
//     workTime: "Ежедневно",
//   },
//   {
//     id: 14,
//     coords: [47.161166, 37.490362],
//     commentary: "пос. Старый Крым, павильон на центральном рынке",
//     workTime: "Ежедневно 09:00-18:00",
//   },
// ];

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

  pvzs.value = pvzs.value.map((pvzData: PVZ) => {
    const row = rows.value?.find(
      (r) => r.pvz.name.includes(pvzData.name) && r.flag === "ClientRansom"
    );
    if (row && row.wb) {
      pvzData.commentary1 = `Доставка Ваших заказов по QR-коду: Ozon - ${
        row.ozon
      }%, Wildberries - ${row.wb}%, ${
        row.ozon === 0 ? `Ozon - 5%, если вес товара от 25кг,` : ""
      } Другие интернет-магазины - ${row.ym}%`;
    }
    return pvzData;
  });
}

useSeoMeta({
  title: "Доставка товаров",
  ogTitle: "Доставка товаров",
  description: "Доставка из интернет-магазинов WILDBERRIES, OZON И ДР",
  ogDescription: "Доставка из интернет-магазинов WILDBERRIES, OZON И ДР.",
});

let isShowModalInfo = ref(false);
let selectedPVZ = ref({} as any);
async function showInfo(arrayCoordinates: Array<number>) {
  if (!counter.value) {
    zoomValue.value = 8;
    coordinates.value = arrayCoordinates;
    selectedPVZ.value = pvzs.value.find(
      (item: PVZ) => item.coordinates[0] === arrayCoordinates[0]
    );
  } else {
    zoomValue.value = 8;
    coordinates.value = arrayCoordinates;
    selectedPVZ.value = pvzs.value.find(
      (item: PVZ) => item.coordinates[0] === arrayCoordinates[0]
    );
  }
  counter.value++;
  isShowModalInfo.value = true;
}

let isShowFirstAddInfo = ref(false);
let isShowSecondAddInfo = ref(false);
</script>

<template>
  <NuxtLayout name="main-page">
    <div v-if="settings[0]" class="bg-main-page">
      <div class="py-5 max-md:px-5 mx-auto container" v-cloak>
        <div class="flex items-center justify-center flex-col space-y-5">
          <h1
            v-if="settings[0]"
            class="text-secondary-color font-bold text-8xl max-lg:text-6xl mt-3"
          >
            {{ settings[0].title }}
          </h1>
          <h1
            class="text-secondary-color font-bold uppercase mt-3 max-md:text-center"
          >
            Доставка из интернет-магазинов WILDBERRIES, OZON И ДР.
          </h1>
          <h1 class="text-xl mt-5 max-md:text-center">
            По всем вопросам и для оформления заказа:
          </h1>
          <h1
            v-if="linkData.includes('trackbis.ru')"
            class="text-xl max-[500px]:mt-3 text-center"
          >
            <br class="hidden max-[500px]:block" />
            <div class="mt-5 flex items-center space-x-5">
              <div class="inline-block text-center">
                <a
                  class="hover:opacity-50 duration-200"
                  href="https://t.me/WBDok"
                >
                  <Icon name="logos:telegram" size="32" />
                </a>
                <h1 class="italic text-sm">улица Ленина, 34/5</h1>
              </div>
              <div class="inline-block text-center">
                <a
                  class="hover:opacity-50 duration-200"
                  href="https://t.me/WBsever"
                >
                  <Icon name="logos:telegram" size="32" />
                </a>
                <h1 class="italic text-sm">Центральная улица, 83</h1>
              </div>
            </div>
          </h1>
          <h1 v-else class="text-xl max-[500px]:mt-3 text-center">
            <div v-if="settings[0]">
              <a
                class="text-secondary-color underline underline-offset-2 font-bold px-5 rounded-xl hover:opacity-50 duration-200 mr-2"
                :href="`tel:${settings[0].mainNumber}`"
              >
                {{ settings[0].mainNumber }}
              </a>
            </div>
            <br class="hidden max-[500px]:block" />
            <div class="mt-5 space-x-5">
              <a class="hover:opacity-50 duration-200">
                <Icon name="logos:telegram" size="32" />
              </a>
              <a class="hover:opacity-50 duration-200">
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
          <div v-if="linkData.includes('trackbis.ru')" class="mb-24">
            <h1 class="text-center text-xl">Мы в Вконтакте!</h1>
            <h1 class="text-center text-xl">Кликай и присоединяйся к нам!</h1>
            <div
              class="flex items-center justify-center gap-10 mt-6 max-[500px]:justify-center"
            >
              <div class="flex flex-col items-center">
                <a href="https://vk.com/wbdokuch1" target="_blank">
                  <Icon
                    name="mdi:vk"
                    class="text-blue-500 hover:text-secondary-color duration-200"
                    size="40"
                  />
                </a>
                <h1 class="italic text-center text-sm">улица Ленина, 34/5</h1>
              </div>
              <div class="flex flex-col items-center">
                <a href="https://vk.com/wbdokuch2" target="_blank">
                  <Icon
                    name="mdi:vk"
                    class="text-blue-500 hover:text-secondary-color duration-200"
                    size="40"
                  />
                </a>
                <h1 class="italic text-center text-sm">
                  Центральная улица, 83
                </h1>
              </div>
              <!-- <div class="flex flex-col items-center">
                <a v-if="settings[0].tg" :href="settings[0].tg" target="_blank">
                  <Icon
                    name="ic:baseline-telegram"
                    class="mt-1 text-blue-500 hover:text-secondary-color duration-200"
                    size="40"
                  />
                </a>
              </div> -->
            </div>
          </div>
          <div v-else class="mb-24">
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
                <a target="_blank">
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
              v-model="selectedAddress"
              @change="changeAddress"
              :options="pvzs"
              size="xl"
              placeholder="Поиск адреса..."
              option-attribute="address"
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
                  v-for="pvz in pvzs"
                  @click="
                    changeAddress(pvz.coordinates), showInfo(pvz.coordinates)
                  "
                  :coordinates="pvz.coordinates"
                  :marker-id="pvz.id"
                >
                  <!-- <template #component>
                    <CustomBalloonMainPage :commentary="marker.commentary" />
                  </template> -->
                </YandexMarker>
              </YandexMap>
            </ClientOnly>
          </div>
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
              {{ pvzs.find((row) => row.id === selectedPVZ.id)?.address }}
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
                size="2xs"
                >Подробнее</UButton
              >
            </div>
            <h1 v-if="isShowFirstAddInfo">
              {{ selectedPVZ.commentary1 }}
            </h1>
            <div v-if="isShowFirstAddInfo" class="text-sm my-3">
              <h1 class="font-bold">Оформление заказа:</h1>
              <ol class="italic list-decimal px-5 mt-1 space-y-1">
                <li>
                  Вы сами заказываете и оплачиваете товары в выбранном
                  интернет-магазине на указанный нами адрес
                </li>
                <li>
                  Мы получаем Ваш заказ по предоставленному Вами Штрих-коду (QR)
                  и привозим в удобный вам пункт выдачи
                </li>
                <li>
                  Вы оплачиваете товары самостоятельно до получения нами и
                  оплачиваете доставку забирая привезенный заказ в пункте выдачи
                </li>
              </ol>
            </div>
          </div>
          <div class="mb-3">
            <div class="flex items-center gap-3">
              <h1 class="font-bold text-base max-sm:text-base">
                Доставка товаров по постоплате
              </h1>
              <UButton
                @click="isShowSecondAddInfo = !isShowSecondAddInfo"
                class="font-semibold"
                size="2xs"
                >Подробнее</UButton
              >
            </div>
            <h1 v-if="isShowSecondAddInfo">Все интернет-магазины - 10%</h1>
            <div v-if="isShowSecondAddInfo" class="text-sm my-3">
              <h1 class="font-bold">Оформление заказа:</h1>
              <ol class="italic list-decimal px-5 mt-1 space-y-1">
                <li>
                  Вы заказываете товары используя ссылки на них через Ваш личный
                  кабинет на сайте или через
                  <a
                    class="text-secondary-color underline"
                    href="https://t.me/WBDok"
                    target="_blank"
                    >администратора</a
                  >
                </li>
                <li>
                  Мы сами выкупаем товар и привозим в удобный Вам пункт выдачи
                </li>
                <li>Вы оплачиваете товар и доставку при получении</li>
              </ol>
            </div>
          </div>
        </div>
      </UCard>
    </UModal>
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
