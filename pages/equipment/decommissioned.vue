<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();
const storeUsers = useUsersStore();
const storeEquipments = useEquipmentsStore();
const storePVZ = usePVZStore();
const router = useRouter();
const token = Cookies.get("token");

let isLoading = ref(false);
let user = ref({} as User);
let rows = ref<Array<IDecommissionedEquipmentRow>>([]);
let allPVZ = ref<Array<PVZ>>([]);
let allStateEquipments = ref<Array<string>>([]);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }
  user.value = await storeUsers.getUser();

  if (
    user.value.username !== "Директор" &&
    user.value.username !== "Власенкова"
  ) {
    router.push("/user/main");
  }

  isLoading.value = true;
  try {
    allStateEquipments.value = storeEquipments.getAllStateEquipments();

    const [rowsData, allPVZData] = await Promise.all([
      storeEquipments.getDecommissionedEquipments(),
      storePVZ.getAllPVZ(),
    ]);

    rows.value = rowsData;

    if (rows.value) {
      handleFilteredRows(rows.value);
    }

    allPVZ.value = allPVZData;
    if (!allPVZ.value.some((pvz) => pvz.id === 111111)) {
      allPVZ.value.unshift({ id: 111111, name: "Все ПВЗ" });
    }
    allPVZ.value = allPVZ.value.filter((pvz) => pvz.name !== "НаДом");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    isLoading.value = false;
  }
});

definePageMeta({
  layout: false,
  name: "Списанное оборудование ПВЗ",
});

async function deleteRow(id: number) {
  let answer = confirm(`Вы точно хотите удалить данную запись?`);
  if (answer) {
    isLoading.value = true;
    await storeEquipments.deleteDecommissionedEquipment(id);
    rows.value = await storeEquipments.getDecommissionedEquipments();
    isLoading.value = false;
  }
}

const filteredRows = ref<Array<IDecommissionedEquipmentRow>>([]);
function handleFilteredRows(filteredRowsData: IDecommissionedEquipmentRow[]) {
  filteredRows.value = filteredRowsData;
}
</script>

<template>
  <Head>
    <Title>Списанное оборудование ПВЗ</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5">
          <div class="flex items-center justify-end">
            <NuxtLink
              to="/equipment"
              class="bg-orange-500 text-sm pt-1.5 pb-0.5 px-2 text-white rounded-full text-secondary-color font-semibold hover:opacity-50 duration-200"
            >
              <Icon size="24" name="lsicon:equipment-outline" />
            </NuxtLink>
          </div>
          <div>
            <EquipmentDecommissionedFilters
              v-if="rows"
              @filtered-rows="handleFilteredRows"
              :rows="rows"
              :user="user"
            />

            <EquipmentDecommissionedTable
              @deleteRow="deleteRow"
              :user="user"
              :rows="filteredRows"
              :allPVZ="allPVZ"
            />
          </div>
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div class="mt-3"></div>
      </NuxtLayout>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
