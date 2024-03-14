<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from 'vue-toastification';

const toast = useToast()

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storePVZ = usePVZDeliveryStore();
const storeSortingCenters = useSortingCentersDeliveryStore();

const router = useRouter();

let isLoading = ref(false);

let user = ref({} as User);

let rows = ref<Array<IDelivery>>();
let pvz = ref<Array<PVZ>>();
let sortingCenters = ref<Array<SortingCenter>>();

let rowData = ref({} as IDelivery);

let isOpen = ref(false);

function openModal(row: IDelivery) {
  isOpen.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    rowData.value.sorted = rowData.value.sorted
      ? storeUsers.getISODateTime(rowData.value.sorted)
      : null;
    rowData.value.paid = rowData.value.paid
      ? storeUsers.getISODateTime(rowData.value.paid)
      : null;
  } else {
    rowData.value = {} as IDelivery;
    rowData.value.fromName = ''
  }
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IDelivery;
}

async function updateDeliveryRow(obj: any) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите изменить статус доставки?");
  if (answer) await storeRansom.updateDeliveryStatus(obj.row, obj.flag, 'Delivery', user.value.username);
  filteredRows.value = await storeRansom.getRansomRows("Delivery");
  rows.value = filteredRows.value
  isLoading.value = false;
}

async function updateDeliveryRows(obj: any) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите изменить статус доставки?");
  if (answer) await storeRansom.updateDeliveryRowsStatus(obj.idArray, obj.flag, 'Delivery', user.value.username);
  filteredRows.value = await storeRansom.getRansomRows("Delivery");
  rows.value = filteredRows.value
  isLoading.value = false;
}

async function deleteRow(id: number) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данную строку?");
  if (answer) await storeRansom.deleteRansomRow(id, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows("Delivery");
  rows.value = filteredRows.value
  isLoading.value = false;
}

async function deleteSelectedRows(idArray: number[]) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данные строки?");
  if (answer) await storeRansom.deleteRansomSelectedRows(idArray, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows("Delivery");
  rows.value = filteredRows.value
  isLoading.value = false;
}

async function updateRow() {
  isLoading.value = true;
  await storeRansom.updateRansomRow(rowData.value, user.value.username, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows("Delivery");
  rows.value = filteredRows.value
  closeModal();
  isLoading.value = false;
}

async function createRow() {
  isLoading.value = true;
  await storeRansom.createRansomRow(rowData.value, user.value.username, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows('Delivery');
  rows.value = filteredRows.value
  closeModal();
  isLoading.value = false;
}

async function createCopyRow(id: number) {
  isLoading.value = true;
  await storeRansom.createCopyRow(id, 'Delivery');
  filteredRows.value = await storeRansom.getRansomRows('Delivery');
  rows.value = filteredRows.value
  isLoading.value = false;
}

const filteredRows = ref<Array<IDelivery>>();

function handleFilteredRows(filteredRowsData: IDelivery[]) {
  filteredRows.value = filteredRowsData;
}

async function deleteIssuedRows() {
  isLoading.value = true;
  await storeRansom.deleteIssuedRows("Delivery");
  filteredRows.value = await storeRansom.getRansomRows("Delivery");
  rows.value = filteredRows.value
  isLoading.value = false;
}

function deleteIssuedRowsTimer() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  if (currentHour === 22 && currentMinute >= 0 || currentHour === 23 && currentMinute <= 59) {
    deleteIssuedRows();
  }
}


onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeRansom.getRansomRows('Delivery');
  if (rows.value) {
    handleFilteredRows(rows.value)
  }

  deleteIssuedRowsTimer();


  isLoading.value = false;
  
  pvz.value = await storePVZ.getPVZ();
  sortingCenters.value = await storeSortingCenters.getSortingCenters();


  if (!token || user.value.dataDelivery === "NONE") {
    router.push("/auth/login");
  }


});

definePageMeta({
  layout: false,
  name: "Доставка и Сортировка"
});

const token = Cookies.get("token");

let isAutoName = ref(true);
let isAutoFromName = ref(true);

function getNameFromName() {
  if (rowData.value.fromName.trim().length === 4) {
    let phoneNum = rowData.value.fromName.trim().toString().slice(-4);
    let row = rows.value?.filter((row) => row.fromName ? row.fromName.slice(-4) === phoneNum : '');

    if (row && row.length > 0) {
      if (row.some(r => r.fromName !== row[0].fromName)) {
        toast.warning("Было найдено несколько номеров. Впишите полный номер");
      } else {
        rowData.value.fromName = row[0].fromName;
      }
    }
  }

  if (rowData.value.fromName.trim().length === 12 && isAutoFromName.value === true) {
    let rowCell = rows.value?.filter((row) => row.fromName === rowData.value.fromName);
    if (rowCell) {
      rowData.value.name = rowCell[0].name;
    }
  }
}

