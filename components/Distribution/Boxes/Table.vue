<script setup lang="ts">
import { read, utils, writeFile, write } from "xlsx";
import { createClient } from "@supabase/supabase-js";
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();

const router = useRouter();
const route = useRoute();

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storeQR = useQRStore();
const storeBalance = useBalanceStore();

const emit = defineEmits(["deleteRow", "deleteSelectedRows"]);

function deleteRow(id: number) {
  emit("deleteRow", id);
}

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  boxes: { type: Array as PropType<Box[]>, required: true },
});

const checkedRows: Ref<number[]> = ref([]);

const isChecked = (rowId: number): boolean => {
  return checkedRows.value.includes(rowId);
};

let returnRows = ref<Array<Box>>([]);

const totalRows = computed(() => Math.ceil(props.boxes?.length || 0));

// async function updateCurrentPageData() {
//   isLoading.value = true;
//   let ourRansomRows = await storeRansom.getRansomRowsByIds(props.idRows);
//   ourRansomRows.filter(
//     (row: any) => row.dispatchPVZ === props.selectedPVZ.name
//   );
//   returnRows.value = ourRansomRows;
//   isLoading.value = false;
// }

// watch([totalRows, props.idRows, returnRows.value], updateCurrentPageData);

onMounted(async () => {
  isLoading.value = true;
  returnRows.value = props.boxes;

  if (
    props.user.username !== "Директор" &&
    props.user.username !== "Власенкова" &&
    props.user.username !== "Горцуева"
  ) {
    columns.splice(0, 1);
  }

  if (props.user.role === "COURIER") {
    columns = columns.filter(
      (column) =>
        column.key !== "idRows" &&
        column.key !== "createdUser" &&
        column.key !== "created_at"
    );
  }

  if (props.user.role !== "COURIER") {
    unShowDeliveredBoxes();
  }
  // await updateCurrentPageData();
  isLoading.value = false;
});

let isLoading = ref(false);

const itemsTable = (row: IOurRansom) => [
  [
    {
      label: "Удалить",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteRow(row.id),
    },
  ],
];

const dropdownStates = ref({} as any);

const toggleDropdown = (rowId: any) => {
  dropdownStates.value = {};

  dropdownStates.value[rowId] = !dropdownStates.value[rowId];
};

let columns = [
  {
    key: "actions",
  },
  {
    key: "id",
    label: "ID",
    sortable: true,
  },
  {
    key: "idRows",
    label: "Количество товаров (шт.)",
    sortable: true,
  },
  {
    key: "type",
    label: "Тип",
    sortable: true,
  },
  {
    key: "status",
    label: "Статус",
  },
  {
    key: "dispatchPVZ",
    label: "ПВЗ",
    sortable: true,
  },
  {
    key: "createdUser",
    label: "Создал",
    sortable: true,
  },
  {
    key: "created_at",
    label: "Дата создания",
    sortable: true,
  },
];

const isShowDelivered = ref(false);

function showDeliveredBoxes() {
  isShowDelivered.value = true;
  returnRows.value = props.boxes;
}

function unShowDeliveredBoxes() {
  isShowDelivered.value = false;
  returnRows.value = props.boxes.filter((box) => !box.sorted);
}
</script>

