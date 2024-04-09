<script setup lang="ts">
import { read, utils, writeFile, write } from "xlsx";

const router = useRouter();
const route = useRoute();

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();

const emit = defineEmits([
  "openModal",
  "deleteRow",
  "deleteSelectedRows",
  "updateDeliveryRows",
  "createCopyRow",
  "showDeletedRows",
]);

function updateDeliveryRows(flag: string) {
  emit("updateDeliveryRows", { idArray: checkedRows.value, flag: flag });
  checkedRows.value = [];
  allSum.value = [];
  getAllSum.value = 0;
}

function openModal(row: IOurRansom) {
  emit("openModal", row);
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IOurRansom[]> },
  pvzLink: { type: String },
});

const allSum: Ref<RowData[]> = ref([]);
const checkedRows: Ref<number[]> = ref([]);

const getAllSum: Ref<number> = ref(0);
const showButton: Ref<boolean> = ref(true);
const showButtonPVZ: Ref<boolean> = ref(true);
const showButtonShipped: Ref<boolean> = ref(true);
const showButtonVerified: Ref<boolean> = ref(true);

const isChecked = (rowId: number): boolean => {
  return checkedRows.value.includes(rowId);
};

interface RowData {
  rowId: number;
  amount: number;
  issued: Date | null | string | number;
  deliveredPVZ: Date | null | string | number;
  deliveredSC: Date | null | string | number;
  orderPVZ: Date | null | string | number;
  shipped: Date | null | string | number;
  verified: Date | null | string | number;
}

const handleCheckboxChange = (row: IOurRansom): void => {
  if (isChecked(row.id)) {
    checkedRows.value = checkedRows.value.filter((id) => id !== row.id);
    allSum.value = allSum.value.filter((obj) => obj.rowId !== row.id);
  } else {
    checkedRows.value.push(row.id);
    allSum.value.push({
      rowId: row.id,
      amount: Math.ceil(row.amountFromClient1 / 10) * 10,
      issued: row.issued,
      deliveredPVZ: row.deliveredPVZ,
      orderPVZ: row.orderPVZ,
      deliveredSC: row.deliveredSC,
      shipped: row.shipped,
      verified: row.verified,
    });
  }
  getAllSum.value = allSum.value
    .filter((obj) => obj.issued === null)
    .reduce((sum, obj) => sum + obj.amount, 0);
  showButton.value = allSum.value.every((obj) => obj.issued === null);
  showButtonPVZ.value = allSum.value.every((obj) => obj.deliveredPVZ === null);
  showButtonShipped.value = allSum.value.every((obj) => obj.shipped === null);
  showButtonVerified.value = allSum.value.every((obj) => obj.verified === null);
};

const perPage = ref(100);
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.ceil((props.rows?.length || 0) / perPage.value)
);
const totalRows = computed(() => Math.ceil(props.rows?.length || 0));

let returnRows = ref<Array<IOurRansom>>();

function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;
  returnRows.value = props.rows?.slice(startIndex, endIndex);
}

watch(
  [currentPage, totalRows, props.rows, returnRows.value],
  updateCurrentPageData
);

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

let isVisiblePages = ref(true);

onMounted(async () => {
  updateCurrentPageData();

  if (props.user.role === "SORTIROVKA") {
    perPage.value = totalRows.value;
    updateCurrentPageData();
  }

  await storeRansom.getSumOfRejection();
});
</script>

