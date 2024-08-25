<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storeMarketplaces = useMarketplacesStore();
const router = useRouter();

const fields = ["название маркетплейса", "изменение", "удаление"];

let marketplaces = ref<Array<Marketplace>>();
let marketplaceData = ref({} as Marketplace);

async function createMarketplace(name: string) {
  isLoading.value = true;
  await storeMarketplaces.createMarketPlace(name);
  marketplaces.value = await storeMarketplaces.getMarketplaces();
  isLoading.value = false;
}

let isOpen = ref(false);
function openModal(row: Marketplace) {
  isOpen.value = true;
  marketplaceData.value = JSON.parse(JSON.stringify(row));
}

function closeModal() {
  isOpen.value = false;
  marketplaceData.value = {} as Marketplace;
}

async function updateMarketplace() {
  isLoading.value = true;
  await storeMarketplaces.updateMarketplace(marketplaceData.value);
  marketplaces.value = await storeMarketplaces.getMarketplaces();
  closeModal();
  isLoading.value = false;
}

async function deleteMarketplace(id: number) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данный Сортировочный Центр?");
  if (answer) await storeMarketplaces.deleteMarketplace(id);
  marketplaces.value = await storeMarketplaces.getMarketplaces();
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
  marketplaces.value = await storeMarketplaces.getMarketplaces();
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
    <Title>Маркетплейсы</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading">
        <AdminDataTable
          :fields="fields"
          :rows="marketplaces"
          @delete-row="deleteMarketplace"
          @open-modal="openModal"
        />

        <AdminDataCreate :title="'Маркетплейс'" @create-data="createMarketplace" />

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="fluent:building-retail-money-24-regular" />
          </template>
          <template v-slot:header>
            <div class="custom-header">
              <h1>Изменение:  {{ marketplaceData.name }}</h1>
            </div>
          </template>
          <template v-slot:body>
            <div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Название маркетплейса</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                  v-model="marketplaceData.name"
                  type="text"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex gap-3 items-center justify-center">
              <UISaveModalButton @click="updateMarketplace">СОХРАНИТЬ</UISaveModalButton>
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
