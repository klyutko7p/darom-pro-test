<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();
const storeUsers = useUsersStore();
const storeAutos = useAutosStore();
const storePVZ = usePVZStore();
const router = useRouter();
const token = Cookies.get("token");

let isLoading = ref(false);
let user = ref({} as User);
let rows = ref<Array<DecommissionedAutoRow>>([]);
let allAutoTypes = ref<Array<AutoType>>([]);
let allStateAutos = ref<Array<string>>([]);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }
  user.value = await storeUsers.getUser();

  if (
    user.value.username !== "Директор" &&
    user.value.username !== "Косой" &&
    user.value.username !== "Власенкова"
  ) {
    router.push("/user/main");
  }

  isLoading.value = true;
  try {
    allStateAutos.value = storeAutos.getAllStateAutos();

    const [rowsData] = await Promise.all([storeAutos.getDecommissionedAutos()]);

    rows.value = rowsData;

    if (rows.value) {
      handleFilteredRows(rows.value);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    isLoading.value = false;
  }
});

definePageMeta({
  layout: false,
  name: "Списанное оборудование АвтоСклад",
});

async function deleteRow(id: number) {
  let answer = confirm(`Вы точно хотите удалить данную запись?`);
  if (answer) {
    isLoading.value = true;
    await storeAutos.deleteDecommissionedAuto(id);
    rows.value = await storeAutos.getDecommissionedAutos();
    isLoading.value = false;
  }
}

const filteredRows = ref<Array<DecommissionedAutoRow>>([]);
function handleFilteredRows(filteredRowsData: DecommissionedAutoRow[]) {
  filteredRows.value = filteredRowsData;
}
</script>

<template>
  <Head>
    <Title>Списанное оборудование АвтоСклад</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5">
          <div class="flex items-center justify-end">
            <NuxtLink
              to="/auto-storage"
              class="bg-orange-500 text-sm pt-1.5 pb-0.5 px-2 text-white rounded-full text-secondary-color font-semibold hover:opacity-50 duration-200"
            >
              <Icon size="24" name="lsicon:equipment-outline" />
            </NuxtLink>
          </div>
          <div>
            <AutoDecommissionedFilters
              v-if="rows"
              @filtered-rows="handleFilteredRows"
              :rows="rows"
              :user="user"
            />

            <AutoDecommissionedTable
              @deleteRow="deleteRow"
              :user="user"
              :rows="filteredRows"
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
