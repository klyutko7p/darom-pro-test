<script setup lang="ts">
import Cookies from "js-cookie";
const storeClients = useClientsStore();
const storeRansom = useRansomStore();
const router = useRouter();

let isLoading = ref(false);

let user = ref({} as Client);
let rowsOurRansom = ref<Array<IOurRansom>>([]);
let rowsClientRansom = ref<Array<IClientRansom>>([]);
let rows = ref<Array<any>>([]);
let copyRows = ref<Array<IOurRansom | IClientRansom | IDelivery>>();

let showReceivedItems = ref(true);

function disableReceivedItems() {
  showReceivedItems.value = false;
  copyRows.value = rows.value?.filter(
    (value) => !value.issued && value.deleted === null
  );
}

function enableReceivedItems() {
  showReceivedItems.value = true;
  copyRows.value = rows.value;
}

let phoneNumber = ref("");

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }
  isLoading.value = true;
  user.value = await storeClients.getClient();

  rowsOurRansom.value =
    await storeRansom.getRansomRowsByFromNameWithoutCellOurRansom(
      user.value.phoneNumber
    );
  rowsClientRansom.value =
    await storeRansom.getRansomRowsByFromNameWithoutCellClientRansom(
      user.value.phoneNumber
    );

  rows.value = [...rowsOurRansom.value, ...rowsClientRansom.value];

  if (rows.value) {
    rows.value = rows.value.filter((row) => row.issued);
    copyRows.value = [...rows.value];
    phoneNumber.value = user.value.phoneNumber;
  }
  disableReceivedItems();
  isLoading.value = false;
});

function getNumber(phoneNumberData: string) {
  return phoneNumberData.slice(-4);
}

definePageMeta({
  layout: "client",
});

const token = Cookies.get("token");
</script>

<template>
  <Head>
    <Title>Купленные товары</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token" class="mt-10">
      <div class="max-lg:p-3">
        <div class="mb-5 flex items-center gap-3">
          <h1 class="text-xl">
            Телефон: <span class="italic"> {{ phoneNumber }} </span>
          </h1>
          <Icon name="material-symbols:contact-phone-rounded" size="24" />
        </div>
      </div>
      <h1 class="font-bold text-2xl max-sm:text-2xl" v-if="rows.length > 0">
        Список товаров
      </h1>
      <h1 class="font-bold text-2xl mt-10 max-sm:text-2xl text-center" v-else>
        Список товаров пока пуст.
      </h1>
      <SpreadsheetsOrderGoods :rows="rows" :user="user" />
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
