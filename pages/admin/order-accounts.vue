<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storeOrderAccounts = useOrderAccountStore();
const router = useRouter();

const fields = ["название аккаунта заказа", "изменение", "удаление"];

let orderAccounts = ref<Array<OrderAccount>>();
let orderAccountData = ref({} as OrderAccount);

async function createOrderAccount(name: string) {
  isLoading.value = true;
  await storeOrderAccounts.createOrderAccount(name);
  orderAccounts.value = await storeOrderAccounts.getOrderAccounts();
  isLoading.value = false;
}

let isOpen = ref(false);
function openModal(row: OrderAccount) {
  isOpen.value = true;
  orderAccountData.value = JSON.parse(JSON.stringify(row));
}

function closeModal() {
  isOpen.value = false;
  orderAccountData.value = {} as OrderAccount;
}

async function updateOrderAccount() {
  isLoading.value = true;
  await storeOrderAccounts.updateOrderAccount(orderAccountData.value);
  orderAccounts.value = await storeOrderAccounts.getOrderAccounts();
  closeModal();
  isLoading.value = false;
}

async function deleteOrderAccount(id: number) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данный Сортировочный Центр?");
  if (answer) await storeOrderAccounts.deleteOrderAccount(id);
  orderAccounts.value = await storeOrderAccounts.getOrderAccounts();
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
  orderAccounts.value = await storeOrderAccounts.getOrderAccounts();
  isLoading.value = false;
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
          :rows="orderAccounts"
          @delete-row="deleteOrderAccount"
          @open-modal="openModal"
        />

        <AdminDataCreate :title="'Аккаунт Заказа'" @create-data="createOrderAccount" />

        <UIModal v-show="isOpen" @close-modal="closeModal">
          <template v-slot:header>
            <div class="custom-header">
              Изменение СЦ - <b> {{ orderAccountData.name }}</b>
            </div>
          </template>
          <div class="text-black">
            <div class="grid grid-cols-2 mb-5">
              <label for="name">Название СЦ</label>
              <input
                class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                v-model="orderAccountData.name"
                type="text"
              />
            </div>
          </div>
          <div class="flex items-center justify-center gap-3 mt-10">
            <UIMainButton @click="updateOrderAccount">Сохранить</UIMainButton>
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
