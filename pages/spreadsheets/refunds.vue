<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storePVZ = usePVZStore();
const storeSortingCenters = useSortingCentersStore();

const router = useRouter();

let isLoading = ref(false);

let user = ref({} as User);

let rows = ref<Array<IOurRansom>>();
let pvz = ref<Array<PVZ>>();
let sortingCenters = ref<Array<SortingCenter>>();

const filteredRows = ref<Array<IOurRansom>>();
function handleFilteredRows(filteredRowsData: IOurRansom[]) {
  if (user.value.visiblePVZ === "ВСЕ" && user.value.visibleSC === "ВСЕ") {
    filteredRows.value = filteredRowsData;
  } else if (
    user.value.visiblePVZ === "ВСЕ" &&
    user.value.visibleSC !== "ВСЕ"
  ) {
    filteredRows.value = filteredRowsData.filter(
      (row) => row.orderPVZ === user.value.visibleSC && row.deliveredSC !== null
    );
  } else if (
    user.value.visiblePVZ !== "ВСЕ" &&
    user.value.visibleSC === "ВСЕ"
  ) {
    filteredRows.value = filteredRowsData.filter(
      (row) =>
        user.value.PVZ.includes(row.dispatchPVZ) && row.deliveredSC !== null && row.verified === null
    );
  } else if (
    user.value.visiblePVZ !== "ВСЕ" &&
    user.value.visibleSC !== "ВСЕ"
  ) {
    filteredRows.value = filteredRowsData.filter(
      (row) =>
        user.value.PVZ.includes(row.dispatchPVZ) &&
        row.orderPVZ === user.value.visibleSC &&
        row.deliveredSC !== null
    );
  }
}

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeRansom.getRansomRowsRefunds("OurRansom");

  if (rows.value) {
    handleFilteredRows(rows.value);
  }

  isLoading.value = false;

  pvz.value = await storePVZ.getPVZ();
  sortingCenters.value = await storeSortingCenters.getSortingCenters();

  if (!token) {
    router.push("/auth/login");
  }
});

definePageMeta({
  layout: false,
  name: "Возвраты",
});

let rowData = ref({} as IOurRansom);
let isOpen = ref(false);
function openModal(row: IOurRansom) {
  isOpen.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    rowData.value.shipped = rowData.value.shipped
      ? storeUsers.getISODateTime(rowData.value.shipped)
      : null;
    rowData.value.verified = rowData.value.verified
      ? storeUsers.getISODateTime(rowData.value.verified)
      : null;
  } else {
    rowData.value = {} as IOurRansom;
    rowData.value.fromName = "";
  }
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IOurRansom;
}

async function updateRow() {
  isLoading.value = true;

  await storeRansom.updateRansomRow(
    rowData.value,
    user.value.username,
    "OurRansom"
  );
  filteredRows.value = await storeRansom.getRansomRowsRefunds("OurRansom");

  closeModal();

  rows.value = filteredRows.value;
  isLoading.value = false;
}

async function updateDeliveryRows(obj: any) {
  let answer = confirm(
    `Вы точно хотите изменить статус? Количество записей: ${obj.idArray.length}`
  );
  if (answer) {
    isLoading.value = true;
    await storeRansom.updateDeliveryRowsStatus(obj.idArray, obj.flag, "OurRansom", user.value.username);
    filteredRows.value = await storeRansom.getRansomRowsRefunds("OurRansom");
    rows.value = filteredRows.value;
    isLoading.value = false;
  }
}

const token = Cookies.get("token");
</script>