<template>
  <div class="flex items-center justify-between max-lg:block mt-10 mb-5">
    <div>
      <div
        class="flex items-center max-sm:flex-col max-sm:items-start gap-5 mb-5"
      >
        <h1 class="text-xl" v-if="user.role !== 'PVZ' && user.role !== 'PPVZ'">
          Товаров к отправке:
          <span class="text-secondary-color font-bold">{{ totalRows }}</span>
        </h1>
        <h1 class="text-xl" v-if="user.role === 'PVZ' || user.role === 'PPVZ'">
          Товаров к отправке:
          <span class="text-secondary-color font-bold">{{ totalRows }}</span>
        </h1>
      </div>
    </div>
    <div class="flex items-end max-lg:mt-5 max-lg:justify-between gap-20">
      <div class="flex flex-col text-center" v-if="isVisiblePages">
        <h1 class="text-base">Страница:</h1>
        <h1 class="text-base mb-2">{{ currentPage }} из {{ totalPages }}</h1>
        <div class="flex items-center justify-center gap-2">
          <button
            @click="prevPage(), updateCurrentPageData()"
            :disabled="currentPage === 1"
            class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
          >
            <Icon
              name="material-symbols:arrow-back-ios-new-rounded"
              class="text-white"
            />
          </button>
          <button
            @click="nextPage(), updateCurrentPageData()"
            :disabled="currentPage === totalPages"
            class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
          >
            <Icon
              name="material-symbols:arrow-forward-ios-rounded"
              class="text-white"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
  <div
    class="fixed top-32 z-40 left-1/2 translate-x-[-50%] translate-y-[-50%]"
    v-if="checkedRows.length > 0"
  >
    <h1
      class="text-base text-center backdrop-blur-xl p-2 rounded-xl border-2 text-secondary-color font-bold"
    >
      Количество товаров: {{ checkedRows.length }}
    </h1>
  </div>

  <div
    class="fixed z-40 top-56 flex flex-col gap-3 left-1/2 translate-x-[-50%] translate-y-[-50%]"
    v-if="checkedRows.length > 0 && user.role !== 'PVZ' && user.role !== 'PPVZ'"
  >
    <UIActionButton
      v-if="showButtonShipped"
      @click="updateDeliveryRows('shipped')"
    >
      Отправить
    </UIActionButton>
    <UIActionButton
      v-if="showButtonVerified"
      @click="updateDeliveryRows('verified')"
    >
      Проверено
    </UIActionButton>
  </div>

  <div
    class="fixed z-40 flex flex-col gap-3 left-1/2 translate-x-[-50%] translate-y-[-50%]"
    v-if="checkedRows.length > 0 && user.role === 'PVZ' || user.role === 'PPVZ'"
  >
    <UIActionButton
      v-if="showButtonShipped"
      @click="updateDeliveryRows('shipped')"
    >
      Отправить
    </UIActionButton>
  </div>

  <div class="relative max-h-[610px] mt-5 mb-10 mr-5">
    <div id="up"></div>
    <table
      id="theTable"
      class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50"
      >
        <tr>
          <th
            scope="col"
            class="border-2"
            v-if="user.dataOurRansom === 'WRITE'"
          >
            Выделение
          </th>
          <th
            scope="col"
            class="exclude-row border-2 text-[10px]"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' || user.role === 'RMANAGER' "
          >
            изменение
          </th>
          <th scope="col" class="border-2 px-3">id</th>
          <th scope="col" class="border-2 px-3" v-if="user.role === 'PVZ' || user.role === 'PPVZ'">
            ячейка
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.productLink1 === 'READ' || user.productLink1 === 'WRITE'"
          >
            товар (ссылка)
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.productName1 === 'READ' || user.productName1 === 'WRITE'"
          >
            название товара
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
          >
            стоимость сайт
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' || user.role === 'RMANAGER' "
          >
            стоимость возврата
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'"
          >
            отправка в пвз
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'"
          >
            заказано на сц
          </th>
          <th
            scope="col"
            class="border-2"
            v-if="
              user.additionally1 === 'READ' || user.additionally1 === 'WRITE'
            "
          >
            дополнительно
          </th>
          <th scope="col" class="border-2">отправлено</th>
          <th scope="col" class="border-2">проверено</th>
          <th scope="col" class="border-2">кем отправлено</th>
          <th scope="col" class="border-2">кем проверено</th>
        </tr>
      </thead>
      <tbody>
        <div id="left"></div>
        <tr
          :class="{
            'bg-orange-100': isChecked(row.id),
          }"
          class="border-b text-center text-sm"
          v-for="row in returnRows"
        >
          <td
            v-if="user.dataOurRansom === 'WRITE'"
            class="border-2 text-secondary-color"
          >
            <input
              type="checkbox"
              :value="row.id"
              :checked="isChecked(row.id)"
              @change="handleCheckboxChange(row)"
            />
          </td>
          <td
            class="border-2"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' || user.role === 'RMANAGER' "
          >
            <Icon
              @click="openModal(row)"
              class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
              name="material-symbols:edit"
              size="32"
            />
          </td>
          <th
            scope="row"
            class="border-2 font-medium underline text-secondary-color whitespace-nowrap"
          >
            <NuxtLink
              v-if="user.role !== 'PVZ' && user.role !== 'ADMINISTRATOR' && user.role !== 'RMANAGER' && user.role !== 'PPVZ'"
              class="cursor-pointer hover:text-orange-200 duration-200"
              :to="`/spreadsheets/record/1/${row.id}`"
            >
              {{ row.id }}
            </NuxtLink>
            <h1 v-else>{{ row.id }}</h1>
          </th>
          <td class="border-2" v-if="user.role === 'PVZ' || user.role === 'PPVZ'">
            {{ row.cell }}
          </td>
          <td
            class="underline border-2 text-secondary-color whitespace-nowrap overflow-hidden max-w-[30px]"
            v-if="user.productLink1 === 'READ' || user.productLink1 === 'WRITE'"
          >
            <a
              :href="row.productLink"
              target="_blank"
              class="hover:text-orange-200 duration-200"
              >{{ row.productLink }}</a
            >
          </td>
          <td
            class="border-2 overflow-hidden max-h-[40px]"
            v-if="user.productName1 === 'READ' || user.productName1 === 'WRITE'"
          >
            {{ row.productName }}
          </td>
          <td
            class="border-2"
            v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'"
          >
            {{ row.priceSite }}
          </td>
          <td
            class="px-2 py-4 border-2"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' || user.role === 'RMANAGER' "
          >
            {{ row.priceRefund }}
          </td>
          <td
            class="px-2 py-4 border-2"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' || user.role === 'RMANAGER' "
          >
            {{ row.dispatchPVZ }}
          </td>
          <td
            class="px-2 py-4 border-2"
            v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' || user.role === 'RMANAGER' "
          >
            {{ row.orderPVZ }}
          </td>
          <td
            class="px-6 py-4 border-2"
            v-if="
              user.additionally1 === 'READ' || user.additionally1 === 'WRITE'
            "
          >
            {{ row.additionally ? row.additionally : "Пусто" }}
          </td>
          <td class="px-2 py-4 border-2 text-green-500 font-bold">
            {{ storeUsers.getNormalizedDate(row.shipped) }}
          </td>
          <td class="px-2 py-4 border-2 text-green-500 font-bold">
            {{ storeUsers.getNormalizedDate(row.verified) }}
          </td>
          <td class="px-2 py-4 border-2">
            {{ row.shippedUser }}
          </td>
          <td class="px-2 py-4 border-2">
            {{ row.verifiedUser }}
          </td>
          <div id="right"></div>
        </tr>
      </tbody>
    </table>
    <div id="down"></div>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
