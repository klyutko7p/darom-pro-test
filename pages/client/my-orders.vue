<script setup lang="ts">
import Cookies from "js-cookie";
const storeClients = useClientsStore();
const storeRansom = useRansomStore();
const router = useRouter()
const route = useRoute();

let isLoading = ref(false);

let user = ref({} as Client);
let rowsOurRansom = ref<Array<IOurRansom>>([]);
let rowsClientRansom = ref<Array<IClientRansom>>([]);
let rows = ref<Array<any>>([]);
let copyRowsOurRansom = ref<Array<IOurRansom>>();
let copyRowsClientRansom = ref<Array<IClientRansom>>();

function getAmountToBePaid(flag: string, flagRansom: number) {
  let amountToPaid = 0;
  if (flagRansom === 1) {
    if (rowsOurRansom.value && flag === "NONE") {
      amountToPaid = rowsOurRansom.value
        .filter((value) => !value.issued && value.deleted === null)
        .reduce((acc, value) => acc + Math.ceil(value.amountFromClient1 / 10) * 10, 0);
    } else if (rowsOurRansom.value && flag === "PVZ") {
      amountToPaid = rowsOurRansom.value
        .filter((value) => value.deliveredPVZ && !value.issued && value.deleted === null)
        .reduce((acc, value) => acc + Math.ceil(value.amountFromClient1 / 10) * 10, 0);
    }
  } else if (flagRansom === 2) {
    if (rowsClientRansom.value && flag === "NONE") {
      amountToPaid = rowsClientRansom.value
        .filter((value) => !value.issued && value.deleted === null)
        .reduce((acc, value) => acc + Math.ceil(value.amountFromClient2 / 10) * 10, 0);
    } else if (rowsClientRansom.value && flag === "PVZ") {
      amountToPaid = rowsClientRansom.value
        .filter((value) => value.deliveredPVZ && !value.issued && value.deleted === null)
        .reduce((acc, value) => acc + Math.ceil(value.amountFromClient2 / 10) * 10, 0);
    }
  }
  return amountToPaid;
}

let showReceivedItems = ref(true);

function disableReceivedItems() {
  showReceivedItems.value = false;
  copyRowsOurRansom.value = rowsOurRansom.value?.filter((value) => !value.issued && value.deleted === null);
  copyRowsClientRansom.value = rowsClientRansom.value?.filter((value) => !value.issued && value.deleted === null);
}

function enableReceivedItems() {
  showReceivedItems.value = true;
  copyRowsOurRansom.value = rowsOurRansom.value;
  copyRowsClientRansom.value = rowsClientRansom.value;
}

let phoneNumber = ref("");

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeClients.getClient();

  rowsOurRansom.value = await storeRansom.getRansomRowsByFromNameWithoutCell(
    user.value.phoneNumber,
    "OurRansom"
  );
  rowsClientRansom.value = await storeRansom.getRansomRowsByFromNameWithoutCell(
    user.value.phoneNumber,
    "ClientRansom"
  );

  rows.value = [...rowsOurRansom.value, ...rowsClientRansom.value] 

  if (rows.value) {
    copyRowsOurRansom.value = [...rowsOurRansom.value];
    copyRowsClientRansom.value = [...rowsClientRansom.value];
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

onMounted(() => {
  if (!token) {
    router.push("/auth/client/login");
  }
});

const token = Cookies.get("token");
</script>

<template>
  <Head>
    <Title>Мои заказы</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token" class="mt-10">
      <div class="max-lg:p-3">
        <div class="mb-5 flex items-center gap-3">
          <h1 class="text-xl">
            Телефон: <span class="italic"> {{ user.phoneNumber }} </span>
          </h1>
          <Icon name="material-symbols:contact-phone-rounded" size="24" />
        </div>
        <h1 class="text-xl max-sm:text-base">
          Оставшаяся сумма к оплате:
          <span class="font-bold">
            {{ Math.ceil(getAmountToBePaid("NONE", 1) / 10) * 10 + Math.ceil(getAmountToBePaid("NONE", 2) / 10) * 10 }} руб.</span
          >
        </h1>
        <h1 class="text-xl max-sm:text-base">
          Сумма к оплате на выдачу:
          <span class="font-bold"
            >{{ Math.ceil(getAmountToBePaid("PVZ", 1) / 10) * 10 + Math.ceil(getAmountToBePaid("PVZ", 2) / 10) * 10 }} руб.</span
          >
        </h1>
        <UIMainButton
          v-if="showReceivedItems"
          class="mt-5"
          @click="disableReceivedItems"
          >Скрыть полученные товары</UIMainButton
        >
        <UIMainButton
          v-if="!showReceivedItems"
          class="mt-5"
          @click="enableReceivedItems"
        >
          Показать полученные товары</UIMainButton
        >
      </div>
      <SpreadsheetsOrderTable :link="'1'" :rows="copyRowsOurRansom" :user="user" />
      <div class="mt-16 mb-10">
        <SpreadsheetsOrderTable :link="'2'" :rows="copyRowsClientRansom" :user="user" />
      </div>
    </div>
  </div>
  <div v-else>
    <UISpinner />
  </div>
</template>
