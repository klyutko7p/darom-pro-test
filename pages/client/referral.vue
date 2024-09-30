<script setup lang="ts">
import Cookies from "js-cookie";
import { client } from "process";
import { useToast } from "vue-toastification";
const storeClients = useClientsStore();
const storeUsers = useUsersStore();
const router = useRouter();

const toast = useToast();
let user = ref({} as Client);
let clientsReferred = ref<Array<any>>([]);
let clientsReferrer = ref<Array<any>>([]);
let ourRansomRows = ref<Array<IOurRansom[]>>([]);
const token = Cookies.get("token");
const storeRansom = useRansomStore();
let urlReferral = ref("");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }

  isLoading.value = true;
  user.value = await storeClients.getClient();
  let userData = await storeClients.getClientById(user.value.id);
  user.value = userData;
  clientsReferred.value = await storeClients.getClientsByReferred(
    user.value.phoneNumber
  );
  clientsReferrer.value = await storeClients.getClientsByReferrer(
    user.value.phoneNumber
  );
  await getAllPurchasePrice(clientsReferred.value);
  urlReferral.value = storeClients.createReferralLink(user.value.phoneNumber);
  phoneNumber.value = user.value.phoneNumber;
  fio.value = user.value.fio;
  isLoading.value = false;
});

const phoneNumber = ref("");
const fio = ref();

definePageMeta({
  layout: "client",
});

async function getAllPurchasePrice(clientsReferred: any[]) {
  for (const client of clientsReferred) {
    const phoneNumber = client.referrer;

    try {
      const ourRansomRows =
        await storeRansom.getRansomRowsByFromNameWithoutCell(
          phoneNumber,
          "OurRansom"
        );

      const clientRansomRows =
        await storeRansom.getRansomRowsByFromNameWithoutCell(
          phoneNumber,
          "ClientRansom"
        );
      4;

      client.ransomData = [...ourRansomRows, ...clientRansomRows];
    } catch (error) {
      console.error(error);
    }
  }
}

function calculateTotalPrice(rows: any[]) {
  let totalSum;
  let rowsOurRansom = rows
    .filter((row: any) => row.issued && row.amountFromClient1)
    .reduce((total: any, row: any) => {
      const price = +row.amountFromClient1;
      return total + price;
    }, 0);

  let rowsClientRansom = rows
    .filter((row: any) => row.issued && row.amountFromClient2)
    .reduce((total: any, row: any) => {
      const price = +row.amountFromClient2;
      return total + price;
    }, 0);

  totalSum = rowsOurRansom + rowsClientRansom;
  return totalSum;
}

function copyToClipboard() {
  const el = document.createElement("textarea");
  el.value = urlReferral.value;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  toast.success("Вы успешно скопировали ссылку!");
}

const items = [
  {
    label: "Друзья",
    icon: "i-carbon-friendship",
    defaultOpen: false,
    slot: "friends",
  },
];

let refLink = ref("");
async function updateRefStatus() {
  const parsedUrl = new URL(refLink.value);

  const refValue = parsedUrl.searchParams.get("hash") as string;
  const queryValue = parsedUrl.searchParams.get("q") as string;
  const phone = parsedUrl.searchParams.get("phone") as string;
  isLoading.value = true;
  if (
    storeClients.compareReferralLinkNumberRefSystem(
      queryValue,
      refValue,
      phone,
      user.value.phoneNumber
    )
  ) {
    let decryptPhoneNumberRef = storeClients.decryptPhoneNumber(phone);
    await storeClients.createReferralClient(
      user.value.phoneNumber,
      decryptPhoneNumberRef
    );
    clientsReferrer.value = await storeClients.getClientsByReferrer(
      user.value.phoneNumber
    );
    toast.success("Вы успешно привязались к реферальной системе!");
  } else {
    toast.error("Нельзя привязать свой аккаунт к своей реферальной ссылке!");
  }
  isLoading.value = false;
}

let isShowInfo = ref(false);
</script>