<template>
  <Head>
    <Title>Наш выкуп</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div v-if="!isLoading" class="mt-14">
          <SpreadsheetsRefundsFilters
            v-if="rows"
            @filtered-rows="handleFilteredRows"
            :rows="rows"
            :user="user"
          />
          <SpreadsheetsRefundsTable1
            :rows="filteredRows"
            :user="user"
            @open-modal="openModal"
            @update-delivery-rows="updateDeliveryRows"
          />

          <UIModal v-show="isOpen" @close-modal="closeModal">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
            </template>
            <div class="text-black">
              <div
                class="grid grid-cols-2 mb-5"
                v-if="
                  user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'
                "
              >
                <label for="dispatchPVZ1" class="max-sm:text-sm"
                  >Отправка в ПВЗ</label
                >
                <div>
                  <select
                    class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.dispatchPVZ"
                    :disabled="user.dispatchPVZ1 === 'READ'"
                  >
                    <option v-for="pvzData in pvz" :value="pvzData.name">
                      {{ pvzData.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div
                class="grid grid-cols-2 mb-5"
                v-if="
                  user.productLink1 === 'READ' || user.productLink1 === 'WRITE'
                "
              >
                <label for="productLink1" class="max-sm:text-sm"
                  >Товар (ссылка)</label
                >
                <input
                  :disabled="user.productLink1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.productLink"
                  type="text"
                />
              </div>

              <div
                class="grid grid-cols-2 mb-5"
                v-if="
                  user.productName1 === 'READ' || user.productName1 === 'WRITE'
                "
              >
                <label for="productName1" class="max-sm:text-sm"
                  >Название товара</label
                >
                <input
                  :disabled="user.productName1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.productName"
                  type="text"
                />
              </div>

              <div
                class="grid grid-cols-2 mb-5"
                v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
              >
                <label for="priceSite" class="max-sm:text-sm"
                  >Стоимость сайт</label
                >
                <input
                  :disabled="user.priceSite === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.priceSite"
                  type="number"
                />
              </div>

              <div
                class="grid grid-cols-2 mb-5"
                v-if="
                  user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'
                "
              >
                <label for="prepayment1" class="max-sm:text-sm"
                  >Предоплата</label
                >
                <input
                  :disabled="user.prepayment1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.prepayment"
                  type="number"
                  placeholder="По умолчанию: 0"
                />
              </div>

              <div
                class="grid grid-cols-2 mb-5"
                v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'"
              >
                <label for="orderPVZ1" class="max-sm:text-sm"
                  >Заказано на СЦ</label
                >
                <select
                  class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.orderPVZ"
                  :disabled="user.orderPVZ1 === 'READ'"
                >
                  <option
                    v-for="sortingCenter in sortingCenters"
                    :value="sortingCenter.name"
                  >
                    {{ sortingCenter.name }}
                  </option>
                </select>
              </div>

              <div
                class="grid grid-cols-2 mb-5"
              >
                <label for="shipped" class="max-sm:text-sm"
                  >Отправлено</label
                >
                <input
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.shipped"
                  type="datetime-local"
                />
              </div>

              <div
                class="grid grid-cols-2 mb-5"
              >
                <label for="verified" class="max-sm:text-sm"
                  >Проверено</label
                >
                <input
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.verified"
                  type="datetime-local"
                />
              </div>

              <div
                class="grid grid-cols-2 mb-5"
              >
                <label for="priceSite" class="max-sm:text-sm"
                  >Стоимость возврата</label
                >
                <input
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.priceRefund"
                  type="number"
                />
              </div>

              <div
                class="grid grid-cols-2 mb-5"
                v-if="
                  user.additionally1 === 'READ' ||
                  user.additionally1 === 'WRITE'
                "
              >
                <label for="additionally1" class="max-sm:text-sm"
                  >Дополнительно</label
                >
                <select
                  class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.additionally"
                  :disabled="user.additionally1 === 'READ'"
                >
                  <option value="">Отменить</option>
                  <option value="Оплачено онлайн">Оплачено онлайн</option>
                  <option value="Отказ клиент">Отказ клиент</option>
                  <option value="Отказ брак">Отказ брак</option>
                </select>
              </div>
            </div>

            <div
              class="flex items-center justify-center gap-3 mt-10"
              v-if="rowData.id"
            >
              <UIMainButton @click="updateRow">Сохранить</UIMainButton>
              <UIMainButton @click="closeModal">Отменить</UIMainButton>
            </div>
          </UIModal>
        </div>

        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div v-if="!isLoading" class="mt-14">
          <SpreadsheetsRefundsFilters
            v-if="rows"
            @filtered-rows="handleFilteredRows"
            :rows="rows"
            :user="user"
          />
          <SpreadsheetsRefundsTable1 :rows="filteredRows" :user="user" />
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