<template>
  <div v-if="!isLoading">
    <div class="mt-5 mb-10">
      <div class="flex items-center gap-3 max-sm:flex-col max-sm:items-start">
        <h1 class="text-base">
          Количество:
          <span class="text-secondary-color font-semibold"
            >{{ returnRows.length }} шт.</span
          >
        </h1>
        <UButton
          v-if="!isShowDelivered"
          @click="showDeliveredBoxes"
          icon="i-zondicons-view-show"
          class="font-semibold"
          >Показать «На курьере»/Доставленные</UButton
        >
        <UButton
          v-if="isShowDelivered"
          @click="unShowDeliveredBoxes"
          icon="i-bx-bxs-hide"
          class="font-semibold"
          >Скрыть «На курьере»/Доставленные</UButton
        >
      </div>

      <UTable
        class="w-full z-[20] mx-auto text-center rounded-md mt-5"
        :ui="{ wrapper: 'relative bg-white',
  td: {
    base: 'border-[1px] text-center whitespace-normal',
    padding: 'px-3 py-1',
  },
  th: {
    base: 'text-center uppercase border-[1px] sticky top-0 z-[20] bg-white',
    padding: 'px-1',
    size: 'text-xs'
  },
  default:
  {
    checkbox:
      { color: 'gray' as any }
  },
    }"
        :rows="returnRows"
        :columns="columns"
      >
        <template #id-data="{ row }">
          <NuxtLink
            v-if="user.PVZ.includes(row.dispatchPVZ) && user.role !== 'COURIER'"
            class="cursor-pointer text-secondary-color hover:opacity-50 duration-200 font-semibold"
            :to="`/box/${row.dispatchPVZ.split('_')[1]}/${row.id}`"
          >
            {{ row.id }}
          </NuxtLink>
          <h1 v-else>{{ row.id }}</h1>
        </template>

        <template #idRows-data="{ row }">
          <p>
            {{ row.idRows.length }}
          </p>
        </template>

        <template #type-data="{ row }">
          <p>
            {{ row.type === "standard" ? "Стандарт" : "КГТ" }}
          </p>
        </template>

        <template #status-data="{ row }">
          <UBadge
            v-if="!row.sorted && !row.delivered"
            size="xs"
            label="На сортировщице"
            color="yellow"
            variant="subtle"
            class="w-[115px]"
          />
          <UBadge
            v-if="row.sorted && !row.delivered"
            size="xs"
            label="На курьере"
            color="yellow"
            variant="subtle"
          />
          <UBadge
            v-if="row.sorted && row.delivered"
            size="xs"
            label="Доставлен"
            color="emerald"
            variant="subtle"
          />
        </template>

        <template #dispatchPVZ-data="{ row }">
          <p>
            {{ row.dispatchPVZ }}
          </p>
        </template>

        <template #createdUser-data="{ row }">
          <p>
            {{ row.createdUser }}
          </p>
        </template>

        <template #created_at-data="{ row }">
          <p>
            {{ storeUsers.getNormalizedDate(row.created_at) }}
          </p>
        </template>

        <template
          v-if="
            user.username === 'Директор' ||
            user.username === 'Власенкова' ||
            user.username === 'Горцуева'
          "
          #actions-data="{ row }"
        >
          <UDropdown :open="dropdownStates[row.id]" :items="itemsTable(row)">
            <UButton
              variant="ghost"
              color="gray"
              class="text-sm duration-200"
              @touchstart.stop="toggleDropdown(row.id)"
            >
              ...
            </UButton>
          </UDropdown>
        </template>

        <template v-if="user.role !== 'COURIER'" #expand="{ row }">
          <div>
            <DistributionTableForBox :user="user" :idRows="row.idRows" />
          </div>
        </template>
      </UTable>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinnerModal />
      <h1 class="text-center italic">Идёт загрузка данных...</h1>
    </NuxtLayout>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}

.path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 0;
  &.circle {
    -webkit-animation: dash 1.8s ease-in-out; /* Увеличено до 1.8s */
    animation: dash 1.8s ease-in-out; /* Увеличено до 1.8s */
  }
  &.line {
    stroke-dashoffset: 1000;
    -webkit-animation: dash 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
    animation: dash 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
  }
  &.check {
    stroke-dashoffset: -100;
    -webkit-animation: dash-check 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
    animation: dash-check 1.8s 0.35s ease-in-out forwards; /* Увеличено до 1.8s */
  }
}

@-webkit-keyframes dash {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@-webkit-keyframes dash-check {
  0% {
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dashoffset: 900;
  }
}

@keyframes dash-check {
  0% {
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dashoffset: 900;
  }
}
</style>
