<script setup lang="ts">
import Cookies from "js-cookie";
import { usePVZStore } from '../../stores/pvz';

const storeUsers = useUsersStore();
const storePVZ = usePVZStore();
const router = useRouter();

const fields = ["название пвз", "изменение", "удаление"];

let pvz = ref<Array<PVZ>>();
let pvzData = ref({} as PVZ);

async function createPVZ(name: string) {
  isLoading.value = true;
  await storePVZ.createPVZ(name);
  pvz.value = await storePVZ.getPVZ();
  isLoading.value = false;
}

let isOpen = ref(false);
function openModal(row: PVZ) {
  isOpen.value = true;
  pvzData.value = JSON.parse(JSON.stringify(row));
}

function closeModal() {
  isOpen.value = false;
  pvzData.value = {} as PVZ;
}

async function updatePVZ() {
  isLoading.value = true;
  await storePVZ.updatePVZ(pvzData.value);
  pvz.value = await storePVZ.getPVZ();
  closeModal();
  isLoading.value = false;
}

async function deletePVZ(id: number) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данное ПВЗ?");
  if (answer) await storePVZ.deletePVZ(id);
  pvz.value = await storePVZ.getPVZ();
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
  pvz.value = await storePVZ.getPVZ();
  isLoading.value = false;
});


definePageMeta({
  layout: false,
});
</script>

<template>
  <Head>
    <Title>ПВЗ</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading">
        <AdminDataTable
          :fields="fields"
          :rows="pvz"
          @delete-row="deletePVZ"
          @open-modal="openModal"
        />

        <AdminDataCreate :title="'ПВЗ'" @create-data="createPVZ" />

        <UIModal v-show="isOpen" @close-modal="closeModal">
          <template v-slot:header>
            <div class="custom-header">
              Изменение ПВЗ - <b> {{ pvzData.name }}</b>
            </div>
          </template>
          <div class="text-black">
            <div class="grid grid-cols-2 mb-5">
              <label for="name">Название ПВЗ</label>
              <input
                class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                v-model="pvzData.name"
                type="text"
              />
            </div>
          </div>
          <div class="flex items-center justify-center gap-3 mt-10">
            <UIMainButton @click="updatePVZ">Сохранить</UIMainButton>
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
