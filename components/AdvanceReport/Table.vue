<script setup lang="ts">
import type { PropType } from "vue";
const storeUsers = useUsersStore();
import { read, utils, writeFile, write } from "xlsx";

const emit = defineEmits(["openModal", "updateDeliveryRow", "deleteRow"]);

function updateDeliveryRow(row: IAdvanceReport) {
  emit("updateDeliveryRow", { row: row });
}

function deleteRow(id: number) {
  emit("deleteRow", { id });
}

function openModal(row: IAdvanceReport) {
  emit("openModal", row);
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IAdvanceReport[]> },
});

const filteredRows = ref(props.rows);
const perPage = ref(100);
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.ceil((props.rows?.length || 0) / perPage.value)
);
const totalRows = computed(() => Math.ceil(props.rows?.length || 0));

onMounted(() => {
  updateCurrentPageData();
});

let returnRows = ref<Array<IAdvanceReport>>();

function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;

  returnRows.value = props.rows?.slice(startIndex, endIndex);
  filteredRows.value = returnRows.value;
}

watch([props.rows, totalRows, props.user], updateCurrentPageData);

function exportToExcel() {
  let table = document.querySelector("#theTable");
  let wb = utils.table_to_book(table);
  writeFile(wb, "авансовый_отчет.xlsx");
}

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
</script>
<template>
  <div
    class="flex items-end justify-between mt-5"
  >
    <div class="flex flex-col text-center" v-if="isVisiblePages">
      <h1 class="text-sm">Страница:</h1>
      <h1 class="text-sm mb-2">{{ currentPage }} из {{ totalPages }}</h1>
      <div class="flex items-center justify-center gap-2">
        <button
          @click="prevPage(), updateCurrentPageData()"
          :disabled="currentPage === 1"
          class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3"
        >
          <Icon
            name="material-symbols:arrow-back-ios-new-rounded"
            size="10"
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
            size="10"
            class="text-white"
          />
        </button>
      </div>
    </div>
    <UTooltip
      text="Скачать EXCEL"
      :shortcuts="['xlsx']"
      :popper="{ placement: 'right' }"
    >
      <div
        class="bg-secondary-color cursor-pointer border-2 border-secondary-color text-white hover:text-secondary-color hover:bg-transparent duration-200 px-2 pt-2 pb-1 rounded-full"
        @click="exportToExcel"
      >
        <Icon class="duration-200" size="32" name="bi:filetype-xlsx" />
      </div>
    </UTooltip>
  </div>

  <div
    class="relative max-h-[410px] bg-white overflow-y-auto mt-5 mb-10"
  >
    <table
      id="theTable"
      class="w-full bg-white border-gray-50 text-sm text-left rtl:text-right text-gray-500"
    >
      <thead
        class="text-xs bg-[#36304a] border-[1px] text-white sticky top-0 z-30 uppercase text-center"
      >
        <tr>
          <th
            scope="col"
            class="exclude-row px-3 border-[1px] h-[60px]"
            v-if="user.username === 'Директор'"
          >
            редакт.
          </th>
          <th scope="col" class="px-1 border-[1px]">Дата</th>
          <th scope="col" class="px-1 border-[1px]">ПВЗ</th>
          <th scope="col" class="px-1 border-[1px]">Сумма (₽)</th>
          <th scope="col" class="px-1 border-[1px]">Статья расхода</th>
          <th scope="col" class="px-1 border-[1px]">Комментарий</th>
          <th scope="col" class="px-1 border-[1px]">Компания</th>
          <th scope="col" class="px-1 border-[1px]">Создано</th>
          <th scope="col" class="px-1 border-[1px]">Получил</th>
          <th scope="col" class="px-1 border-[1px]">Документ</th>
          <th scope="col" class="px-1 border-[1px]">Получено</th>
          <th
            scope="col"
            class="px-1 border-[1px]"
            v-if="user.username === 'Директор'"
          >
            Тип
          </th>
          <th
            scope="col"
            class="px-1 border-[1px]"
            v-if="user.username === 'Директор'"
          >
            Дата создания
          </th>
          <th
            scope="col"
            class="px-1 border-[1px]"
            v-if="user.username === 'Директор'"
          >
            Удаление
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in filteredRows"
          class="text-center h-[50px] border-[1px]"
        >
          <td class="border-[1px]" v-if="user.username === 'Директор'">
            <div
              @click="openModal(row)"
              class="bg-green-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
            >
              <div
                @click="openModal(row)"
                class="bg-green-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
              >
                <Icon
                  class="text-green-500"
                  name="ic:baseline-mode-edit"
                  size="18"
                />
              </div>
            </div>
          </td>
          <th scope="row" class="border-[1px] px-2">
            {{ storeUsers.getNormalizedDateWithoutTime(row.date) }}
          </th>
          <th scope="row" class="border-[1px]">
            {{ row.PVZ ? row.PVZ : "—" }}
          </th>
          <td class="whitespace-nowrap">{{ row.expenditure }}</td>
          <td class="whitespace-nowrap px-2 border-[1px]">
            {{ row.typeOfExpenditure }}
          </td>
          <td class="px-2 border-[1px]">
            {{ row.notation ? row.notation : "—" }}
          </td>
          <td class="whitespace-nowrap px-2 border-[1px]">
            {{ row.company ? row.company : "—" }}
          </td>
          <td class="whitespace-nowrap px-2 border-[1px]">
            {{ row.createdUser }}
          </td>
          <td class="whitespace-nowrap border-[1px]">
            {{ row.issuedUser ? row.issuedUser : "—" }}
          </td>
          <td class="whitespace-nowrap border-[1px]">
            <a
              target="_blank"
              class="text-secondary-color hover:opacity-60 duration-200 font-bold"
              v-if="
                row.supportingDocuments && row.supportingDocuments.length > 2
              "
              :href="`https://fomoljxhkywsdgnchewy.supabase.co/storage/v1/object/public/image/img-${row.supportingDocuments}`"
            >
              Фото
            </a>
            <h1 v-else>—</h1>
          </td>
          <td class="whitespace-nowrap border-[1px]">
            <Icon
              @click="updateDeliveryRow(row)"
              v-if="
                (user.username === row.issuedUser && !row.received) ||
                (user.username === 'Директор' &&
                  row.issuedUser === 'Директор (С)' &&
                  !row.received)
              "
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle"
              size="32"
            />
            <h1 class="font-bold text-green-500">
              {{
                row.received ? storeUsers.getNormalizedDate(row.received) : ""
              }}
            </h1>
            <h1 v-if="!row.received && !row.issuedUser">—</h1>
          </td>
          <td
            class="whitespace-nowrap px-2 border-[1px]"
            v-if="user.username === 'Директор'"
          >
            {{ row.type }}
          </td>
          <td
            class="whitespace-nowrap px-2 border-[1px]"
            v-if="user.username === 'Директор'"
          >
            {{ storeUsers.getNormalizedDate(row.created_at) }}
          </td>
          <td
            class="whitespace-nowrap border-[1px]"
            v-if="user.username === 'Директор'"
          >
            <div
              @click="deleteRow(row.id)"
              class="bg-red-200 cursor-pointer hover:opacity-50 duration-200 rounded-full max-w-[28px] pt-1 mx-auto"
            >
              <Icon class="text-red-600" name="ic:round-delete" size="18" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
  /* Цвет для четных строк */
}
</style>
