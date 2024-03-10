<script setup lang="ts">
import type { PhoneNumber } from "@prisma/client";
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storePhoneNumbers = usePhoneNumbersStore();
const router = useRouter();

let user = ref({} as User);
let phoneNumbers = ref<Array<IPhoneNumber>>();
const token = Cookies.get("token");
let isLoading = ref(false);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  phoneNumbers.value = await storePhoneNumbers.getPhoneNumbers();
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

let rowData = ref({} as PhoneNumber);

async function createRow() {
  isLoading.value = true;
  await storePhoneNumbers.createPhoneNumber(rowData.value);
  phoneNumbers.value = await storePhoneNumbers.getPhoneNumbers();
  closeModal();
  isLoading.value = false;
}

let isOpen = ref(false);
function openModal(row: IPhoneNumber) {
  isOpen.value = true;
  rowData.value = JSON.parse(JSON.stringify(row));
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IPhoneNumber;
}

async function updateRow() {
  isLoading.value = true;
  await storePhoneNumbers.updatePhoneNumbers(rowData.value);
  phoneNumbers.value = await storePhoneNumbers.getPhoneNumbers();
  closeModal();
  isLoading.value = false;
}
</script>

<template>
  <Head>
    <Title>Ячейки</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading" class="mt-10">
        <UIMainButton @click="openModal">
          Привязка телефона к адресу
        </UIMainButton>
        <PhoneNumberTable
          :rows="phoneNumbers"
          :user="user"
          @open-modal="openModal"
        />

        <UIModal v-show="isOpen" @close-modal="closeModal">
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение строки с ID - <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else>Создание новой привязки</div>
          </template>
          <div class="text-black">
            <div class="grid grid-cols-2 mb-5">
              <label for="name">Телефон</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.number"
                type="text"
              />
            </div>
            <div class="grid grid-cols-2 mb-5">
              <label for="name">Адрес</label>
              <input
                class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                v-model="rowData.address"
                type="text"
              />
            </div>
          </div>

          <div
            class="flex items-center justify-center gap-3 mt-10"
            v-if="rowData.id"
          >
            <UIMainButton @click="updateRow">Сохранить</UIMainButton>
            <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
          </div>
          <div class="flex items-center justify-center gap-3 mt-10" v-else>
            <UIMainButton @click="createRow">Создать</UIMainButton>
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
        У вас недостаточно прав на просмотр этой информации. Обратитесь к
        администратору
      </h1>
    </NuxtLayout>
  </div>
</template>
