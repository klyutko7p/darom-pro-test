<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast();
const storeUsers = useUsersStore();
const storePhoneNumbers = usePhoneNumbersStore();
const router = useRouter();

let user = ref({} as User);
let phoneNumbers = ref<Array<IPhoneNumber>>();
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  phoneNumbers.value = await storePhoneNumbers.getPhoneNumbers();
  isLoading.value = false;
});

definePageMeta({
  layout: false,
});

let rowData = ref({} as IPhoneNumber);

async function createRow() {
  isLoading.value = true;
  if (phoneNumbers.value?.some((row) => row.number === rowData.value.number)) {
    toast.error("Телефон уже создан!");
  } else {
    await storePhoneNumbers.createPhoneNumber(rowData.value);
    phoneNumbers.value = await storePhoneNumbers.getPhoneNumbers();
    closeModal();
  }
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
    <Title>Ячейки</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="admin">
      <div v-if="!isLoading" class="mt-10">
        <UIMainButton @click="openModal"> Привязка телефона к адресу </UIMainButton>
        <PhoneNumberTable :rows="phoneNumbers" :user="user" @open-modal="openModal" />

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="tabler:home-signal" />
          </template>
          <template v-slot:header>
            <div class="custom-header" v-if="rowData.id">
              Изменение: <b> {{ rowData.id }}</b>
            </div>
            <div class="custom-header" v-else>Создание новой привязки</div>
          </template>
          <template v-slot:body>
            <div class="text-black">
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Телефон</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.number"
                  type="text"
                />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Адрес</label>
                <input
                  class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.address"
                  type="text"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex items-center justify-center gap-3" v-if="rowData.id">
              <UISaveModalButton @click="updateRow">Сохранить</UISaveModalButton>
              <UIExitModalButton @click="closeModal">Отменить </UIExitModalButton>
            </div>
            <div class="flex items-center justify-center gap-3" v-else>
              <UISaveModalButton @click="createRow">Создать</UISaveModalButton>
              <UIExitModalButton @click="closeModal">Отменить </UIExitModalButton>
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

<style scoped>
.hidden-row {
  display: none !important;
}

tr:nth-child(even) {
  background-color: #f2f2f2; /* Цвет для четных строк */
}
</style>
