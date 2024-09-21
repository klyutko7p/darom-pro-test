<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();

const storeClients = useClientsStore();
const storeRansom = useRansomStore();
const storeCells = useCellsStore();
const router = useRouter();
const route = useRoute();

let user = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);

let originallyRows = ref<Array<IOurRansom>>();
let cells = ref<Array<Cell>>();
let cellData = ref({} as Cell);
const addressData = ref("");

onMounted(async () => {
  const addressItem = localStorage.getItem("addressData");
  if (addressItem) {
    addressData.value = JSON.parse(addressItem);
  }
  const storedItems = localStorage.getItem("cardItems");
  if (storedItems) {
    items.value = JSON.parse(storedItems);
  }

  const storedIsNotAskingAcceptOrder = localStorage.getItem(
    "isNotAskingAcceptOrder"
  );
  if (JSON.parse(storedIsNotAskingAcceptOrder) === true) {
    isOpenZeroModal.value = false;
    isOpenFirstModal.value = true;
  }

  if (route.query.card === "true") {
    isOpenZeroModal.value = false;
    isOpenFirstModal.value = false;
    showLastModal();
  }

  if (!token) {
    router.push("/auth/client/login");
  }

  if (addressData.value) {
    address.value = addressData.value.replace(/"/g, "");
  } else {
    router.push("/client/order/independently/ozon?accept=true");
  }

  isLoading.value = true;
  user.value = storeClients.getClient();
  isLoading.value = false;
  originallyRows.value = await storeRansom.getRansomRowsForModalOurRansom();
  cells.value = await storeCells.getCells();
});

definePageMeta({
  layout: "client-no-pad",
});

let address = ref("");
let urlToItem = ref("");
let urlToItemArt = ref("");
let quantityOfItem = ref(1);

let items = ref<Array<any>>([]);

let productName = ref("");
let urlToImg = ref("");
let priceSite = ref(0);
let description = ref("");

const handleError = (message: string) => {
  toast.error(message);
  isLoading.value = false;
};

const parsingPage = async () => {
  if (!urlToItem.value && marketplace.value === "WB") {
    handleError("Добавьте ссылку товара для его добавления!");
    return;
  }

  if (urlToItem.value.length <= 20 && marketplace.value === "WB") {
    handleError("Ссылка на товар недействительна!");
    return;
  }

  isLoading.value = true;

  try {
    if (urlToItem.value.includes("wildberries") && marketplace.value === "WB") {
      const itemInfo = await storeClients.fetchSiteWB(urlToItem.value);
      if (itemInfo.error === "fetch failed" || !itemInfo[0]) {
        handleError("Извините, мы не можем сейчас обработать данные.");
        urlToItem.value = "";
        return;
      }

      productName.value = itemInfo[0].data.products[0].name;
      urlToImg.value = itemInfo[1];
      if (urlToItem.value.includes("size")) {
        let sizeString = urlToItem.value.split("size=")[1];
        priceSite.value = itemInfo[2].data.products[0].sizes.filter(
          (size: any) => size.optionId == sizeString
        )[0].price.product;
        priceSite.value = Number(
          priceSite.value
            .toString()
            .substring(0, priceSite.value.toString().length - 2)
        );
      } else {
        priceSite.value = itemInfo[2].data.products[0].sizes[0].price.product;
        priceSite.value = Number(
          priceSite.value
            .toString()
            .substring(0, priceSite.value.toString().length - 2)
        );
      }
      toast.success("Вы успешно добавили товар!");
    } else if (marketplace.value === "OZ") {
      if (!urlToItemArt.value && urlToItem.value) {
        const match = urlToItem.value.match(/\/product\/([^/?]+)/);
        if (match) {
          const productName = match[1];
          urlToItem.value = productName;
        }
      } else if (urlToItemArt.value && !urlToItem.value) {
        urlToItem.value = urlToItemArt.value;
      }
      const jsonString = await storeClients.fetchSiteOZ(urlToItem.value);
      const jsonMessage = JSON.parse(jsonString.message);
      const parsedData = JSON.parse(jsonMessage.seo.script[0].innerHTML);
      productName.value = parsedData.name;
      priceSite.value = parsedData.offers.price;
      urlToImg.value = parsedData.image;
      urlToItem.value = "https://www.ozon.ru/product/" + urlToItem.value;
      toast.success("Вы успешно добавили товар!");
    } else if (marketplace.value === "YM") {
      const info = await storeClients.fetchSiteYM(urlToItem.value);
      console.log(info);
    }

    createItem();
  } finally {
    isLoading.value = false;
  }
};

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
  "+79494140214",
  "+79494140215",
  "+79493263518",
  "+79493485709",
  "+79494140217",
  "+79493479188",
  "+79494690310",
]);

