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
  isLoading.value = false;
  originallyRows.value = await storeRansom.getRansomRowsForModal("OurRansom");
  cells.value = await storeCells.getCells();
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

let items = ref<Array<any>>([]);

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
      if (urlToItem.value.includes("wildberries") && marketplace.value === "WB") {
        isLoading.value = true;
        let itemInfo = await storeClients.fetchSiteWB(urlToItem.value);
        if (itemInfo.error === "fetch failed") {
          toast.error("Извините, мы не можем сейчас обработать данные.");
          isLoading.value = false;
          return;
        }
        if (!itemInfo[0]) {
          toast.error("Извините, мы не можем обработать название товара.");
          isLoading.value = false;
          return;
        }
        productName.value = itemInfo[0].imt_name;
        description.value = itemInfo[0].description;

        let priceInfoPromise = storeClients.fetchSitePrice(urlToItem.value);
        let timeoutPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error("Request timeout"));
          }, 10000);
        });

        try {
          let priceInfo = await Promise.race([priceInfoPromise, timeoutPromise]);
          productName.value = itemInfo[0].imt_name;
          description.value = itemInfo[0].description;

          if (priceInfo.message) {
            priceSite.value = parseFloat(
              priceInfo.message.split(" ")[0] + priceInfo.message.split(" ")[1]
            );
          } else {
            toast.warning("Цена на данный товар появится при обработке заказа");
            priceSite.value = 0;
            isLoading.value = false;
          }
        } catch (error) {
          toast.warning("Цена на данный товар появится при обработке заказа");
          priceSite.value = 0;
          isLoading.value = false;
        }

        urlToImg.value = itemInfo[2];
        toast.success("Вы успешно добавили товар!");
        isLoading.value = false;
      } else if (urlToItem.value.includes("ozon") && marketplace.value === "OZ") {
        isLoading.value = true;
        let jsonString = await storeClients.fetchSiteOZ(urlToItem.value);
        if (jsonString.pageInfo.pageTypeTracking === "error") {
          toast.error("Извините, произошла ошибка. Проверьте ссылку на товар!");
          isLoading.value = false;
          return;
        }
        console.log(jsonString);
        console.log(JSON.parse(jsonString.seo.script[0].innerHTML));
        productName.value = JSON.parse(jsonString.seo.script[0].innerHTML).name;
        description.value = JSON.parse(jsonString.seo.script[0].innerHTML).description;
        priceSite.value = JSON.parse(jsonString.seo.script[0].innerHTML).offers.price;
        urlToImg.value = JSON.parse(jsonString.seo.script[0].innerHTML).image;
        isLoading.value = false;
      } else if (marketplace.value === "YM") {
        let info = await storeClients.fetchSiteYM(urlToItem.value);
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
  percentClient: 10,
  marketplace: "",
});

let phoneNumbersWithoutPercent = ref<Array<string>>([
  "+79494530129",
  "+79494527899",
  "+79494140214",
  "+79494140215",
  "+79493263518",
  "+79493485709",
  "+79494140217",
  "+79493479188",
  "+79494189093",
]);

