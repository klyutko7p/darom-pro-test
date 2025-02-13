<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeCells = useCellsStore();
const router = useRouter();

let user = ref({} as User);
let cells = ref<Array<Cell>>([]);
const token = Cookies.get("token");
let isLoading = ref(false);
const storePVZ = usePVZStore();

const pvzs = ref<Array<PVZ>>([]);
onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  cells.value = await storeCells.getCells();
  pvzs.value = await storePVZ.getPVZ();
  filterRows();
  isLoading.value = false;
});

const fields = ["номер", "ПВЗ", "статус", "кем занято"];

definePageMeta({
  layout: false,
});

const quantity = ref(10);
const selectedPVZName = ref("");

async function createCells() {
  isLoading.value = true;
  await storeCells.createCells(selectedPVZName.value, quantity.value);
  cells.value = await storeCells.getCells();
  filterRows();
  isLoading.value = false;
}

const returnRows = ref<Array<Cell>>([]);

watch([selectedPVZName], filterRows);

function filterRows() {
  if (selectedPVZName.value) {
    returnRows.value = cells.value.filter(
      (row) => row.PVZ === selectedPVZName.value
    );
  } else {
    returnRows.value = cells.value;
  }
}
</script>

<template>
  <Head>
    <Title>Ячейки</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="table-admin-no-pad">
      <div
        v-if="!isLoading"
        class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5 w-screen"
      >
        <div class="px-5 mt-5 mb-10">
          <h1 class="mb-3 font-semibold">Создать ячейки</h1>
          <div>
            <h1>ПВЗ</h1>
            <USelectMenu
              :options="pvzs"
              value-attribute="name"
              option-attribute="name"
              placeholder="Выберите ПВЗ"
              class="max-w-[300px] my-3"
              v-model="selectedPVZName"
            />
          </div>

          <div>
            <h1>Количество ячеек</h1>
            <UInput
              v-model="quantity"
              placeholder="Введите количество ячеек (макс. 500)"
              class="max-w-[300px] my-3"
            />
          </div>

          <UButton
            :disabled="!quantity || !selectedPVZName"
            @click="createCells"
            >Создать</UButton
          >
        </div>
        <AdminDataTable3 :fields="fields" :rows="returnRows" />
      </div>

      <div class="w-screen" v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>
</template>
