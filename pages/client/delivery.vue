<script setup lang="ts">
import Cookies from "js-cookie";

const storeClients = useClientsStore();
const storeRansom = useRansomStore();
const router = useRouter();
const toast = useToast();

let user = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);

const storeCells = useCellsStore();

let originallyRows = ref<Array<IOurRansom>>();
let cells = ref<Array<Cell>>();
let cellData = ref({} as Cell);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeClients.getClient();
  originallyRows.value = await storeRansom.getRansomRowsForModal("ClientRansom");
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

import { createClient } from "@supabase/supabase-js";
import { useToast } from "vue-toastification";

const supabase = createClient(
  "https://mgbbkkgyorhwryabwabx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nYmJra2d5b3Jod3J5YWJ3YWJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzE0NjQ5OCwiZXhwIjoyMDE4NzIyNDk4fQ.Ogcld2z2P5M3V5N2yEpyfmHPsXor9Mv_5fUya5wgEoY"
);

let rowData = ref({} as IClientRansom);
let marketplace = ref("");

async function handleFileChange(event) {
  const selectedFile = event.target.files[0];
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const { data, error } = await supabase.storage
    .from("image")
    .upload(`img-${randomDigits}-${selectedFile.name}`, selectedFile);
  rowData.value.img = `${randomDigits}-${selectedFile.name}`;
  rowData.value.fromName = user.value.phoneNumber;
  rowData.value.productLink = marketplace.value;
  rowData.value.dispatchPVZ = pvzData.value;
  getCellFromName();
  if (data) {
    console.log(data);
    isLoading.value = true;
    await storeRansom.createRansomRow(
      rowData.value,
      user.value.phoneNumber,
      "ClientRansom"
    );
    isShowModal.value = true;
    isLoading.value = false;
  } else {
    console.log(error);
  }
}

async function getCellFromName() {
  if (rowData.value.fromName.trim().length === 12) {
    let row = originallyRows.value?.filter(
      (row) =>
        row.fromName === rowData.value.fromName &&
        row.dispatchPVZ === "НаДом" &&
        (row.deliveredPVZ === null || row.deliveredSC === null || row.issued === null) &&
        !row.cell.includes("-")
    );

    if (row && row.length > 0) {
      const unoccupiedCellsAndPVZ = cells.value?.sort((a, b) => a.name - b.name);
      const freeCell = unoccupiedCellsAndPVZ?.find(
        (cell) => cell.PVZ === "НаДом" && cell.status === "Свободно"
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
          rowData.value.cell = freeCell.name;
          cellData.value = freeCell;
        } else {
          toast.warning("Нет свободных ячеек для выбранного ПВЗ");
        }
      } else {
        rowData.value.cell = row[0].cell;
      }
    } else {
      const unoccupiedCellsAndPVZ = cells.value
        ?.filter((cell) => cell.status === "Свободно")
        .sort((a, b) => a.name - b.name);
      const freeCell = unoccupiedCellsAndPVZ?.find((cell) => cell.PVZ === "НаДом");
      if (freeCell) {
        rowData.value.cell = freeCell.name;
        cellData.value = freeCell;
      } else {
        toast.warning("Нет свободных ячеек для выбранного ПВЗ");
      }
    }
  }
}

const currentTime = new Date();
const hours = currentTime.getHours();
const minutes = currentTime.getMinutes();

const isDisabled = hours >= 12 && hours < 24 && minutes >= 1;
let pvzData = ref("");
let isShowModal = ref(false);
</script>

<template>
  <Head>
    <Title>Доставить мой заказ</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="flex items-center justify-center flex-col pt-40">
        <h1 class="text-2xl mb-5">Выберите маркетплейс</h1>
        <select
          class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 mt-5 text-lg w-full focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400 mb-3"
          v-model="marketplace"
        >
          <option class="text-lg" value="Ozon">Ozon</option>
          <option class="text-lg" value="Wildberries">Wildberries</option>
          <option class="text-lg" value="Яндекс Маркет">Яндекс Маркет</option>
          <option class="text-lg" value="СДЕК">СДЕК</option>
          <option class="text-lg" value="Почта">Почта</option>
          <option class="text-lg" value="DNS">DNS</option>
        </select>
        <h1 class="text-2xl mb-5 mt-10">Выберите пункт выдачи заказов</h1>
        <select
          class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 mt-5 text-lg w-full focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400 mb-3"
          v-model="pvzData"
        >
          <option class="text-lg" value="ПВЗ_1">
            г. Донецк, ул. Антропова 16
          </option>
          <option class="text-lg" value="ПВЗ_3">г. Донецк, ул. Палладина 20</option>
          <option class="text-lg" value="ПВЗ_4">
            г. Донецк, ул. Нартова, 1.
          </option>
          <option class="text-lg" value="ППВЗ_5">
            г. Донецк, ул Дудинская, д. 4, кв7
          </option>
          <option class="text-lg" value="ППВЗ_6">
            г. Донецк, ул Довженко, д 55, кв5
          </option>
        </select>
        <div v-if="marketplace !== '' && pvzData !== ''" class="flex items-center flex-col">
          <h1 class="text-2xl mb-5 mt-10 text-center">Прикрепите скриншот Штрих-кода</h1>
          <input
            class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 max-w-[200px] focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            @change="handleFileChange"
            :disabled="isDisabled"
            type="file"
          />
          <h1 class="text-base mt-10 mb-1 text-secondary-color font-bold">
            *штрих-код обновляется каждые 24 часа
          </h1>
          <h1 class="text-base text-secondary-color text-center font-bold">
            **прикрепить скриншот можно с 00:00 до 12:00 ежедневно
          </h1>
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