<template>
  <Head>
    <Title>Реферальная система</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="mb-5 mt-24">
        <div class="mb-5" v-if="!clientsReferrer.length">
          <h1 class="mb-3">
            Вставьте скопированную реферальную ссылку от Вашего друга
          </h1>
          <UInput v-model="refLink" />
          <div class="flex items-center justify-end">
            <UButton @click="updateRefStatus" size="xl" class="mt-3 font-bold"
              >Привязать</UButton
            >
          </div>
        </div>
        <div class="mb-5" v-else-if="clientsReferrer.length">
          <h1 class="mb-3 italic text-green-500 font-semibold">
            Вы привязаны к номеру: {{ clientsReferrer[0]?.referred }}
          </h1>
        </div>
        <h1 class="text-xl">
          Ваша реферальная ссылка:
          <UButton
            @click="copyToClipboard"
            class="font-bold ml-3"
            icon="i-material-symbols-content-copy"
          >
            Нажмите тут, чтобы скопировать и отправить другу
          </UButton>
        </h1>
        <div class="mt-5">
          <UAccordion
            :ui="{
              default: {
                class: 'text-lg',
              },
            }"
            color="orange"
            :items="items"
          >
            <template #friends>
              <div class="w-full bg-gray-50 px-5 py-3 mt-3">
                <h1>
                  Количество друзей, выполнивших условия:
                  <span class="text-green-500 text-xl">
                    {{
                      clientsReferred.filter(
                        (client) =>
                          calculateTotalPrice(client.ransomData) >= 1000
                      ).length
                    }}
                    чел.
                  </span>
                </h1>
                <h1>
                  Количество друзей, не выполнивших условия:
                  <span class="text-red-500 text-xl">
                    {{
                      clientsReferred.filter(
                        (client) =>
                          calculateTotalPrice(client.ransomData) < 1000
                      ).length
                    }}
                    чел.
                  </span>
                </h1>
                <div class="my-5" v-for="(client, index) in clientsReferred">
                  <ul
                    class="space-y-1 text-gray-500 list-inside dark:text-gray-400"
                  >
                    <li
                      :class="{
                        'bg-green-100':
                          calculateTotalPrice(client.ransomData) >= 1000,
                        'bg-red-100':
                          calculateTotalPrice(client.ransomData) < 1000,
                      }"
                      class="flex py-1.5 px-3 rounded-md items-center gap-5 w-full"
                    >
                      <Icon
                        name="i-ri-checkbox-circle-fill"
                        size="24"
                        class="text-green-500"
                        v-if="calculateTotalPrice(client.ransomData) >= 1000"
                      />
                      <Icon
                        name="i-ic-round-remove-circle"
                        size="24"
                        class="text-red-500"
                        v-if="calculateTotalPrice(client.ransomData) < 1000"
                      />
                      <div class="flex items-center gap-1">
                        <h1>{{ client.referrer }},</h1>
                        <h1>
                          {{
                            calculateTotalPrice(client.ransomData) >= 1000
                              ? "~1000"
                              : calculateTotalPrice(client.ransomData)
                          }}
                          ₽
                        </h1>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </template>
          </UAccordion>
        </div>
        <div class="flex items-center justify-center mt-5">
          <UButton
            @click="isShowInfo = true"
            class="font-bold"
            icon="i-streamline-give-gift-solid"
            size="xl"
            >РОЗЫГРЫШ ПРИЗОВ</UButton
          >
        </div>
      </div>
    </div>

    <UINewModalEditNoPadding
      v-show="isShowInfo"
      @close-modal="isShowInfo = !isShowInfo"
    >
      <template v-slot:icon-header> </template>
      <template v-slot:header>РОЗЫГРЫШ IPHONE</template>
      <template v-slot:body>
        <div>
          <Icon name="i-noto-v1-confetti-ball" size="40" />
          <h1 class="text-2xl">Объявляем розыгрыш <span> IPHONE xx!</span></h1>
        </div>
        <div class="text-left px-3">
          <h1 class="text-base italic mb-1 mt-3">
            Для участия в розыгрыше нужно:
          </h1>
          <ul class="list-decimal text-sm px-5 space-y-1">
            <li>
              Быть подписанным на
              <a
                class="underline text-secondary-color font-semibold"
                href="https://t.me/DaromProForYou"
                target="_blank"
                >наше сообщество</a
              >
              в телеграм
            </li>
            <li>
              Скопировать личную (реферальную) ссылку в Вашем личном кабинете на
              сайте
              <a
                class="underline text-secondary-color font-semibold"
                href="https://darom.pro/"
                target="_blank"
                >https://darom.pro</a
              >
              и поделиться ей с друзьями, которые ещё не заказывали у нас.
            </li>
            <li>
              Когда 5 Ваших друзей заберут
              <span class="font-semibold">заказы*</span> Вы получите
              <span class="font-semibold">билетик**</span>
              для участия в розыгрыше
            </li>
          </ul>
          <h1 class="italic mt-3 text-sm font-semibold">
            *от 1000р (учитываются только полученные товары).
          </h1>
          <h1 class="italic mt-1 text-sm font-semibold">
            ** за каждые 5 друзей.
          </h1>
        </div>
      </template>
    </UINewModalEditNoPadding>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
