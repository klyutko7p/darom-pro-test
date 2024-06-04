<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const route = useRoute();
const router = useRouter();
let link = route.params.link;
link = link.toString();

let isLoading = ref(false);

let user = ref({} as User);
let rows = ref<Array<any>>([]);
let copyRows = ref<Array<any>>([]);

function getAmountToBePaid(flag: string): number {
  let amountToPaid = 0;

  const shouldRound = (value: any) => {
    const createdDate = new Date(value.created_at);
    const referenceDate = new Date("2024-06-05T00:00:01");
    return createdDate > referenceDate;
  };

  const roundOrCeil = (num: number) => {
    const lastDigit = num % 10;
    return lastDigit >= 5 ? Math.ceil(num / 10) * 10 : Math.floor(num / 10) * 100;
  };

  rows.value.forEach((value: any) => {
    if (value.created_at) {
      const roundFunction = shouldRound(value) ? roundOrCeil : Math.ceil;
      switch (flag) {
        case "NONE":
          if (!value.issued && value.deleted === null) {
            amountToPaid += roundFunction(value.amountFromClient1);
          }
          break;
        case "PVZ1":
          if (value.deliveredPVZ && !value.issued && value.deleted === null) {
            amountToPaid += roundFunction(value.amountFromClient1);
          }
          break;
        case "NONE2":
          if (!value.issued && value.deleted === null) {
            amountToPaid += roundFunction(value.amountFromClient2);
          }
          break;
        case "PVZ2":
          if (value.deliveredPVZ && !value.issued && value.deleted === null) {
            amountToPaid += roundFunction(value.amountFromClient2);
          }
          break;
        case "NONE3":
          if (!value.paid && value.deleted === null) {
            amountToPaid += value.amountFromClient3;
          }
          break;
      }
    }
  });

  return amountToPaid;
}

function getAmountFromMonthDelivery() {
  let amountToPaid = 0;
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() + 1);
  if (typeof link === "string") {
    if (link.startsWith("3")) {
      if (rows.value) {
        amountToPaid = rows.value
          .filter((value) => {
            const paidDate = new Date(value.paid);
            return (
              paidDate >= thirtyDaysAgo &&
              paidDate <= currentDate &&
              value.nameOfAction === "Доставка"
            );
          })
          .reduce((acc, value) => acc + value.purchaseOfGoods, 0);
      }
    }
    return amountToPaid;
  }
}

function getAmountFromMonthSorting() {
  let amountToPaid = 0;
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() + 1);
  if (typeof link === "string") {
    if (link.startsWith("3")) {
      if (rows.value) {
        amountToPaid = rows.value
          .filter((value) => {
            const paidDate = new Date(value.paid);
            return (
              paidDate >= thirtyDaysAgo &&
              paidDate <= currentDate &&
              value.nameOfAction === "Сортировка"
            );
          })
          .reduce((acc, value) => acc + value.purchaseOfGoods, 0);
      }
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
let dispatchPVZ = ref("");
let cell = ref("");
const token = Cookies.get("token");

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();

  if (link.startsWith("1")) {
    rows.value = await storeRansom.getRansomRowsByLink(link, "OurRansom");
  } else if (link.startsWith("2")) {
    rows.value = await storeRansom.getRansomRowsByLink(link, "ClientRansom");
  } else if (link.startsWith("3")) {
    rows.value = await storeRansom.getRansomRowsByLink(link, "Delivery");
  }

  if (rows.value) {
    copyRows.value = [...rows.value];
    let ransomRow = copyRows.value;
    phoneNumber.value = copyRows.value[0].fromName;
    dispatchPVZ.value = ransomRow[ransomRow.length - 1].dispatchPVZ;
    cell.value = ransomRow[ransomRow.length - 1].cell;
    value.value = `${dispatchPVZ.value}/${phoneNumber.value}/${cell.value}`;
  }
  disableReceivedItems();
  isLoading.value = false;
});

function getNumber(phoneNumberData: string) {
  return phoneNumberData.slice(-4);
}

function roundToNearestTen(num: number): number {
  const lastDigit = num % 10;
  if (lastDigit >= 5) {
    return Math.ceil(num / 10) * 10;
  } else {
    return Math.floor(num / 10) * 10;
  }
}

let value = ref("");
</script>

<template>
  <Head>
    <Title>Заказ - {{ route.params.link }}</Title>
  </Head>
  <div v-if="!isLoading">
    <div class="mt-5 max-lg:mt-0">
      <div
        class="max-lg:px-3 flex justify-between items-start max-lg:flex-col-reverse max-lg:gap-3"
      >
        <div>
          <h1 class="text-2xl overflow-auto">
            Информация о заказе:
            <span class="uppercase">{{ route.params.link }}</span>
          </h1>
          <div class="mb-5 flex items-center gap-3">
            <h1 class="text-xl">
              Телефон: <span class="italic"> {{ getNumber(phoneNumber) }} </span>
            </h1>
            <Icon name="material-symbols:contact-phone-rounded" size="24" />
          </div>
          <h1 class="text-xl" v-if="!link.startsWith('3') && !link.startsWith('2')">
            Оставшаяся сумма к оплате:
            <span class="font-bold">
              {{ roundToNearestTen(getAmountToBePaid("NONE1")) }} руб.</span
            >
          </h1>
          <h1 class="text-xl" v-if="!link.startsWith('3') && !link.startsWith('1')">
            Оставшаяся сумма к оплате:
            <span class="font-bold">
              {{ roundToNearestTen(getAmountToBePaid("NONE2")) }} руб.</span
            >
          </h1>
          <h1 class="text-xl" v-if="link.startsWith('3')">
            Оставшаяся сумма к оплате:
            <span class="font-bold">{{ getAmountToBePaid("NONE3") }} руб.</span>
          </h1>
          <h1 class="text-xl" v-if="!link.startsWith('3') && !link.startsWith('2')">
            Сумма к оплате на выдачу:
            <span class="font-bold"
              >{{ roundToNearestTen(getAmountToBePaid("PVZ1")) }} руб.</span
            >
          </h1>
          <h1 class="text-xl" v-if="!link.startsWith('3') && !link.startsWith('1')">
            Сумма к оплате на выдачу:
            <span class="font-bold"
              >{{ roundToNearestTen(getAmountToBePaid("PVZ2")) }} руб.</span
            >
          </h1>
          <div
            class="text-xl max-sm:text-sm flex justify-end items-end flex-col gap-1 mt-7"
            v-if="link.startsWith('3')"
          >
            Сумма выкупов товаров за 30 дней
            <br />
            <h1>
              Доставка =
              <span class="font-bold">{{ getAmountFromMonthDelivery() }} руб.</span>
            </h1>
            <h1>
              Сортировка =
              <span class="font-bold">{{ getAmountFromMonthSorting() }} руб.</span>
            </h1>
          </div>
          <UIMainButton
            v-if="showReceivedItems && !link.startsWith('3')"
            class="mt-5"
            @click="disableReceivedItems"
            >Скрыть полученные товары</UIMainButton
          >
          <UIMainButton
            v-if="!showReceivedItems && !link.startsWith('3')"
            class="mt-5"
            @click="enableReceivedItems"
          >
            Показать полученные товары</UIMainButton
          >
        </div>
        <div class="flex flex-col items-center gap-3 max-lg:items-start mt-3">
          <CodeQR :value="value" class="max-w-[110px] max-h-[100px]" />
        </div>
      </div>
      <SpreadsheetsOrderTable :link="link" :rows="copyRows" :user="user" />
    </div>
  </div>
  <div v-else class="flex items-center justify-center">
    <UISpinner />
  </div>
</template>
