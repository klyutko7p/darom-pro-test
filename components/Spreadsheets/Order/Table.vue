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
    return "Товар обрабатывается";
  }

  if (row.orderPVZ && !row.deliveredSC) {
    return "Товар сортируется";
  }

  if (row.orderPVZ && row.deliveredSC && !row.deliveredPVZ) {
    return "Товар в пути";
  }

  if (row.deliveredPVZ && !row.issued) {
    return "Товар доставлен на ПВЗ";
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
                  getStatus(row) !== 'Товар доставлен на ПВЗ' &&
                  getStatus(row) !== 'Товар выдан',
                'text-green-500 underline':
                  getStatus(row) === 'Товар доставлен на ПВЗ' ||
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

  <UINewModalClient v-show="isShowModal" @close-modal="closeModal">
    <template v-slot:header>
      <div class="custom-header mr-10">
        <h1 class="text-base">Статус доставки</h1>
      </div>
    </template>
    <template v-slot:body>
      <div
        class="space-y-3 flex items-center justify-center flex-col font-semibold"
      >
        <div v-if="rowStatus.issued" class="flex flex-col items-center gap-3">
          <div
            :class="{ 'animate-pulse': rowStatus.issued }"
            class="flex items-center max-sm:w-full max-sm:min-w-[230px] gap-5 text-green-500 bg-green-100 px-3 py-2 rounded-xl shadow-inner w-[240px]"
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
          v-if="rowStatus.deliveredPVZ"
          class="flex flex-col items-center gap-3"
        >
          <Icon
            name="i-material-symbols-arrow-warm-up-rounded"
            v-if="rowStatus.issued"
            size="30"
          />
          <div
            :class="{ 'animate-pulse': !rowStatus.issued }"
            class="flex items-center max-sm:w-full max-sm:min-w-[230px] gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner w-[240px]"
          >
            <Icon name="i-line-md-map-marker-multiple-alt" size="24" />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">Товар доставлен на ПВЗ</h1>
              <h1>
                {{ storeUsers.getNormalizedDate(rowStatus.deliveredPVZ) }}
              </h1>
            </div>
          </div>
        </div>
        <div
          v-if="rowStatus.orderPVZ && rowStatus.deliveredSC"
          class="flex flex-col items-center gap-3"
        >
          <Icon
            name="i-material-symbols-arrow-warm-up-rounded"
            v-if="rowStatus.deliveredPVZ"
            size="30"
          />
          <div
            :class="{ 'animate-pulse': !rowStatus.deliveredPVZ }"
            class="flex items-center max-sm:w-full max-sm:min-w-[230px] gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner w-[240px]"
          >
            <Icon name="i-eos-icons-hourglass" size="24" />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">Товар в пути</h1>
              <h1>{{ storeUsers.getNormalizedDate(rowStatus.deliveredSC) }}</h1>
            </div>
          </div>
        </div>
        <div
          v-if="rowStatus.orderPVZ && !rowStatus.deliveredSC"
          class="flex flex-col items-center gap-3"
        >
          <div
            :class="{ 'animate-pulse': !rowStatus.deliveredSC }"
            class="flex items-center max-sm:w-full max-sm:min-w-[230px] gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner w-[240px]"
          >
            <Icon name="i-svg-spinners-clock" size="24" />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">Товар сортируется</h1>
              <h1>{{ storeUsers.getNormalizedDate(rowStatus.updated_at) }}</h1>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center gap-3">
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
            class="flex items-center max-sm:w-full max-sm:min-w-[230px] gap-5 text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shadow-inner w-[240px]"
          >
            <Icon name="i-line-md-uploading-loop" size="24" />
            <div class="flex items-start flex-col text-sm">
              <h1 class="">Заказ создан</h1>
              <h1>{{ storeUsers.getNormalizedDate(rowStatus.created_at) }}</h1>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div class="mx-auto">
        <UButton @click="closeModal" class="font-bold text-center" size="xl"
          >Понятно</UButton
        >
      </div>
    </template>
  </UINewModalClient>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
