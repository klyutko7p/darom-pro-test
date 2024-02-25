<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storeSortingCenters = useSortingCentersStore();
const router = useRouter();

const fields = ["название СЦ", "изменение", "удаление"];

let sortingCenters = ref<Array<SortingCenter>>();
let sortingCentersData = ref({} as SortingCenter);

async function createSortingCenter(name: string) {
  isLoading.value = true;
  await storeSortingCenters.createSortingCenter(name);
  sortingCenters.value = await storeSortingCenters.getSortingCenters();
  isLoading.value = false;
}

let isOpen = ref(false);
function openModal(row: SortingCenter) {
  isOpen.value = true;
  sortingCentersData.value = JSON.parse(JSON.stringify(row));
}

function closeModal() {
  isOpen.value = false;
  sortingCentersData.value = {} as SortingCenter;
}

async function updateSortingCenters() {
  isLoading.value = true;
  await storeSortingCenters.updateSortingCenters(sortingCentersData.value);
  sortingCenters.value = await storeSortingCenters.getSortingCenters();
  closeModal();
  isLoading.value = false;
}

async function deleteSortingCenter(id: number) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данный Сортировочный Центр?");
  if (answer) await storeSortingCenters.deleteSortingCenter(id);
  sortingCenters.value = await storeSortingCenters.getSortingCenters();
  isLoading.value = false;
}

let user = ref({} as User);
const token = Cookies.get("token");
let isLoading = ref(false);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  sortingCenters.value = await storeSortingCenters.getSortingCenters();
  isLoading.value = false;
});

onMounted(() => {
  if (!token) {
    router.push("/auth/login");
  }
});

definePageMeta({
  layout: false,
});
</script>

<template>
  <Head>
    <Title>Сортировочные центры</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading">
        <AdminDataTable
          :fields="fields"
          :rows="sortingCenters"
          @delete-row="deleteSortingCenter"
          @open-modal="openModal"
        />

        <AdminDataCreate :title="'Сортировочный Центр'" @create-data="createSortingCenter" />

        <UIModal v-show="isOpen" @close-modal="closeModal">
          <template v-slot:header>
            <div class="custom-header">
              Изменение СЦ - <b> {{ sortingCentersData.name }}</b>
            </div>
          </template>
          <div class="text-black">
            <div class="grid grid-cols-2 mb-5">
              <label for="name">Название СЦ</label>
              <input
                class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                v-model="sortingCentersData.name"
                type="text"
              />
            </div>
          </div>
          <div class="flex items-center justify-center gap-3 mt-10">
            <UIMainButton @click="updateSortingCenters">Сохранить</UIMainButton>
            <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
          </div>
        </UIModal>
      </div>

      <div v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>

  <div v-else-if="user.role === 'USER'">
    <NuxtLayout name="user">
      <h1>
        У вас недостаточно прав на просмотр этой информации. Обратитесь к администратору
      </h1>
    </NuxtLayout>
  </div>
</template>
