<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storeSortingCentersDelivery = useSortingCentersDeliveryStore();
const router = useRouter();

const fields = ["название СЦ", "адрес", "изменение", "удаление"];

let sortingCenters = ref<Array<SortingCenter>>();
let sortingCentersData = ref({} as SortingCenter);

async function createSortingCenter(obj: any) {
  isLoading.value = true;
  await storeSortingCentersDelivery.createSortingCenter(obj.name, obj.address);
  sortingCenters.value = await storeSortingCentersDelivery.getSortingCenters();
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
  await storeSortingCentersDelivery.updateSortingCenters(sortingCentersData.value);
  sortingCenters.value = await storeSortingCentersDelivery.getSortingCenters();
  closeModal();
  isLoading.value = false;
}

async function deleteSortingCenter(id: number) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данный Сортировочный Центр?");
  if (answer) await storeSortingCentersDelivery.deleteSortingCenter(id);
  sortingCenters.value = await storeSortingCentersDelivery.getSortingCenters();
  isLoading.value = false;
}

let user = ref({} as User);
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  sortingCenters.value = await storeSortingCentersDelivery.getSortingCenters();
  isLoading.value = false;
});

definePageMeta({
  layout: false,
});


function lockScroll() {
  document.body.classList.add("no-scroll");
}

function unlockScroll() {
  document.body.classList.remove("no-scroll");
}

watch(isOpen, (newValue) => {
  if (newValue) {
    lockScroll();
  } else {
    unlockScroll();
  }
});
</script>

<template>
  <Head>
    <Title>Сортировочные центры</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading">
        <AdminDataTable2
          :fields="fields"
          :rows="sortingCenters"
          @delete-row="deleteSortingCenter"
          @open-modal="openModal"
        />

        <AdminDataCreate2 :title="'Сортировочный Центр'" @create-data="createSortingCenter" />

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="tabler:home-signal" />
          </template>
          <template v-slot:header>
            <div class="custom-header">
              <h1>Изменение:  {{ sortingCentersData.name }}</h1>
            </div>
          </template>
          <template v-slot:body>
            <div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Название СЦ</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                  v-model="sortingCentersData.name"
                  type="text"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Адрес СЦ</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                  v-model="sortingCentersData.address"
                  type="text"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex gap-3 items-center justify-center">
              <UISaveModalButton @click="updateSortingCenters">СОХРАНИТЬ</UISaveModalButton>
              <UIExitModalButton @click="closeModal">ЗАКРЫТЬ</UIExitModalButton>
            </div>
          </template>
        </UINewModalEdit>
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