const updateCellStatus = async () => {
  try {
    if (cellData.value) {
      await storeCells.updateCell(
        cellData.value,
        "Занято",
        user.value.phoneNumber
      );
    }
  } catch (error) {
    console.error("Failed to update cell status:", error);
    toast.error("Не удалось обновить статус ячейки.");
  }
};

const resetItemInputs = () => {
  urlToItem.value = "";
  quantityOfItem.value = 1;
  productName.value = "";
  urlToImg.value = "";
  priceSite.value = 0;
};

const createItem = async () => {
  try {
    const { phoneNumber } = user.value;
    const isDiscountApplicable =
      !phoneNumbersWithoutPercent.value.includes(phoneNumber);

    item.value = {
      dispatchPVZ: address.value,
      fromName: phoneNumber,
      productName: productName.value,
      productLink: urlToItem.value,
      priceSite: +priceSite.value,
      quantity: quantityOfItem.value,
      img: urlToImg.value,
      percentClient: isDiscountApplicable ? 10 : 0,
      description: description.value,
      cell: "",
      marketplace: marketplace.value,
    };

    getCellFromName();

    items.value.push(item.value);
    localStorage.setItem("cardItems", JSON.stringify(items.value));

    await updateCellStatus();
  } catch (error) {
    console.error("Failed to create item:", error);
    toast.error("Ошибка при создании товара.");
  } finally {
    resetItemInputs();
  }
};

