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
  marketplaceData.value = {} as OrderAccount;
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

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  marketplaces.value = await storeMarketplaces.getMarketplaces();
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

        <UIModal v-show="isOpen" @close-modal="closeModal">
          <template v-slot:header>
            <div class="custom-header">
              Изменение Маркетплейса - <b> {{ marketplaceData.name }}</b>
            </div>
          </template>
          <div class="text-black">
            <div class="grid grid-cols-2 mb-5">
              <label for="name">Название Маркетплейса</label>
              <input
                class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                v-model="marketplaceData.name"
                type="text"
              />
            </div>
          </div>
          <div class="flex items-center justify-center gap-3 mt-10">
            <UIMainButton @click="updateMarketplace">Сохранить</UIMainButton>
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
