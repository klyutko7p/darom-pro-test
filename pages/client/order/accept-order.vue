<script setup lang="ts">
import Cookies from "js-cookie";
import * as cheerio from "cheerio";
import { useToast } from "vue-toastification";

const toast = useToast();

const storeClients = useClientsStore();
const storeRansom = useRansomStore();
const storeCells = useCellsStore();
const router = useRouter();

let user = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);

let originallyRows = ref<Array<IOurRansom>>();
let cells = ref<Array<Cell>>();
let cellData = ref({} as Cell);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeClients.getClient();
  originallyRows.value = await storeRansom.getRansomRowsForModal("OurRansom");
  cells.value = await storeCells.getCells();
  isLoading.value = false;
});

onMounted(() => {
  if (!token) {
    router.push("/auth/client/login");
  }
});

definePageMeta({
  layout: "client",
});

let address = ref("");
let urlToItem = ref("");
let quantityOfItem = ref(1);

let items = ref([]);

let productName = ref("");
let urlToImg = ref("");
let priceSite = ref(0);
let description = ref("");
let botAPI1 = "7151653535:AAH3dAXAz1D_7pjqNDWJmakdVziLrs9GEuI";
let botAPI2 = "7151653535:AAH3dAXAz1D_7pjqNDWJmakdVziLrs9GEuI";
let chatId = -1002088613649;
let stringToBot = "/get_price";

async function parsingPage() {
  if (urlToItem.value !== "") {
    if (urlToItem.value.length > 20) {
      if (marketplace.value === "WB") {
        isLoading.value = true
        let itemInfo = await storeClients.fetchSiteWB(urlToItem.value);
        let priceInfo = await storeClients.fetchSitePrice(urlToItem.value);
        productName.value = itemInfo[0].imt_name;
        description.value = itemInfo[0].description;
        priceSite.value = parseFloat(
          priceInfo.message.split(" ")[0] + priceInfo.message.split(" ")[1]
        );
        urlToImg.value = itemInfo[2];
        toast.success("Вы успешно добавили товар!")
        isLoading.value = false
      } else if (marketplace.value === "OZ") {
        let jsonString = await storeClients.fetchSiteOZ(urlToItem.value);
        console.log(JSON.parse(jsonString.seo.script[0].innerHTML));
        productName.value = JSON.parse(jsonString.seo.script[0].innerHTML).name;
        description.value = JSON.parse(jsonString.seo.script[0].innerHTML).description;
        priceSite.value = JSON.parse(jsonString.seo.script[0].innerHTML).offers.price;
        urlToImg.value = JSON.parse(jsonString.seo.script[0].innerHTML).image;
      } else if (marketplace.value === 'YM') {
        let info = await storeClients.fetchSiteYM(urlToItem.value)
        console.log(info);
      }

      createItem();
    } else {
      toast.error("Ссылка на товар недействительна!");
    }
  } else {
    toast.error("Добавьте ссылку товара для его добавления!");
  }
}

let item = ref({
  dispatchPVZ: "",
  fromName: "",
  productName: "",
  productLink: "",
  priceSite: 0,
  quantity: 1,
  img: "",
  description: "",
  cell: "",
});

function createItem() {
  item.value = {
    dispatchPVZ: address.value,
    fromName: user.value.phoneNumber,
    productName: productName.value,
    productLink: urlToItem.value,
    priceSite: priceSite.value,
    quantity: quantityOfItem.value,
    img: urlToImg.value,
    description: description.value,
    cell: "",
  };
  items.value.push(item.value);
  getCellFromName();
  console.log(item.value);
  urlToItem.value = "";
  quantityOfItem.value = 1;
  productName.value = "";
  urlToImg.value = "";
  priceSite.value = 0;
}

async function createOrder() {
  if (items.value.length > 0) {
    isLoading.value = true;

    for (const item of items.value) {
      await storeRansom.createRansomRow(item, user.value.phoneNumber, "OurRansom");
    }

    items.value = [];
    isShowModal.value = true;
    isLoading.value = false;
  } else {
    toast.error("Вы должны добавить хотя бы один товар!");
  }
}

async function getCellFromName() {
  if (item.value.fromName.trim().length === 4) {
    let phoneNum = item.value.fromName.trim().toString().slice(-4);
    let row = originallyRows.value?.filter((row) =>
      row.fromName ? row.fromName.slice(-4) === phoneNum : ""
    );

    if (row && row.length > 0) {
      if (row.some((r) => r.fromName !== row[0].fromName)) {
        toast.warning("Было найдено несколько номеров. Впишите полный номер");
      } else {
        item.value.fromName = row[0].fromName;
      }
    }
  }

  if (item.value.fromName.trim().length === 12) {
    let row = originallyRows.value?.filter(
      (row) =>
        row.fromName === item.value.fromName &&
        row.dispatchPVZ === item.value.dispatchPVZ &&
        (row.deliveredPVZ === null || row.deliveredSC === null || row.issued === null) &&
        !row.cell.includes("-")
    );

    if (row && row.length > 0) {
      const unoccupiedCellsAndPVZ = cells.value?.sort((a, b) => a.name - b.name);
      const freeCell = unoccupiedCellsAndPVZ?.find(
        (cell) => cell.PVZ === item.value.dispatchPVZ && cell.status === "Свободно"
      );

      const targetCell = row[0].cell;
      const targetPVZ = row[0].dispatchPVZ;
      const targetFromName = row[0].fromName;

      const cellIsOccupied = unoccupiedCellsAndPVZ?.some(
        (cell) =>
          cell.name === targetCell &&
          cell.PVZ === targetPVZ &&
          cell.fromName !== targetFromName
      );

      if (cellIsOccupied) {
        if (freeCell) {
          item.value.cell = freeCell.name;
          cellData.value = freeCell;
        } else {
          toast.warning("Нет свободных ячеек для выбранного ПВЗ");
        }
      } else {
        item.value.cell = row[0].cell;
      }
    } else {
      const unoccupiedCellsAndPVZ = cells.value
        ?.filter((cell) => cell.status === "Свободно")
        .sort((a, b) => a.name - b.name);
      const freeCell = unoccupiedCellsAndPVZ?.find(
        (cell) => cell.PVZ === item.value.dispatchPVZ
      );
      if (freeCell) {
        item.value.cell = freeCell.name;
        cellData.value = freeCell;
      } else {
        toast.warning("Нет свободных ячеек для выбранного ПВЗ");
      }
    }
  }
}