async function createOrder() {
  if (items.value.length > 0) {
    isLoading.value = true;

    for (const item of items.value) {
      await storeRansom.createRansomRow(
        item,
        user.value.phoneNumber,
        "OurRansom"
      );
    }

    items.value = [];
    localStorage.removeItem("cardItems");
    isShowModal.value = true;
    isOpen.value = false;
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
        toast.warning("Было найдено несколько номеров");
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
        (row.deliveredPVZ === null ||
          row.deliveredSC === null ||
          row.issued === null) &&
        !row.cell.includes("-")
    );

    if (row && row.length > 0) {
      const unoccupiedCellsAndPVZ = cells.value?.sort(
        (a, b) => a.name - b.name
      );
      const freeCell = unoccupiedCellsAndPVZ?.find(
        (cell) =>
          cell.PVZ === item.value.dispatchPVZ && cell.status === "Свободно"
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
    const index = items.value.findIndex(
      (item: any) => item.productName === productName
    );
    if (index !== -1) {
      items.value.splice(index, 1);
    }
  }
  localStorage.setItem("cardItems", JSON.stringify(items.value));
}
const isOpenZeroModal = ref(true);
const isOpenFirstModal = ref(false);
const isOpenSecondModal = ref(false);
const isOpenThirdModal = ref(false);
const isOpenFourModal = ref(false);
const isOpenLastModal = ref(false);

function closeZeroModal() {
  isOpenZeroModal.value = false;
  isOpenFirstModal.value = true;
  if (isNotAskingAcceptOrder.value) {
    localStorage.setItem("isNotAskingAcceptOrder", "true");
  }
}

function showFirstModal() {
  isOpenFirstModal.value = true;
  isOpenSecondModal.value = false;
  isOpenThirdModal.value = false;
  isOpenLastModal.value = false;
}

function clearAddress() {
  address.value = "";
}

function showSecondModal() {
  if (address.value) {
    isOpenFirstModal.value = false;
    isOpenSecondModal.value = false;
    isOpenThirdModal.value = true;
  } else {
    isOpenFirstModal.value = false;
    isOpenSecondModal.value = true;
    isOpenThirdModal.value = false;
    isOpenLastModal.value = false;
  }
}

function showThirdModal() {
  if (route.query.card === "true") {
    isOpenZeroModal.value = false;
    isOpenFirstModal.value = true;
    isOpenSecondModal.value = false;
    isOpenThirdModal.value = false;
    isOpenFourModal.value = false;
    isOpenLastModal.value = false;
  } else {
    isOpenFirstModal.value = false;
    isOpenSecondModal.value = false;
    isOpenThirdModal.value = true;
    isOpenFourModal.value = false;
    isOpenLastModal.value = false;
  }
}

function showFourModal() {
  isOpenFirstModal.value = false;
  isOpenThirdModal.value = false;
  isOpenFourModal.value = true;
  isOpenLastModal.value = false;
}

function showLastModal() {
  isOpenThirdModal.value = false;
  isOpenFourModal.value = false;
  isOpenLastModal.value = true;
}
let isOpen = ref(true);

const people = [
  {
    pvz: "ПВЗ_1",
    name: "г. Донецк, ул. Антропова 16",
  },
  {
    pvz: "ПВЗ_3",
    name: "г. Донецк, ул. Палладина, 20",
  },
  {
    pvz: "ПВЗ_4",
    name: "г. Донецк, ул. Нартова, 1",
  },
  {
    pvz: "ППВЗ_5",
    name: "г. Донецк, ул. Дудинская, д. 4, кв. 7",
  },
  {
    pvz: "ППВЗ_7",
    name: "г. Донецк, ул. Жебелева, д. 7",
  },
];

async function parsePageByLink(itemData: IOurRansom) {
  isLoading.value = true;

  try {
    if (itemData.productLink.includes("wildberries")) {
      const itemInfo = await storeClients.fetchSiteWB(itemData.productLink);
      if (itemInfo.error === "fetch failed" || !itemInfo[0]) {
        handleError("Извините, мы не можем сейчас обработать данные.");
        urlToItem.value = "";
        return;
      }

      if (itemData.productLink.includes("size")) {
        let sizeString = itemData.productLink.split("size=")[1];
        itemData.priceSite = itemInfo[2].data.products[0].sizes.filter(
          (size: any) => size.optionId == sizeString
        )[0].price.product;
        itemData.priceSite = Number(
          itemData.priceSite
            .toString()
            .substring(0, itemData.priceSite.toString().length - 2)
        );
      } else {
        itemData.priceSite =
          itemInfo[2].data.products[0].sizes[0].price.product;
        itemData.priceSite = Number(
          itemData.priceSite
            .toString()
            .substring(0, itemData.priceSite.toString().length - 2)
        );
      }
      toast.success("Цена успешно подтверждена");
    } else if (itemData.productLink.includes("ozon")) {
      let productId = itemData.productLink.split(
        "https://www.ozon.ru/product/"
      )[1];
      const jsonString = await storeClients.fetchSiteOZ(productId);
      const jsonMessage = JSON.parse(jsonString.message);
      const parsedData = JSON.parse(jsonMessage.seo.script[0].innerHTML);
      itemData.priceSite = +parsedData.offers.price;
      toast.success("Цена успешно подтверждена");
    } else if (marketplace.value === "YM") {
      const info = await storeClients.fetchSiteYM(urlToItem.value);
      console.log(info);
    }
  } finally {
    isLoading.value = false;
  }
}

async function submitForm() {
  try {
    if (route.query.card === "true") {
      for (const item of items.value) {
        await parsePageByLink(item);
      }
    }

    await createOrder();
  } catch (error) {
    console.error("Ошибка при создании заказа или обработке данных:", error);
    toast.error("Произошла ошибка при создании заказа");
  } finally {
    isLoading.value = false;
  }
}

function pasteToTextArea() {
  navigator.clipboard.readText().then((text) => {
    urlToItem.value = text;
    text = text.replace(/[а-яА-ЯёЁ]/g, "");

    let urlMatch = text.match(/https?:\/\/[^\s]+/);

    if (urlMatch) {
      urlToItem.value = urlMatch[0];
    } else {
      urlToItem.value = "";
    }
  });
}
let isShowAcceptModal = ref(false);
function changeMarketplace(marketplaceData: string) {
  marketplace.value = marketplaceData;
  showSecondModal();
}

function showAcceptModal() {
  isShowAcceptModal.value = true;
  isOpen.value = false;
}

function closeAcceptModal() {
  isOpen.value = true;
  isShowAcceptModal.value = false;
}

const pvzs = [
  {
    pvz: "ПВЗ_1",
    name: "ул. Антропова 16",
  },
  {
    pvz: "ПВЗ_3",
    name: "ул. Палладина, 20",
  },
  {
    pvz: "ПВЗ_4",
    name: "ул. Нартова, 1",
  },
  {
    pvz: "ППВЗ_5",
    name: "ул. Дудинская, д. 4, кв. 7",
  },
  {
    pvz: "ППВЗ_7",
    name: "ул. Жебелева, д. 7",
  },
];

function roundToNearestTen(num: number): number {
  const lastDigit = num % 10;
  if (lastDigit >= 5) {
    return Math.ceil(num / 10) * 10;
  } else {
    return Math.floor(num / 10) * 10;
  }
}

let isNotAskingAcceptOrder = ref(false);
</script>

<template>
  <Head>
    <Title>Создание строк</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div v-if="isOpenZeroModal">
        <UINewModalEditNoPaddingSecond
          v-show="isOpenZeroModal"
          @close-modal="closeZeroModal"
        >
          <template v-slot:body>
            <div class="flex items-center flex-col justify-center h-full gap-5">
              <h1 class="font-semibold text-base max-sm:text-lg">
                Заказать через личный кабинет
                <span class="uppercase text-secondary-color">darom.pro</span>
                можно <br />
                из интернет-магазинов OZON и WILDBERRIES
              </h1>
              <div class="flex items-center gap-3">
                <div>
                  <input
                    class="h-3 w-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 checked:ring-[2px] focus:ring-offset-transparent form-checkbox rounded bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ring-[2px] bg-transparent checked:ring-secondary-color text-secondary-color ring-secondary-color focus-visible:ring-secondary-color focus:ring-secondary-color"
                    v-model="isNotAskingAcceptOrder"
                    id="isNotAskingAcceptOrder"
                    name="isNotAskingAcceptOrder"
                    type="checkbox"
                  />
                </div>
                <label for="isNotAskingAcceptOrder" class="italic text-sm"
                  >Больше не спрашивать</label
                >
              </div>
              <div class="text-left px-3">
                <div class="flex items-center justify-center">
                  <UButton
                    @click="closeZeroModal"
                    icon="i-octicon-tracked-by-closed-completed-16"
                    size="lg"
                    color="orange"
                    variant="solid"
                    class="font-semibold duration-200"
                    :trailing="false"
                    >Понятно</UButton
                  >
                </div>
              </div>
            </div>
          </template>
        </UINewModalEditNoPaddingSecond>
      </div>

      <div v-if="isOpenFirstModal">
        <div
          class="bg-[#0763f6cd] w-screen flex items-center justify-center h-[430px] max-sm:h-[400px] cursor-pointer hover:opacity-70 duration-200"
          @click="changeMarketplace('OZ')"
        >
          <img
            src="@/assets/images/ozon-bg-1.png"
            class="max-w-[170px] max-sm:max-w-[130px] shadow-2xl shadow-black rounded-full"
            alt=""
          />
        </div>
        <div
          class="bg-gradient-to-r from-[#7c2570] via-[#bb3c95] to-[#ec208b] w-screen flex items-center justify-center h-[500px] max-sm:h-[400px] cursor-pointer hover:opacity-70 duration-200"
          @click="changeMarketplace('WB')"
        >
          <img
            src="@/assets/images/wb.png"
            class="max-w-[470px] max-sm:max-w-[300px] z-[10]"
            alt=""
          />
        </div>
        <!-- <div
          class="bg-[#f8cf02] w-screen flex items-center justify-center h-[230px] max-sm:h-[200px] cursor-pointer hover:opacity-70 duration-200"
          @click="changeMarketplace('Яндекс Маркет')"
        >
          <img
            src="@/assets/images/ym.png"
            class="max-w-[470px] max-sm:max-w-[300px]"
            alt=""
          />
        </div> -->
      </div>
      <UModal
        :ui="{
          container: 'flex items-center justify-center text-center',
        }"
        v-auto-animate
        v-model="isOpen"
        prevent-close
        v-if="!isOpenFirstModal && !isOpenZeroModal"
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
                v-if="!isOpenLastModal"
                class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
              >
                Заполните информацию
              </h3>
              <h3
                v-if="isOpenLastModal"
                class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
              >
                Проверьте информацию
              </h3>
              <Icon
                @click="router.push('/client/main?notification=false')"
                name="i-heroicons-x-mark-20-solid"
                size="24"
                class="cursor-pointer hover:text-secondary-color duration-200"
              />
            </div>
          </template>

          <div v-auto-animate="{ easing: 'ease-out' }">
            <div class="h-[120px]" v-if="isOpenSecondModal" v-auto-animate>
              <label>Пункт выдачи заказов</label>
              <USelectMenu
                value-attribute="pvz"
                option-attribute="name"
                v-model="address"
                :options="people"
                class="mt-3"
              />
              <div class="mt-5 flex justify-end gap-3" v-auto-animate>
                <UButton
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showFirstModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  v-if="address"
                  @click="showThirdModal()"
                  class="font-bold"
                  label="ДАЛЕЕ"
                  color="primary"
                >
                  <template #trailing>
                    <UIcon
                      name="i-heroicons-arrow-right-20-solid"
                      class="w-5 h-5"
                    />
                  </template>
                </UButton>
              </div>
            </div>

            <div v-if="isOpenThirdModal && marketplace === 'OZ'" v-auto-animate>
              <div v-if="!urlToItem">
                <label
                  >Скопируйте
                  <span class="text-red-500 font-semibold uppercase"
                    >артикул</span
                  >
                </label>
              </div>
              <div v-if="!urlToItem" class="h-[44px]">
                <UInput
                  v-model="urlToItemArt"
                  name="urlToItemArt"
                  placeholder="Вставьте скопированный артикул товара"
                  icon="i-ph-package-bold"
                  autocomplete="off"
                  class="w-full mt-3"
                  :ui="{ icon: { trailing: { pointer: '' } } }"
                >
                  <template #trailing>
                    <UButton
                      v-show="urlToItemArt !== ''"
                      color="gray"
                      variant="link"
                      icon="i-heroicons-x-mark-20-solid"
                      :padded="false"
                      @click="urlToItemArt = ''"
                    />
                  </template>
                </UInput>
              </div>
              <h1 v-if="!urlToItemArt && !urlToItem" class="mb-3">ИЛИ</h1>
              <div v-if="!urlToItemArt">
                <label
                  >Скопируйте
                  <span class="text-red-500 font-semibold uppercase"
                    >ссылку на товар с браузера</span
                  >
                </label>
              </div>
              <div v-if="!urlToItemArt" class="h-[44px]">
                <UInput
                  v-model="urlToItem"
                  name="urlToItem"
                  placeholder="Вставьте скопированную ссылку с браузера"
                  icon="i-ph-package-bold"
                  autocomplete="off"
                  class="w-full mt-3"
                  :ui="{ icon: { trailing: { pointer: '' } } }"
                >
                  <template #trailing>
                    <UButton
                      v-show="urlToItem !== ''"
                      color="gray"
                      variant="link"
                      icon="i-heroicons-x-mark-20-solid"
                      :padded="false"
                      @click="urlToItem = ''"
                    />
                  </template>
                </UInput>
              </div>
              <label class="text-sm italic text-center"
                >предварительно выбрав верный размер и цвет на сайте</label
              >
              <div class="flex justify-end gap-3 mt-5" v-auto-animate>
                <UButton
                  v-if="!address"
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showSecondModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  v-if="address"
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showFirstModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  v-if="!urlToItem && items.length"
                  @click="showLastModal()"
                  class="font-bold"
                  label="К ЗАКАЗУ"
                  color="primary"
                >
                  <template #trailing>
                    <UIcon
                      name="i-heroicons-arrow-right-20-solid"
                      class="w-5 h-5"
                    />
                  </template>
                </UButton>
                <UButton
                  v-if="urlToItem || urlToItemArt"
                  @click="showFourModal()"
                  class="font-bold"
                  label="ДАЛЕЕ"
                  color="primary"
                >
                  <template #trailing>
                    <UIcon
                      name="i-heroicons-arrow-right-20-solid"
                      class="w-5 h-5"
                    />
                  </template>
                </UButton>
              </div>
            </div>

            <div v-if="isOpenThirdModal && marketplace === 'WB'" v-auto-animate>
              <div>
                <label
                  >Скопируйте
                  <span class="text-red-500 font-semibold uppercase"
                    >ссылку на товар</span
                  >
                </label>
              </div>
              <label class="text-sm italic"
                >предварительно выбрав верный размер и цвет на сайте</label
              >
              <div class="h-[44px]">
                <UInput
                  v-model="urlToItem"
                  name="urlToItem"
                  icon="i-ph-package-bold"
                  placeholder="Вставьте скопированную ссылку на товар"
                  color="gray"
                  variant="outline"
                  autocomplete="off"
                  class="w-full mt-3"
                  :ui="{ icon: { trailing: { pointer: '' } } }"
                >
                  <template #trailing>
                    <UButton
                      v-show="urlToItem !== ''"
                      color="gray"
                      variant="link"
                      icon="i-heroicons-x-mark-20-solid"
                      :padded="false"
                      @click="urlToItem = ''"
                    />
                  </template>
                </UInput>
              </div>
              <div class="flex items-center justify-center mb-5">
                <UButton
                  size="2xs"
                  class="font-bold"
                  icon="i-material-symbols-add-link"
                  @click="pasteToTextArea"
                >
                  ВСТАВИТЬ
                </UButton>
              </div>

              <div class="flex justify-end gap-3" v-auto-animate>
                <UButton
                  v-if="!address"
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showSecondModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  v-if="address"
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showFirstModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  v-if="!urlToItem && items.length"
                  @click="showLastModal()"
                  class="font-bold"
                  label="К ЗАКАЗУ"
                  color="primary"
                >
                  <template #trailing>
                    <UIcon
                      name="i-heroicons-arrow-right-20-solid"
                      class="w-5 h-5"
                    />
                  </template>
                </UButton>
                <UButton
                  v-if="urlToItem"
                  @click="showFourModal()"
                  class="font-bold"
                  label="ДАЛЕЕ"
                  color="primary"
                >
                  <template #trailing>
                    <UIcon
                      name="i-heroicons-arrow-right-20-solid"
                      class="w-5 h-5"
                    />
                  </template>
                </UButton>
              </div>
            </div>

            <div v-if="isOpenFourModal" v-auto-animate>
              <label>Укажите количество товаров для заказа</label>
              <div class="h-[44px]">
                <UInput
                  v-model="quantityOfItem"
                  class="w-full mt-3"
                  type="number"
                  color="gray"
                  variant="outline"
                  size="sm"
                  icon="i-ic-round-numbers"
                />
              </div>
              <div class="mt-5 flex justify-end gap-3" v-auto-animate>
                <UButton
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showThirdModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  v-if="quantityOfItem"
                  @click="showLastModal(), parsingPage()"
                  class="font-bold"
                  label="ДОБАВИТЬ ТОВАР"
                  color="primary"
                >
                  <template #trailing>
                    <UIcon
                      name="i-heroicons-arrow-right-20-solid"
                      class="w-5 h-5"
                    />
                  </template>
                </UButton>
              </div>
            </div>

            <div v-if="isOpenLastModal" v-auto-animate>
              <div v-if="items.length > 0">
                <h1 class="font-semibold">
                  Количество товаров:
                  <span class="text-secondary-color font-bold"
                    >{{ items.length }} шт.</span
                  >
                </h1>
                <h1 class="font-semibold">
                  Стоимость товаров:
                  <span class="text-secondary-color font-bold"
                    >{{
                      items.reduce((ac, item) => ac + item.priceSite, 0)
                    }}
                    ₽</span
                  >
                </h1>
                <h1 class="font-semibold">
                  Стоимость с доставкой:
                  <span class="text-secondary-color font-bold"
                    >{{
                      items.reduce(
                        (ac, item) =>
                          ac +
                          roundToNearestTen(
                            item.priceSite +
                              (item.priceSite * item.percentClient) / 100
                          ),
                        0
                      )
                    }}
                    ₽</span
                  >
                </h1>
                <div
                  class="bg-gray-100 rounded-md p-5 max-sm:py-16 mt-5 max-sm:px-2 flex flex-col gap-5 max-sm:gap-7 max-h-[400px] overflow-y-auto"
                >
                  <div v-auto-animate v-for="item in items.slice().reverse()">
                    <div
                      class="bg-white relative rounded-xl max-sm:hidden shadow-xl p-5 text-center flex items-center justify-between"
                    >
                      <div class="absolute bottom-0 right-32">
                        <img
                          v-if="item.marketplace === 'OZ'"
                          src="@/assets/images/ozon-bg.png"
                          class="max-w-[100px] mb-3 opacity-20"
                          alt=""
                        />
                        <img
                          v-if="item.marketplace === 'WB'"
                          src="@/assets/images/wb.png"
                          class="max-w-[130px] opacity-20"
                          alt=""
                        />
                        <img
                          v-if="item.marketplace === 'YM'"
                          src="@/assets/images/ym.png"
                          class="max-w-[130px] opacity-20"
                          alt=""
                        />
                      </div>
                      <div class="flex items-center gap-5">
                        <img
                          class="rounded-full aspect-square object-cover w-16 h-16"
                          :src="item.img"
                        />
                        <div class="flex flex-col items-start">
                          <a
                            :href="item.productLink"
                            target="_blank"
                            class="font-bold cursor-pointer text-secondary-color underline line-clamp-1 hover:line-clamp-none max-w-[180px] text-left"
                          >
                            {{ item.productName }}
                          </a>
                          <h1 class="font-medium text-sm italic">
                            {{ item.quantity }} шт.
                          </h1>
                        </div>
                      </div>
                      <h1 class="font-medium">
                        {{ item.priceSite }} ₽ <br />
                        <span class="italic text-[11px]">
                          ({{
                            roundToNearestTen(
                              item.priceSite + (item.priceSite * 10) / 100
                            )
                          }}
                          ₽)
                        </span>
                      </h1>
                      <Icon
                        @click="deleteItemFromOrder(item.productName)"
                        name="i-material-symbols-delete-rounded"
                        size="24"
                        class="text-red-500 hover:opacity-50 duration-200 cursor-pointer"
                      />
                    </div>
                    <div
                      class="bg-white relative rounded-xl w-full max-sm:flex hidden shadow-xl pr-5 text-center items-center justify-between"
                    >
                      <div class="absolute bottom-0 right-20">
                        <img
                          v-if="item.marketplace === 'OZ'"
                          src="@/assets/images/ozon-bg.png"
                          class="max-w-[100px] mb-3 opacity-5"
                          alt=""
                        />
                        <img
                          v-if="item.marketplace === 'WB'"
                          src="@/assets/images/wb.png"
                          class="max-w-[130px] opacity-5"
                          alt=""
                        />
                        <img
                          v-if="item.marketplace === 'YM'"
                          src="@/assets/images/ym.png"
                          class="max-w-[130px] opacity-5"
                          alt=""
                        />
                      </div>
                      <div class="flex items-center gap-5">
                        <div
                          @click="deleteItemFromOrder(item.productName)"
                          class="bg-red-500 hover:opacity-50 duration-200 cursor-pointer text-white h-[100px] rounded-l-xl flex items-center px-1 hover:px-5"
                        >
                          <Icon
                            name="i-material-symbols-delete-rounded"
                            size="24"
                          />
                        </div>
                        <div class="flex items-center gap-5">
                          <div
                            class="flex flex-col items-start max-[360px]:max-w-[120px]"
                          >
                            <a
                              :href="item.productLink"
                              target="_blank"
                              class="font-bold max-sm:text-sm cursor-pointer text-secondary-color underline line-clamp-1 hover:line-clamp-4 text-left"
                            >
                              {{ item.productName }}
                            </a>
                            <h1 class="font-medium text-sm italic">
                              {{ item.quantity }} шт.
                            </h1>
                            <h1 class="font-medium">
                              {{ item.priceSite }} ₽
                              <span class="italic text-[11px]">
                                ({{
                                  roundToNearestTen(
                                    item.priceSite + (item.priceSite * 10) / 100
                                  )
                                }}
                                ₽)
                              </span>
                            </h1>
                          </div>
                        </div>
                      </div>
                      <img
                        class="rounded-full aspect-square object-cover w-16 h-16 max-[360px]:w-10 max-[360px]:h-10"
                        :src="item.img"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <h1 class="text-center py-5 text-xl">
                  Корзина пуста! Добавьте товары в заказ.
                </h1>
              </div>
              <div class="mt-5 flex justify-end gap-3 flex-col" v-auto-animate>
                <UButton
                  icon="i-heroicons-arrow-left-20-solid"
                  size="sm"
                  @click="showFirstModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="НАЗАД"
                  :trailing="false"
                />
                <UButton
                  icon="i-mdi-package-variant-closed-plus"
                  size="sm"
                  @click="showThirdModal()"
                  class="font-bold"
                  color="primary"
                  variant="solid"
                  label="ДОБАВИТЬ ЕЩЁ ТОВАР"
                  :trailing="false"
                />
                <UButton
                  v-if="items.length > 0"
                  @click="showAcceptModal"
                  class="font-bold"
                  label="ОТПРАВИТЬ ЗАКАЗ"
                  color="primary"
                  icon="i-material-symbols-order-approve"
                >
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </UModal>

      <div
        v-auto-animate
        v-if="isShowAcceptModal"
        class="fixed top-0 bottom-0 left-0 bg-black bg-opacity-70 right-0 z-[100]"
      >
        <div
          class="flex items-center justify-center h-screen text-black font-semibold"
        >
          <div
            class="bg-white relative p-10 max-sm:p-10 rounded-lg flex items-center flex-col gap-1"
          >
            <div class="absolute top-4 right-4 max-sm:top-2 max-sm:right-2">
              <Icon
                name="material-symbols:cancel-rounded"
                size="32"
                class="cursor-pointer hover:text-secondary-color duration-200"
                @click="closeAcceptModal()"
              />
            </div>
            <h1
              class="text-xl text-center font-semibold max-sm:text-xl mt-5 max-sm:mt-5"
            >
              Товары будут доставлены <br class="hidden max-sm:block" />
              на
              <span class="text-secondary-color font-bold">
                {{
                  pvzs.find((pvz) => pvz.pvz === addressData)?.name
                    ? pvzs.find((pvz) => pvz.pvz === addressData)?.name
                    : "Не выбран"
                }}
              </span>
            </h1>
            <h1 class="mb-3">
              Стоимость с доставкой:
              <span class="text-secondary-color font-bold"
                >{{
                  items.reduce(
                    (ac, item) =>
                      ac +
                      roundToNearestTen(
                        item.priceSite +
                          (item.priceSite * item.percentClient) / 100
                      ),
                    0
                  )
                }}
                ₽</span
              >
            </h1>
            <div class="flex items-center gap-3 max-sm:flex-col">
              <UButton
                @click="closeAcceptModal(), clearAddress(), showSecondModal()"
                class="font-bold uppercase max-sm:w-full"
                icon="i-material-symbols-change-circle-rounded"
                size="xl"
                >Изменить</UButton
              >
              <UButton
                @click="closeAcceptModal(), submitForm()"
                class="font-bold uppercase max-sm:w-full"
                icon="i-f7-checkmark-alt-circle-fill"
                size="xl"
                >Подтверждаю</UButton
              >
            </div>
          </div>
        </div>
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
              class="text-2xl text-center text-green-500 font-bold uppercase border-b-2 border-black w-full mb-3 max-sm:text-xl py-3 max-sm:mt-5"
            >
              Ваш заказ успешно оформлен!
            </h1>
            <div class="flex items-center gap-3 max-sm:flex-col">
              <h1 class="text-xl max-sm:text-lg max-sm:text-center">
                Информация о статусе заказа в
              </h1>
              <UButton
                @click="router.push('/client/my-orders')"
                class="font-bold uppercase"
                icon="i-material-symbols-shopping-cart"
                size="xl"
                >Товары в пути</UButton
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="w-screen">
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
