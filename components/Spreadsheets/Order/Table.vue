<script setup lang="ts">
import type { PropType } from "vue";
import { useToast } from "vue-toastification";

const emit = defineEmits(["showModal"]);

const storeUsers = useUsersStore();

const props = defineProps({
  rows: {
    type: Array as PropType<IOurRansom[] | IClientRansom[]>,
    required: true,
  },
  user: { type: Object as PropType<Client> },
  link: { type: String },
  isShowModalValue: { type: Boolean, required: true },
});

let isShowWarning = ref(false);

function isExpired(row: any) {
  if (
    row.deliveredSC !== null &&
    row.deliveredPVZ !== null &&
    row.issued === null
  ) {
    const currentDate = new Date();

    const deliveredDate = new Date(row.deliveredPVZ);

    const difference = currentDate - deliveredDate;

    const daysDifference = difference / (1000 * 3600 * 24);

    if (daysDifference >= 7) {
      isShowWarning.value = true;
      return daysDifference >= 7;
    }
  }
}

function roundToNearestTen(num: number): number {
  const lastDigit = num % 10;
  if (lastDigit >= 5) {
    return Math.ceil(num / 10) * 10;
  } else {
    return Math.floor(num / 10) * 10;
  }
}

function isDateGreaterThanReference(dateString: string | Date): boolean {
  const referenceDate = new Date("2024-06-05T00:00:01");
  const inputDate = new Date(dateString);
  return inputDate > referenceDate;
}

function getStatus(row: IOurRansom | IClientRansom) {
  if (!row.orderPVZ) {
    return "Отправлен на сборку";
  }

  if (row.orderPVZ && !row.deliveredSC) {
    return "Товар сортируется";
  }

  if (row.orderPVZ && row.deliveredSC && !row.deliveredPVZ) {
    return "В пути на пункт выдачи";
  }

  if (row.deliveredPVZ && !row.issued) {
    return "Товар готов к получению";
  }

  if (row.issued) {
    return "Товар выдан";
  }
}

