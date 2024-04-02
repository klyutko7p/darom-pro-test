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
  copyRows.value = rows.value?.filter((value) => !value.issued && value.deleted === null);
}

function enableReceivedItems() {
  showReceivedItems.value = true;
  copyRows.value = rows.value;
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
    copyRows.value = [...rows.value];
    phoneNumber.value = copyRows.value[0].fromName;
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


onMounted(() => {
  if (!token) {
    router.push("/auth/client/login");
  }
});

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
      <h1 class="font-bold text-3xl">Список товаров</h1>
      <SpreadsheetsOrderGoods :rows="rows" :user="user" />
    </div>
  </div>
  <div v-else>
    <UISpinner />
  </div>
</template>