let isShowModal = ref(false);
let marketplace = ref("");
</script>

<template>
  <Head>
    <Title>Создание строк</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="py-10">
        <h1 class="text-xl font-bold">Выберите пункт выдачи для получения товара:</h1>
        <select
          class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 mt-5 text-lg w-full focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400 mb-3"
          v-model="address"
        >
          <option class="text-lg" value="ПВЗ_2">ПВЗ_2</option>
          <option class="text-lg" value="ПВЗ_1">
            г. Донецк, Буденовский р-н, Заперевальная, ул. Антропова 16 (вход "ремонт
            обуви")
          </option>
          <option class="text-lg" value="ПВЗ_3">г. Донецк, ул. Палладина 20</option>
          <option class="text-lg" value="ПВЗ_4">
            г. Донецк, ул. Нартова, 1. Возле магазина "Добрый"
          </option>
        </select>
        <h1 class="text-xl font-bold mt-3">Выберите маркетплейс:</h1>
        <select
          class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 mt-5 text-lg w-full focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400 mb-3"
          v-model="marketplace"
        >
          <option class="text-lg" value="WB">Wildberries</option>
          <option class="text-lg" value="OZ">Ozon</option>
        </select>
        <div v-if="address && marketplace" class="mt-5">
          <h1 class="text-lg font-bold">
            Вставьте ссылку на товар (предварительно выбрав верный размер и цвет):
          </h1>
          <input
            v-model="urlToItem"
            type="text"
            class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 mt-5 focus:ring-2 w-full focus:ring-yellow-600 sm:text-sm sm:leading-6"
          />

          <h1 class="text-lg font-bold mt-5">Укажите количество товаров для заказа:</h1>
          <input
            v-model="quantityOfItem"
            type="number"
            class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 mt-5 focus:ring-2 w-full focus:ring-yellow-600 sm:text-sm sm:leading-6"
          />

          <div class="flex items-center gap-5 mt-5">
            <UIMainButton v-if="items.length === 0" @click="parsingPage"
              >Добавить товар</UIMainButton
            >
            <UIMainButton v-if="items.length > 0" @click="parsingPage"
              >Добавить ещё товар</UIMainButton
            >
            <UIMainButton @click="createOrder">Отправить заказ</UIMainButton>
          </div>
        </div>

        <div v-if="items.length > 0" class="mt-10">
          <h1 class="text-3xl font-bold mb-10">Мои товары – {{ items.length }}</h1>
          <div
            v-auto-animate
            v-for="item in items.slice().reverse()"
            class="border-b-2 mb-10 shadow-2xl border-black flex items-start justify-around"
          >
            <img
              class="max-w-[300px] h-full rounded-t-2xl max-sm:hidden"
              :src="item.img"
              alt=""
            />
            <div class="px-5 py-3">
              <div class="">
                <div class="flex items-center justify-center mb-10">
                  <img
                    class="w-full h-full max-w-[300px] hidden max-sm:block"
                    :src="item.img"
                    alt=""
                  />
                </div>
                <div>
                  <a
                    :href="item.productLink"
                    target="_blank"
                    class="font-bold text-2xl cursor-pointer max-sm:text-center text-secondary-color underline"
                    >{{ item.productName }}</a
                  >
                  <h1 class="font-medium text-xl mt-3">
                    Цена на сайте: {{ item.priceSite }} ₽
                  </h1>
                  <h1 class="font-medium text-lg max-[330px]:text-base mb-4">
                    Количество: {{ item.quantity }}
                  </h1>
                </div>
              </div>
              <h1 class="italic max-h-[240px] max-lg:max-h-[200px] overflow-auto">
                {{ item.description }}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div
        v-auto-animate
        v-if="isShowModal"
        class="fixed top-0 bottom-0 left-0 bg-black bg-opacity-70 right-0 z-[100]"
      >
        <div class="flex items-center justify-center h-screen text-black font-bold">
          <div class="bg-white relative p-10 rounded-lg flex items-center flex-col gap-3">
            <div class="absolute top-0 right-0">
              <Icon
                name="material-symbols:close-small"
                size="40"
                class="cursor-pointer hover:text-secondary-color duration-200"
                @click="isShowModal = !isShowModal"
              />
            </div>
            <h1 class="text-2xl text-center border-b-2 border-black w-full mb-5">
              Ваш заказ успешно оформлен!
            </h1>
            <div class="flex items-center gap-3">
              <h1 class="text-xl">Ожидайте появление информации в</h1>
              <UIMainButton @click="router.push('/client/my-orders')">
                Мои заказы
              </UIMainButton>
            </div>
            <div class="mt-5">
              <h1 class="text-base font-medium">
                * цена на момент обработки вашего заказа может быть изменена маркетплейсом
              </h1>
              <h1 class="text-base font-medium">
                ** при заказе Ozon global, с вами свяжется менеджер для внесения
                предоплаты
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center">
      <UISpinner />
  </div>
</template>
