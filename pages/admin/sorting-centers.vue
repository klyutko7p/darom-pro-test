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

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  sortingCenters.value = await storeSortingCenters.getSortingCenters();
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
    <NuxtLayout name="table-admin-no-pad">
      <div
        v-if="!isLoading"
        class="bg-[#f8f9fd] px-5 pt-5 max-sm:px-1 pb-5 w-screen"
      >
        <AdminDataTable
          :fields="fields"
          :rows="sortingCenters"
          @delete-row="deleteSortingCenter"
          @open-modal="openModal"
        />

        <AdminDataCreate
          :title="'Сортировочный Центр'"
          @create-data="createSortingCenter"
        />

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="tabler:home-signal" />
          </template>
          <template v-slot:header>
            <div class="custom-header">
              <h1>Изменение: {{ sortingCentersData.name }}</h1>
            </div>
          </template>
          <template v-slot:body>
            <div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Название СЦ</label>
                <UInput
                  class="w-full"
                  v-model="sortingCentersData.name"
                  type="text"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex gap-3 items-center justify-center">
              <UISaveModalButton @click="updateSortingCenters"
                >СОХРАНИТЬ</UISaveModalButton
              >
              <UIExitModalButton @click="closeModal">ЗАКРЫТЬ</UIExitModalButton>
            </div>
          </template>
        </UINewModalEdit>
      </div>

      <div class="w-screen" v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>

  <div v-else-if="user.role === 'USER'">
    <NuxtLayout name="user">
      <h1>
        У вас недостаточно прав на просмотр этой информации. Обратитесь к
        администратору
      </h1>
    </NuxtLayout>
  </div>
</template>
