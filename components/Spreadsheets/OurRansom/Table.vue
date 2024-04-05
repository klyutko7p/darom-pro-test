<script setup lang="ts">
import type { PropType } from "vue";

const router = useRouter();
const route = useRoute();
const storeRansom = useRansomStore();

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IOurRansom[]> },
  pvzLink: { type: String },
});

const showDeletedRows = ref(false);

const perPage = ref(100);
const currentPage = ref(1);
const totalRows = computed(() =>
  Math.ceil(props.rows?.filter((row) => row.deleted === null).length || 0)
);
let returnRows = ref<Array<IOurRansom>>();

function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;

  if (showDeletedRows.value) {
    returnRows.value = props.rows?.slice(startIndex, endIndex);
  } else {
    returnRows.value = props.rows
      ?.filter((row) => !row.deleted)
      .slice(startIndex, endIndex);
  }

  if (searchQuery.value !== "") {
    returnRows.value = props.rows?.filter(
      (row) => row.cell && row.cell.includes(searchQuery.value.trim())
    );
    if (returnRows.value?.length === 0) {
      returnRows.value = props.rows?.filter(
        (row) => row.fromName && row.fromName.includes(searchQuery.value.trim())
      );
    }
  }
}

watch([currentPage, totalRows, props.rows], updateCurrentPageData);

function updateRowsByFromName() {
  updateCurrentPageData();
  returnRows.value = (returnRows.value || [])
    .reduce((acc, element) => {
      const foundIndex = acc.findIndex(
        (i) => i.cell === element.cell && i.fromName === element.fromName
      );
      if (foundIndex === -1) {
        acc.push(element);
      }
      return acc;
    }, [])
    .sort((a, b) => +b.cell - +a.cell);
}

let searchQuery = ref("");
onMounted(async () => {
  updateCurrentPageData();
  updateRowsByFromName();
  await storeRansom.getSumOfRejection();
});

function formatPhoneNumber(phoneNumber: string) {
  if (!phoneNumber) {
    return "Номер телефона не указан";
  }

  const digitsOnly = phoneNumber.replace(/\D/g, "");

  if (digitsOnly.length < 11) {
    return "Неправильный формат номера телефона";
  }

  const maskedPhoneNumber =
    "+7" + "*".repeat(digitsOnly.length - 5) + digitsOnly.slice(-4);

  return maskedPhoneNumber;
}

function getCountOfItemsByPVZOurRansom(PVZ: string) {
  if (props.user.role !== "PVZ") {
    return props.rows?.filter(
      (row) =>
        row.dispatchPVZ === PVZ && row.deliveredPVZ === null && row.deleted === null
    ).length;
  } else if (props.user.role === "PVZ") {
    let today = new Date().toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    return props.rows?.filter(
      (row) =>
        row.dispatchPVZ === PVZ &&
        row.deliveredSC !== null &&
        (new Date(row.issued).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }) === today ||
          row.issued === null)
    ).length;
  }
}

function getCountOfItemsByPVZOurRansomIssued(PVZ: string) {
  return props.rows?.filter(
    (row) =>
      row.dispatchPVZ === PVZ &&
      row.deliveredSC !== null &&
      row.deliveredPVZ !== null &&
      row.issued === null &&
      row.deleted === null
  ).length;
}
</script>
<template>
  <div class="flex items-center justify-between max-lg:block mt-10">
    <div>
      <div class="flex items-center max-sm:flex-col max-sm:items-start gap-5 mb-1">
        <h1 class="text-xl" v-if="user.role !== 'PVZ'">
          Товаров в работе:
          <span class="text-secondary-color font-bold">
            {{
              getCountOfItemsByPVZOurRansom(pvzLink) +
              getCountOfItemsByPVZOurRansomIssued(pvzLink)
            }}
          </span>
        </h1>
        <h1 class="text-xl" v-if="user.role === 'PVZ'">
          Товаров к выдаче:
          <span class="text-secondary-color font-bold">{{ totalRows }}</span>
        </h1>
      </div>
      <div
        class="flex items-center gap-5"
        v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
      ></div>
    </div>
  </div>

  <div class="mt-2">
    <div class="flex flex-col gap-10 mb-5">
      <h1 class="text-2xl">Режим выдачи товаров ({{ pvzLink }})</h1>
    </div>
    <input
      type="text"
      v-model="searchQuery"
      class="block w-full bg-transparent mb-5 border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 rounded-2xl focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
      placeholder="Введите телефон или ячейку..."
      @input="updateRowsByFromName"
    />
    <div v-for="row in returnRows">
      <div
        @click="
          router.push(`/spreadsheets/our-ransom/${pvzLink}/${row.fromName}/${row.cell}`)
        "
        class="cursor-pointer hover:bg-hover-color duration-300 flex items-center justify-between p-10 mb-3 border-2"
      >
        <div
          class="rounded-full border-2 p-3 min-w-[50px] text-center border-secondary-color"
        >
          <h1>{{ row.cell }}</h1>
        </div>
        <div>
          <h1>Телефон: {{ formatPhoneNumber(row.fromName) }}</h1>
        </div>
      </div>
    </div>
  </div>
</template>
