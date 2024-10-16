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
      <div v-if="!isLoading" class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5 w-screen">
        <AdminDataTable
          :fields="fields"
          :rows="orderAccounts"
          @delete-row="deleteOrderAccount"
          @open-modal="openModal"
        />

        <AdminDataCreate
          :title="'Аккаунт Заказа'"
          @create-data="createOrderAccount"
          class="px-5"
        />

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon
              size="24"
              name="material-symbols-light:deployed-code-account-rounded"
            />
          </template>
          <template v-slot:header>
            <div class="custom-header">
              <h1>Изменение: {{ orderAccountData.name }}</h1>
            </div>
          </template>
          <template v-slot:body>
            <div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Название аккаунта</label>
                <UInput
                  class="w-full"
                  v-model="orderAccountData.name"
                  type="text"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex gap-3 items-center justify-center">
              <UISaveModalButton @click="updateOrderAccount"
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