async function createItem() {
  item.value = {
    dispatchPVZ: address.value,
    fromName: user.value.phoneNumber,
    productName: productName.value,
    productLink: urlToItem.value,
    priceSite: +priceSite.value,
    quantity: quantityOfItem.value,
    img: urlToImg.value,
    percentClient: 10,
    description: description.value,
    cell: "",
    marketplace: marketplace.value,
  };
  if (phoneNumbersWithoutPercent.value.includes(user.value.phoneNumber)) {
    item.value.percentClient = 0;
  }
  items.value.push(item.value);
  getCellFromName();
  if (cellData.value) {
    await storeCells.updateCell(cellData.value, "Занято", user.value.phoneNumber);
  }
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
      console.log(item);
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

function deleteItemFromOrder(productName: number) {
  let answer = confirm("Вы уверены что хотите удалить данный товар из заказа?");
  if (answer) {
    const index = items.value.findIndex((item: any) => item.productName === productName);
    if (index !== -1) {
      items.value.splice(index, 1);
    }
  }
}
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
          <option class="text-lg" value="ПВЗ_1">г. Донецк, ул. Антропова 16</option>
          <option class="text-lg" value="ПВЗ_3">г. Донецк, ул. Палладина 20</option>
          <option class="text-lg" value="ПВЗ_4">г. Донецк, ул. Нартова, 1.</option>
          <option class="text-lg" value="ППВЗ_5">
            г. Донецк, ул Дудинская, д. 4, кв7
          </option>
          <option class="text-lg" value="ППВЗ_6">
            г. Донецк, ул Довженко, д 55, кв5
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

          <div class="flex items-center gap-5 mt-5 max-sm:flex-col">
            <UIMainButton class="max-sm:w-full" @click="parsingPage"
              >Добавить товар</UIMainButton
            >
            <UIMainButton class="max-sm:w-full" @click="createOrder"
              >Отправить заказ</UIMainButton
            >
          </div>
        </div>

        <div v-if="items.length > 0" class="mt-10">
          <h1 class="text-2xl font-bold mb-1 max-sm:text-xl">
            Количество товаров – {{ items.length }}
          </h1>
          <h1 class="text-2xl font-bold mb-10 max-sm:text-xl">
            Стоимость товаров –
            {{ items.reduce((ac, item) => ac + item.priceSite, 0) }} ₽
          </h1>
          <div
            v-auto-animate
            v-for="item in items.slice().reverse()"
            class="border-b-2 mb-10 shadow-2xl border-black flex items-start justify-between max-md:max-w-[400px] max-md:items-center max-md:justify-center max-md:mx-auto"
          >
            <img
              class="max-w-[410px] h-full rounded-l-2xl px-3 max-md:hidden border-r-2 border-black"
              :src="item.img"
              alt=""
            />
            <div class="px-5 py-3 max-md:p-0 w-full">
              <div class="">
                <div class="flex items-center justify-center mb-5">
                  <img
                    class="w-full h-full max-w-[400px] rounded-t-2xl hidden max-md:block border-b-2 border-black"
                    :src="item.img"
                    alt=""
                  />
                </div>
                <div class="max-md:px-5 max-md:py-1">
                  <Icon
                    @click="deleteItemFromOrder(item.productName)"
                    name="material-symbols:delete-outline"
                    size="40"
                    class="text-red-500 absolute top-2 right-2 hover:opacity-50 duration-200 bg-white rounded-full px-1 cursor-pointer"
                  />
                  <img
                    src="https://grampus-studio.ru/wp-content/uploads/2023/04/free-png.ru-419.png"
                    alt=""
                    class="absolute max-w-[300px] top-0 right-0 left-0 bottom-0 m-auto opacity-5"
                    v-if="item.marketplace === 'WB'"
                  />
                  <img
                    src="https://brandlab.ozon.ru/images/tild3631-3032-4235-b439-396661643432__icon_circle.png"
                    alt=""
                    class="absolute max-w-[300px] top-0 right-0 left-0 bottom-0 m-auto opacity-5"
                    v-if="item.marketplace === 'OZ'"
                  />
                  <div class="max-md:text-center">
                    <a
                      :href="item.productLink"
                      target="_blank"
                      class="font-bold text-2xl max-sm:text-xl cursor-pointer text-secondary-color underline"
                      >{{ item.productName }}</a
                    >
                  </div>
                  <h1 class="font-medium text-xl mt-3">
                    Цена на сайте: {{ item.priceSite }} ₽
                  </h1>
                  <h1 class="font-medium text-lg max-[330px]:text-base mb-4">
                    Количество: {{ item.quantity }}
                  </h1>
                </div>
              </div>
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
                ** при заказе товаров OZON GLOBAL, с вами свяжется менеджер для внесения
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
