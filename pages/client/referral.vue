<script setup lang="ts">
import Cookies from "js-cookie";
import { client } from "process";
import { useToast } from "vue-toastification";
const storeClients = useClientsStore();
const storeTickets = useTicketsStore();
const router = useRouter();

const toast = useToast();
let user = ref({} as Client);
let clientsReferred = ref<Array<any>>([]);
let clientsReferrer = ref<Array<any>>([]);
let clientTickets = ref<Array<Ticket>>([]);
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
  clientTickets.value = await storeTickets.getClientTickets(user.value.id);
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
  {
    label: "Мои билетики",
    icon: "i-icon-park-solid-tickets-two",
    defaultOpen: false,
    slot: "tickets",
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

function formatPhoneNumber(phoneNumber: string) {
  if (!phoneNumber) {
    return "Номер телефона не указан";
  }

  const digitsOnly = phoneNumber.replace(/\D/g, "");

  if (digitsOnly.length < 11) {
    return "Неправильный формат номера телефона";
  }

  const maskedPhoneNumber =
    "+7" + "*".repeat(digitsOnly.length - 5) + digitsOnly.slice(-4);

  return maskedPhoneNumber;
}

function checkConditions() {
  const conditions = [
    { minClients: 5, ticketCount: 0 },
    { minClients: 10, ticketCount: 1 },
    { minClients: 15, ticketCount: 2 },
    { minClients: 20, ticketCount: 3 },
    { minClients: 25, ticketCount: 4 },
    { minClients: 30, ticketCount: 5 },
  ];

  const qualifiedClientsCount = clientsReferred.value.filter(
    (client) => calculateTotalPrice(client.ransomData) >= 1000
  ).length;

  return conditions.some(
    (condition) =>
      qualifiedClientsCount >= condition.minClients &&
      clientTickets.value.length === condition.ticketCount
  );
}

function generateRandomString(length = 10) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return `#${result}`;
}

async function getTicket() {
  isLoading.value = true;
  const uniqueCode = generateRandomString();
  await storeTickets.createTicket(user.value.id, uniqueCode);
  clientTickets.value = await storeTickets.getClientTickets(user.value.id);
  isLoading.value = false;
}

let isShowTicket = ref(false);

let ticket = ref({} as Ticket);

function showTicketModal(ticketData: Ticket) {
  ticket.value = ticketData;
  isShowTicket.value = true;
}

function closeTicketModal() {
  ticket.value = {} as Ticket;
  isShowTicket.value = false;
}
</script>

<template>
  <Head>
    <Title>Реферальная система</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="mb-5 mt-24">
        <div
          class="mb-5"
          v-if="
            !clientsReferrer.length &&
            new Date(user.created_at) >= new Date('10.01.2024 00:00:01')
          "
        >
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
            Вы привязаны к номеру:
            {{ formatPhoneNumber(clientsReferrer[0]?.referred) }}
          </h1>
        </div>
        <h1 class="text-xl">
          Ваша реферальная ссылка
          <UButton
            @click="copyToClipboard"
            class="font-bold ml-3 max-lg:ml-0 max-lg:mt-3"
            icon="i-material-symbols-content-copy"
          >
            Нажмите тут, чтобы скопировать и отправить другу
          </UButton>
        </h1>
        <div class="mt-5">
          <UAccordion
            :ui="{
              default: {
                class: 'text-lg mb-3',
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
                        <h1>{{ formatPhoneNumber(client.referrer) }},</h1>
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
            <template #tickets>
              <div class="w-full bg-gray-50 px-5 py-3 mt-3">
                <div class="">
                  <h1 class="text-center" v-if="clientTickets.length">
                    Количество билетиков:
                    <span class="text-lg text-secondary-color font-semibold">
                      {{ clientTickets.length }} шт.</span
                    >
                  </h1>
                  <ul
                    v-if="clientTickets.length"
                    class="space-y-1 text-gray-500 flex items-center justify-center max-sm:flex-col dark:text-gray-400"
                  >
                    <li
                      v-for="(ticket, index) in clientTickets"
                      class="flex py-1.5 px-3 rounded-md items-center gap-5"
                    >
                      <UButton
                        @click="showTicketModal(ticket)"
                        icon="i-mdi-ticket"
                        class="font-semibold"
                        size="xl"
                        >{{ ticket.uniqueCode }}</UButton
                      >
                    </li>
                  </ul>
                  <h1 class="text-2xl text-center" v-else>
                    В данный момент у Вас нет ни одного билетика!
                  </h1>
                </div>
              </div>
            </template>
          </UAccordion>
        </div>
        <div
          class="flex items-center justify-center mt-5 gap-3 max-sm:flex-col"
        >
          <UButton
            v-if="checkConditions()"
            @click="getTicket"
            class="font-bold"
            icon="i-mdi-ticket"
            size="xl"
            >ПОЛУЧИТЬ БИЛЕТИК</UButton
          >
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
          <h1 class="text-2xl">
            Объявляем розыгрыш двух
            <span class="text-secondary-color font-semibold">
              APPLE IPHONE xx*!</span
            >
          </h1>
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
              <span class="font-semibold text-secondary-color">заказы**</span> Вы получите
              <span class="font-semibold text-secondary-color">билетик***</span>
              для участия в розыгрыше
            </li>
            <li>
              Программа "рандомайзер" определит победителя случайным образом
            </li>
          </ul>
          <h1 class="mt-3 font-semibold text-secondary-color">
            🎁 Второй IPHONE гарантировано получит участник, который пригласит
            больше всех друзей
          </h1>
          <h1 class="italic mt-3 text-sm font-semibold">
            *Модель айфона будет зависеть от общего количества приглашенных
            пользователей: <br />
            100 человек - <span class="uppercase font-bold text-secondary-color"> iphone 13 pro </span> <br />
            200 человек - <span class="uppercase font-bold text-secondary-color"> iphone 14 pro </span> <br />
            500 человек - <span class="uppercase font-bold text-secondary-color"> iphone 15 pro </span>
          </h1>
          <h1 class="italic mt-1 text-sm font-semibold">
            **от 1000р (учитываются только полученные товары).
          </h1>
          <h1 class="italic mt-1 text-sm font-semibold">
            *** за каждые 5 друзей.
          </h1>
        </div>
      </template>
    </UINewModalEditNoPadding>

    <UINewModalEditNoPaddingSecond
      v-show="isShowTicket"
      @close-modal="closeTicketModal"
    >
      <template v-slot:icon-header> </template>
      <template v-slot:header>Билетик - {{ ticket.id }}</template>
      <template v-slot:body>
        <div class="pt-24">
          <div class="px-5 flex items-center justify-center flex-col">
            <h1
              class="text-4xl max-sm:text-3xl font-semibold text-secondary-color"
            >
              НОМЕР БИЛЕТА
            </h1>
            <h1
              class="text-8xl text-white pr-3 pl-2 w-full mt-5 mb-5 font-semibold bg-secondary-color"
            >
              {{ ticket.id }}
            </h1>
            <h1 class="italic text-sm">
              Уникальный код - {{ ticket.uniqueCode }}
            </h1>
          </div>
        </div>
      </template>
    </UINewModalEditNoPaddingSecond>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