function getFromNameFromName() {
  if (rowData.value.name.trim() && isAutoName.value === true) {
    let rowFromName = rows.value?.filter((row) => row.name === rowData.value.name);
    if (rowFromName) {
      rowData.value.fromName = rowFromName[0].fromName;
    }
  }
}
</script>

<template>
  <Head>
    <Title>Наш выкуп</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div v-if="!isLoading" class="mt-14">
          <div>
            <SpreadsheetsDeliveryFilters v-if="rows" @filtered-rows="handleFilteredRows" :rows="rows" />
            <div class="mt-5 flex items-center gap-3" v-if="user.dataDelivery === 'WRITE'">
              <UIMainButton v-if="user.role === 'ADMIN' || user.username === 'Волошина'" @click="openModal">Создать новую
                запись</UIMainButton>
            </div>
          </div>

          <SpreadsheetsDeliveryTable @update-delivery-row="updateDeliveryRow" :rows="filteredRows" :user="user"
            @delete-row="deleteRow" @open-modal="openModal" @delete-selected-rows="deleteSelectedRows"
            @update-delivery-rows="updateDeliveryRows" @create-copy-row="createCopyRow" />

          <UIModal v-show="isOpen" @close-modal="closeModal">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой строки</div>
            </template>
            <div class="text-black">

              <div class="grid grid-cols-2 mb-5" v-if="user.name3 === 'READ' || user.name3 === 'WRITE'">
                <label for="name">Имя</label>
                <div>
                  <input :disabled="user.name3 === 'READ'"
                    class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.name" type="text" @input="getFromNameFromName" />
                  <div class="flex gap-3 items-center justify-center mt-1">
                    <h1>АВТО</h1>
                    <input type="checkbox" v-model="isAutoName" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.fromName3 === 'READ' || user.fromName3 === 'WRITE'">
                <label for="fromName">Телефон <sup>*</sup> </label>
                <div>
                  <input :disabled="user.fromName3 === 'READ'"
                    class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.fromName" type="text" @input="getNameFromName" />
                  <div class="flex gap-3 items-center justify-center mt-1">
                    <h1>АВТО</h1>
                    <input type="checkbox" v-model="isAutoFromName" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5"
                v-if="(user.purchaseOfGoods === 'READ' || user.purchaseOfGoods === 'WRITE') && !rowData.id">
                <label for="purchaseOfGoods">Стоимость товаров <br> сортировки</label>
                <input :disabled="user.purchaseOfGoods === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.purchaseOfGoods" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-else>
                <label for="purchaseOfGoods">Cтоимость выкупа <br> товара</label>
                <input :disabled="user.purchaseOfGoods === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.purchaseOfGoods" type="text" />
              </div>


              <div class="grid grid-cols-2 mb-5" v-if="user.percentClient3 === 'READ' || user.percentClient3 === 'WRITE'">
                <label for="percentClient1">Процент с клиента</label>
                <input :disabled="user.percentClient3 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.percentClient" placeholder="По умолчанию: 2" type="number" />
              </div>

              <div class="grid grid-cols-2 mb-5"
                v-if="(user.purchaseOfGoods === 'READ' || user.purchaseOfGoods === 'WRITE') && !rowData.id">
                <label for="purchaseOfGoods">Стоимость товаров <br> доставки</label>
                <input :disabled="user.purchaseOfGoods === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.purchaseOfGoods2" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5"
                v-if="(user.percentClient3 === 'READ' || user.percentClient3 === 'WRITE') && !rowData.id">
                <label for="percentClient1">Процент с клиента</label>
                <input :disabled="user.percentClient3 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.percentClient2" placeholder="По умолчанию: 2" type="number" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.dispatchPVZ3 === 'READ' || user.dispatchPVZ3 === 'WRITE'">
                <label for="dispatchPVZ1">Отправка в ПВЗ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.dispatchPVZ" :disabled="user.dispatchPVZ3 === 'READ'">
                  <option v-for="pvzData in pvz" :value="pvzData.name">
                    {{ pvzData.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.orderPVZ3 === 'READ' || user.orderPVZ3 === 'WRITE'">
                <label for="orderPVZ1">Заказано на СЦ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.orderPVZ" :disabled="user.orderPVZ3 === 'READ'">
                  <option v-for="sortingCenter in sortingCenters" :value="sortingCenter.name">
                    {{ sortingCenter.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.sorted === 'READ' || user.sorted === 'WRITE'">
                <label for="deliveredSC1">Отсортировано</label>
                <input :disabled="user.sorted === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.sorted" type="datetime-local" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.paid === 'READ' || user.paid === 'WRITE'">
                <label for="deliveredPVZ1">Оплачено</label>
                <input :disabled="user.paid === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.paid" type="datetime-local" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.additionally3 === 'READ' || user.additionally3 === 'WRITE'">
                <label for="additionally1">Дополнительно</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.additionally" :disabled="user.additionally3 === 'READ'">
                  <option value="">Отменить</option>
                  <option value="Оплачено онлайн">Оплачено онлайн</option>
                  <option value="Отказ клиент">Отказ клиент</option>
                  <option value="Отказ брак">Отказ брак</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-center gap-3 mt-10" v-if="rowData.id">
              <UIMainButton @click="updateRow">Сохранить
              </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
            <div class="flex items-center justify-center gap-3 mt-10" v-else>
              <UIMainButton :disabled="rowData.fromName === '' || rowData.fromName === null" @click="createRow">Создать
              </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
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
          <div>
            <SpreadsheetsDeliveryFilters v-if="rows" @filtered-rows="handleFilteredRows" :rows="rows" />
            <div class="mt-5 flex items-center gap-3" v-if="user.dataDelivery === 'WRITE'">
              <UIMainButton v-if="user.role === 'ADMIN' || user.username === 'Волошина'" @click="openModal">Создать новую
                запись</UIMainButton>
            </div>
          </div>

          <SpreadsheetsDeliveryTable @update-delivery-row="updateDeliveryRow" :rows="filteredRows" :user="user"
            @delete-row="deleteRow" @open-modal="openModal" @delete-selected-rows="deleteSelectedRows"
            @update-delivery-rows="updateDeliveryRows" @create-copy-row="createCopyRow" />

          <UIModal v-show="isOpen" @close-modal="closeModal">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой строки</div>
            </template>
            <div class="text-black">

              <div class="grid grid-cols-2 mb-5" v-if="user.name3 === 'READ' || user.name3 === 'WRITE'">
                <label for="name">Имя</label>
                <div>
                  <input :disabled="user.name3 === 'READ'"
                    class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.name" type="text" @input="getFromNameFromName" />
                  <div class="flex gap-3 items-center justify-center mt-1">
                    <h1>АВТО</h1>
                    <input type="checkbox" v-model="isAutoName" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.fromName3 === 'READ' || user.fromName3 === 'WRITE'">
                <label for="fromName">Телефон <sup>*</sup> </label>
                <div>
                  <input :disabled="user.fromName3 === 'READ'"
                    class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.fromName" type="text" @input="getNameFromName" />
                  <div class="flex gap-3 items-center justify-center mt-1">
                    <h1>АВТО</h1>
                    <input type="checkbox" v-model="isAutoFromName" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5"
                v-if="user.purchaseOfGoods === 'READ' || user.purchaseOfGoods === 'WRITE'">
                <label for="purchaseOfGoods">Стоимость товаров <br> сортировки</label>
                <input :disabled="user.purchaseOfGoods === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.purchaseOfGoods" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.percentClient3 === 'READ' || user.percentClient3 === 'WRITE'">
                <label for="percentClient1">Процент с клиента</label>
                <input :disabled="user.percentClient3 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.percentClient" placeholder="По умолчанию: 2" type="number" />
              </div>

              <div class="grid grid-cols-2 mb-5"
                v-if="user.purchaseOfGoods === 'READ' || user.purchaseOfGoods === 'WRITE'">
                <label for="purchaseOfGoods">Стоимость товаров <br> доставки</label>
                <input :disabled="user.purchaseOfGoods === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.purchaseOfGoods2" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.percentClient3 === 'READ' || user.percentClient3 === 'WRITE'">
                <label for="percentClient1">Процент с клиента</label>
                <input :disabled="user.percentClient3 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.percentClient2" placeholder="По умолчанию: 2" type="number" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.dispatchPVZ3 === 'READ' || user.dispatchPVZ3 === 'WRITE'">
                <label for="dispatchPVZ1">Отправка в ПВЗ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.dispatchPVZ" :disabled="user.dispatchPVZ3 === 'READ'">
                  <option v-for="pvzData in pvz" :value="pvzData.name">
                    {{ pvzData.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.orderPVZ3 === 'READ' || user.orderPVZ3 === 'WRITE'">
                <label for="orderPVZ1">Заказано на СЦ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.orderPVZ" :disabled="user.orderPVZ3 === 'READ'">
                  <option v-for="sortingCenter in sortingCenters" :value="sortingCenter.name">
                    {{ sortingCenter.name }}
                  </option>
                </select>
              </div>

            </div>

            <div class="flex items-center justify-center gap-3 mt-10" v-if="rowData.id">
              <UIMainButton @click="updateRow">Сохранить
              </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить</UIErrorButton>
            </div>
            <div class="flex items-center justify-center gap-3 mt-10" v-else>
              <UIMainButton :disabled="rowData.fromName === '' || rowData.fromName === null" @click="createRow">Создать
              </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
          </UIModal>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