const pvzs = [
  {
    pvz: "ПВЗ_1",
    name: "ул. Антропова 16",
  },
  {
    pvz: "ПВЗ_2",
    name: "ул. Харитоново, 8",
  },
  {
    pvz: "ПВЗ_3",
    name: "ул. Палладина, 16",
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
  {
    pvz: "ПВЗ_8",
    name: "ул. Макара Мазая, 37А",
  },
  {
    pvz: "ППВЗ_9",
    name: "ул. 8 Марта, 77",
  },
  {
    pvz: "ПВЗ_10",
    name: "ул. Азовской Военной Флотилии, 2",
  },
  {
    pvz: "ПВЗ_11",
    name: "ул. Азовстальская, 131",
  },
  {
    pvz: "ППВЗ_12",
    name: "ул. Центральная, 43",
  },
  {
    pvz: "НаДом",
    name: "Домой",
  },
];

let isShowModal = ref(false);
let rowStatus = ref({} as IOurRansom | IClientRansom);

function showRowStatus(row: IOurRansom | IClientRansom) {
  rowStatus.value = row;
  isShowModal.value = true;
  emit("showModal", isShowModal.value);
}

function closeModal() {
  isShowModal.value = false;
  rowStatus.value = {} as IOurRansom | IClientRansom;
  emit("showModal", isShowModal.value);
}

function lockScroll() {
  document.body.classList.add("no-scroll");
}

function unlockScroll() {
  document.body.classList.remove("no-scroll");
}

watch(isShowModal, (newValue) => {
  if (newValue) {
    lockScroll();
  } else {
    unlockScroll();
  }
});

function openModalEmit() {
  isShowModal.value = props.isShowModalValue;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

watch([props.isShowModalValue], openModalEmit);

function add24Hours(createdAt: any) {
  const date = new Date(createdAt);

  date.setHours(date.getHours() + 24);

  return storeUsers.getNormalizedDate(date);
}

function add1Hours(createdAt: any) {
  const date = new Date(createdAt);

  date.setHours(date.getHours() + 1);

  return storeUsers.getNormalizedDate(date);
}

function addMinutes(date: any, minutes: any) {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + minutes);
  return storeUsers.getNormalizedDate(newDate);
}
</script>

<template>
  <h1
    v-if="isShowWarning"
    class="mt-3 font-bold text-xl max-sm:text-center text-red-500"
  >
    Некоторые товары скоро будут отправлены в возврат, рекомендуем забрать заказ
    в ближайшее время!
  </h1>
  <div
    :class="{ 'overflow-x-hidden max-h-[100px]': isShowModalValue }"
    class="relative"
    v-if="rows.length"
  >
    <table
      id="theTable"
      class="w-full border-[1px] border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs bg-[#36304a] text-white sticky top-0 z-30 uppercase text-center"
      >
        <tr class="h-[30px] max-sm:h-[50px]">
          <th scope="col" class="border-[1px]">номер</th>
          <th
            scope="col"
            class="border-[1px]"
            v-if="link?.startsWith('1') || link?.startsWith('2')"
          >
            ячейка
          </th>
          <th
            scope="col"
            class="border-[1px] px-2"
            v-if="link?.startsWith('3')"
          >
            имя
          </th>
          <th
            scope="col"
            class="border-[1px] px-2"
            v-if="link?.startsWith('3')"
          >
            название
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('1')">
            ссылка товара
          </th>
          <th
            scope="col"
            class="border-[1px] px-20 whitespace-nowrap"
            v-if="link?.startsWith('1')"
          >
            название товара
          </th>
          <th
            scope="col"
            class="border-[1px] px-2"
            v-if="link?.startsWith('2')"
          >
            маркетплейс
          </th>
          <th
            scope="col"
            class="border-[1px] whitespace-nowrap px-2"
            v-if="link?.startsWith('2')"
          >
            количество товаров
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('3')">
            сумма выкупа товара
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('3')">
            процент с клиента (%)
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('3')">
            сумма с клиента
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('2')">
            стоимость товаров
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('1')">
            стоимость товара
          </th>
          <th
            scope="col"
            class="border-[1px] px-2"
            v-if="
              (link?.startsWith('1') || link?.startsWith('2')) &&
              rows.some((row) => row.prepayment)
            "
          >
            предоплата
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('3')">
            отсортировано
          </th>
          <th scope="col" class="border-[1px]" v-if="link?.startsWith('3')">
            оплачено
          </th>
          <th class="border-[1px]">Статус доставки</th>
        </tr>
      </thead>
      <tbody>
        <tr
          :class="{ 'bg-red-500': isExpired(row) }"
          class="bg-white border-b text-center text-sm"
          v-for="(row, index) in rows"
          :key="index"
        >
          <td class="border-[1px]">
            {{ index + 1 }}
          </td>
          <td
            class="border-[1px] px-2"
            v-if="link?.startsWith('1') || link?.startsWith('2')"
          >
            {{ row.cell }}
          </td>
          <td class="px-2 border-[1px]" v-if="link?.startsWith('3')">
            {{ row.name }}
          </td>
          <td class="px-2 border-[1px]" v-if="link?.startsWith('3')">
            {{ row.nameOfAction }}
          </td>
          <td v-if="link?.startsWith('1')" class="border-[1px] py-2 pr-3 pl-1">
            <NuxtLink
              target="_blank"
              class="cursor-pointer hover:opacity-50 duration-200 bg-secondary-color text-white rounded-sm px-2 py-1 font-bold"
              :to="`${row.productLink}`"
            >
              Перейти
            </NuxtLink>
          </td>
          <td
            v-if="link?.startsWith('2')"
            class="border-[1px] whitespace-nowrap overflow-hidden max-w-[100px]"
          >
            {{ row.productLink }}
          </td>
          <td
            v-if="link?.startsWith('1') || link?.startsWith('2')"
            class="border-[1px] px-2 max-w-[220px]"
          >
            {{ row.productName }}
          </td>
          <td
            v-if="
              (row.amountFromClient1 ||
                row.amountFromClient1 === null ||
                row.amountFromClient1 === 0) &&
              !isDateGreaterThanReference(row.created_at)
            "
            class="border-[1px]"
          >
            {{ Math.ceil(row.amountFromClient1 / 10) * 10 }}
          </td>
          <td
            v-if="
              (row.amountFromClient1 ||
                row.amountFromClient1 === null ||
                row.amountFromClient1 === 0) &&
              isDateGreaterThanReference(row.created_at)
            "
            class="border-[1px]"
          >
            {{ roundToNearestTen(row.amountFromClient1) }}
          </td>
          <td
            v-if="
              row.amountFromClient2 ||
              row.amountFromClient2 === null ||
              row.amountFromClient2 === 0
            "
            class="border-[1px]"
          >
            {{ Math.ceil(row.amountFromClient2 / 10) * 10 }}
          </td>
          <td v-if="link?.startsWith('3')" class="border-[1px]">
            {{ row.purchaseOfGoods }}
          </td>
          <td v-if="link?.startsWith('3')" class="border-[1px]">
            {{ row.percentClient }}
          </td>
          <td
            v-if="
              row.amountFromClient3 ||
              row.amountFromClient3 === null ||
              row.amountFromClient3 === 0
            "
            class="border-[1px]"
          >
            {{ row.amountFromClient3 }}
          </td>
          <td
            v-if="
              (link?.startsWith('1') || link?.startsWith('2')) &&
              rows.some((row) => row.prepayment)
            "
            class="border-[1px]"
          >
            {{ row.prepayment ? row.prepayment : "" }}
          </td>
          <td class="border-[1px]" v-if="link?.startsWith('3')">
            <h1 class="font-bold text-green-500">
              {{ row.sorted ? storeUsers.getNormalizedDate(row.sorted) : "" }}
            </h1>
          </td>
          <td
            class="border-[1px]"
            v-if="link?.startsWith('1') || link?.startsWith('2')"
          >
            <span
              :class="{
                'text-secondary-color underline':
                  getStatus(row) !== 'Товар готов к получению' &&
                  getStatus(row) !== 'Товар выдан',
                'text-green-500 underline':
                  getStatus(row) === 'Товар готов к получению' ||
                  getStatus(row) === 'Товар выдан',
              }"
              class="text-[14px] font-semibold cursor-pointer hover:opacity-50 duration-200 whitespace-nowrap overflow-hidden px-3 max-w-[200px]"
              @click="showRowStatus(row)"
            >
              {{ getStatus(row) }}
            </span>
          </td>
          <td class="border-[1px]" v-if="link?.startsWith('3')">
            <h1 class="font-bold text-green-500">
              {{ row.paid ? storeUsers.getNormalizedDate(row.paid) : "" }}
            </h1>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <UModal
    :ui="{
      container: 'flex items-center justify-center text-center',
    }"
    v-model="isShowModal"
    prevent-close
  >
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold flex items-center gap-2 leading-6 text-gray-900 dark:text-white"
          >
            Статус доставки
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="closeModal"
          />
        </div>
      </template>

      <div
        class="space-y-3 flex items-center justify-center flex-col font-semibold"
      >
        <div
          v-if="rowStatus.issued"
          class="flex flex-col items-center gap-3 px-5 w-full"
        >
          <div
            :class="{ 'animate-pulse': rowStatus.issued }"
            class="flex items-center gap-5 text-green-500 bg-green-100 px-3 py-2 rounded-xl shadow-inner w-full"
          >
            <Icon
              name="i-line-md-circle-to-confirm-circle-transition"
              size="24"
            />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">Товар выдан</h1>
              <h1>
                {{ storeUsers.getNormalizedDate(rowStatus.issued) }}
              </h1>
            </div>
          </div>
        </div>
        <div
          v-if="rowStatus.deliveredPVZ && rowStatus.clientLink1"
          class="flex flex-col items-center gap-3 px-5 w-full"
        >
          <Icon
            name="i-material-symbols-arrow-warm-up-rounded"
            v-if="rowStatus.issued"
            size="30"
          />
          <div
            :class="{ 'animate-pulse': !rowStatus.issued }"
            class="flex items-center w-full gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner"
          >
            <Icon name="i-line-md-map-marker-multiple-alt" size="24" />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">Товар готов к получению</h1>
              <h1>
                {{ storeUsers.getNormalizedDate(rowStatus.deliveredPVZ) }}
              </h1>
            </div>
          </div>
        </div>
        <div
          v-if="rowStatus.deliveredPVZ && rowStatus.clientLink2"
          class="flex flex-col items-center gap-3 px-5 w-full"
        >
          <Icon
            name="i-material-symbols-arrow-warm-up-rounded"
            v-if="rowStatus.issued"
            size="30"
          />
          <div
            :class="{ 'animate-pulse': !rowStatus.issued }"
            class="flex items-center w-full gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner"
          >
            <Icon name="i-line-md-map-marker-multiple-alt" size="24" />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">Товар готов к получению</h1>
              <h1>
                {{ addMinutes(rowStatus.deliveredPVZ, 15) }}
              </h1>
            </div>
          </div>
        </div>
        <div
          v-if="
            rowStatus.orderPVZ &&
            rowStatus.deliveredSC &&
            !rowStatus.deliveredPVZ &&
            rowStatus.clientLink1
          "
          class="flex flex-col items-center gap-3 px-5 w-full"
        >
          <Icon
            name="i-material-symbols-arrow-warm-up-rounded"
            v-if="rowStatus.deliveredPVZ"
            size="30"
          />
          <div
            :class="{ 'animate-pulse': !rowStatus.deliveredPVZ }"
            class="flex items-center w-full gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner"
          >
            <Icon name="i-eos-icons-hourglass" size="24" />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">В пути на пункт выдачи</h1>
              <h1>{{ add1Hours(rowStatus.deliveredSC) }}</h1>
            </div>
          </div>
        </div>
        <div
          v-if="
            rowStatus.orderPVZ &&
            rowStatus.deliveredSC &&
            rowStatus.clientLink2 &&
            rowStatus.deliveredPVZ
          "
          class="flex flex-col items-center gap-3 px-5 w-full"
        >
          <Icon
            name="i-material-symbols-arrow-warm-up-rounded"
            v-if="rowStatus.deliveredPVZ"
            size="30"
          />
          <div
            :class="{ 'animate-pulse': !rowStatus.deliveredPVZ }"
            class="flex items-center w-full gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner"
          >
            <Icon name="i-eos-icons-hourglass" size="24" />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">В пути в пункт выдачи</h1>
              <h1>
                {{ storeUsers.getNormalizedDate(rowStatus.deliveredPVZ) }}
              </h1>
            </div>
          </div>
        </div>
        <div
          v-if="
            rowStatus.orderPVZ && rowStatus.deliveredSC && rowStatus.clientLink2
          "
          class="flex flex-col items-center gap-3 px-5 w-full"
        >
          <Icon
            v-if="rowStatus.deliveredPVZ"
            name="i-material-symbols-arrow-warm-up-rounded"
            size="30"
          />
          <div
            :class="{ 'animate-pulse': !rowStatus.deliveredPVZ }"
            class="flex items-center w-full gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner"
          >
            <Icon
              name="i-line-md-circle-to-confirm-circle-transition"
              size="24"
            />
            <div class="flex items-start flex-col text-sm">
              <h1>В пути в распределительный центр</h1>
              <h1>{{ add1Hours(rowStatus.deliveredSC) }}</h1>
            </div>
          </div>
        </div>
        <div
          v-if="rowStatus.orderPVZ && rowStatus.deliveredSC"
          class="flex flex-col items-center gap-3 px-5 w-full"
        >
          <Icon name="i-material-symbols-arrow-warm-up-rounded" size="30" />
          <div
            :class="{ 'animate-pulse': !rowStatus.deliveredPVZ }"
            class="flex items-center w-full gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner"
          >
            <Icon
              name="i-line-md-circle-to-confirm-circle-transition"
              size="24"
            />
            <div class="flex items-start flex-col text-sm">
              <h1 v-if="rowStatus.clientLink1">Прибыл в сортировочный центр</h1>
              <h1 v-if="rowStatus.clientLink2">
                Собран в сортировочном центре
              </h1>
              <h1>{{ storeUsers.getNormalizedDate(rowStatus.deliveredSC) }}</h1>
            </div>
          </div>
        </div>
        <div
          class="flex flex-col items-center gap-3 px-5 w-full"
          v-if="!rowStatus.deliveredSC"
        >
          <Icon
            name="i-material-symbols-arrow-warm-up-rounded"
            v-if="rowStatus.deliveredSC"
            size="30"
          />
          <div
            :class="{ 'animate-pulse': !rowStatus.deliveredSC }"
            class="flex items-center w-full gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner"
          >
            <Icon name="i-eos-icons-hourglass" size="24" />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">В пути в сортировочный центр</h1>
              <h1>{{ add24Hours(rowStatus.created_at) }}</h1>
            </div>
          </div>
        </div>
        <div
          v-if="rowStatus.orderPVZ && !rowStatus.deliveredSC"
          class="flex flex-col items-center gap-3 px-5 w-full"
        >
          <Icon
            name="i-material-symbols-arrow-warm-up-rounded"
            v-if="!rowStatus.deliveredSC"
            size="30"
          />
          <div
            :class="{ 'animate-pulse': !rowStatus.deliveredSC }"
            class="flex items-center w-full gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner"
          >
            <Icon name="i-svg-spinners-clock" size="24" />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">Отправлен на сборку</h1>
              <h1 v-if="rowStatus.clientLink1">
                {{ storeUsers.getNormalizedDate(rowStatus.updated_at) }}
              </h1>
              <h1 v-if="rowStatus.clientLink2">
                {{ addMinutes(rowStatus.updated_at, 10) }}
              </h1>
            </div>
          </div>
        </div>
        <div class="flex flex-col w-full items-center gap-3 px-5">
          <Icon
            v-if="
              (rowStatus.orderPVZ && !rowStatus.deliveredSC) ||
              (rowStatus.orderPVZ && rowStatus.deliveredSC)
            "
            name="i-material-symbols-arrow-warm-up-rounded"
            size="30"
          />
          <div
            :class="{ 'animate-pulse': !rowStatus.orderPVZ }"
            class="flex items-center w-full gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner"
          >
            <Icon name="i-line-md-uploading-loop" size="24" />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">Заказ создан</h1>
              <h1>{{ storeUsers.getNormalizedDate(rowStatus.created_at) }}</h1>
            </div>
          </div>
        </div>
        <div class="mx-auto">
          <UButton
            @click="closeModal"
            class="font-bold text-center mt-5"
            size="xl"
          >
            Понятно
          </UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
