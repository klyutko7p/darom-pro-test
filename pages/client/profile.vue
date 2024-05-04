<script setup lang="ts">
import type { ClientReferral } from "@prisma/client";
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
const storeClients = useClientsStore();
const router = useRouter();

const toast = useToast();
let user = ref({} as Client);
let clientsReferred = ref<Array<Client[]>>([]);
let ourRansomRows = ref<Array<IOurRansom[]>>([]);
const token = Cookies.get("token");
const storeRansom = useRansomStore();
let urlReferral = ref("");
let isLoading = ref(false);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeClients.getClient();
  let userData = await storeClients.getClientById(user.value.id);
  user.value = userData;
  clientsReferred.value = await storeClients.getClientsByReferrer(user.value.phoneNumber);
  urlReferral.value = storeClients.createReferralLink(user.value.phoneNumber);
  phoneNumber.value = user.value.phoneNumber;
  fio.value = user.value.fio;
  isLoading.value = false;
});

onMounted(() => {
  if (!token) {
    router.push("/auth/client/login");
  }
});

const phoneNumber = ref("");
const fio = ref();
const password = ref("");
const newPassword = ref("");

definePageMeta({
  layout: "client",
});

let isShowChangePassword = ref(false);
function showChangePassword() {
  isShowChangePassword.value = !isShowChangePassword.value;
}
let errorTextValidation = ref("");
async function saveChanges() {
  if (phoneNumber.value.length < 11) {
    errorTextValidation.value = "Неправильный ввод номера телефона";
    return;
  }

  if (phoneNumber.value.length > 12) {
    errorTextValidation.value = "Неправильный ввод номера телефона";
    return;
  }

  if (!phoneNumber.value.startsWith("+7")) {
    errorTextValidation.value = 'Номер телефона должен начинаться с "+7"';
    return;
  }

  if (phoneNumber.value.trim() === "") {
    errorTextValidation.value = "Пожалуйста, введите свой номер телефона";
    return;
  }

  if (password.value.trim() === "") {
    errorTextValidation.value = "Пожалуйста, введите подтверждающий пароль";
    return;
  }

  errorTextValidation.value = "";

  isLoading.value = true;
  if (isShowChangePassword.value) {
    await storeClients.updateClient(
      {
        id: user.value.id,
        phoneNumber: phoneNumber.value,
        password: newPassword.value,
        fio: fio.value,
        role: "CLIENT",
        oldPassword: user.value.password,
        accessPassword: password.value,
        created_at: new Date(),
      },
      "PASS"
    );
    await storeClients.clearCookies(phoneNumber.value, newPassword.value);
  } else {
    await storeClients.updateClient(
      {
        id: user.value.id,
        phoneNumber: phoneNumber.value,
        password: user.value.password,
        fio: fio.value,
        role: "CLIENT",
        oldPassword: user.value.password,
        accessPassword: password.value,
        created_at: new Date(),
      },
      "NON-PASS"
    );
    await storeClients.clearCookies(phoneNumber.value, password.value);
  }
  isLoading.value = false;
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

async function updateBalance() {
  let sum = 0;
  isLoading.value = true;
  for (const element of clientsReferred.value) {
    if (!element.isAccrued) {
      ourRansomRows.value = await storeRansom.getRansomRowsByFromNameWithoutCell(
        element.referrer,
        "OurRansom"
      );

      if (
        ourRansomRows.value.reduce((acc, row) => acc + row.amountFromClient1, 0) >= 3000
      ) {
        await storeClients.updateBalanceStatus(element.referrer);
        sum += 500;
      } else {
        console.log("Баланс никак не изменится!");
      }
    }
  }
  if (sum !== 0) {
    await storeClients.updateBalanceSum(user.value.id, user.value.balance + sum);
  }
  let userData = await storeClients.getClientById(user.value.id);
  user.value = userData;
  isLoading.value = false;
}
</script>

<template>
  <Head>
    <Title>Личные данные</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="py-5">
        <h1 class="text-2xl mt-5 text-center">Изменить личные данные пользователя</h1>
        <div class="mt-10">
          <div class="mb-5">
            <label for="phone" class="text-2xl">Телефон</label>
            <input
              type="text"
              v-model="phoneNumber"
              class="block mt-3 w-full bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
              name="phone"
            />
          </div>
          <div class="mb-5">
            <label for="phone" class="text-2xl">ФИО</label>
            <input
              type="text"
              v-model="fio"
              class="block mt-3 w-full bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
              name="phone"
            />
          </div>
          <div class="mb-5" v-if="isShowChangePassword">
            <label for="phone" class="text-2xl">Новый пароль</label>
            <input
              type="password"
              v-model="newPassword"
              class="block mt-3 w-full bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
              name="phone"
            />
          </div>
          <div class="mb-5">
            <label for="phone" class="text-2xl">Подтвердите пароль</label>
            <input
              type="password"
              v-model="password"
              class="block mt-3 w-full bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
              name="phone"
            />
          </div>
          <h1 class="text-center font-bold text-red-500">{{ errorTextValidation }}</h1>
          <div class="flex items-center gap-5">
            <UIMainButton @click="showChangePassword">Поменять пароль</UIMainButton>
            <UIMainButton @click="saveChanges">Сохранить</UIMainButton>
          </div>
        </div>
        <!-- <div class="mb-5 mt-10">
          <h1 class="text-xl">
            Ваша реферальная ссылка:
            <span
              @click="copyToClipboard"
              class="font-bold underline text-secondary-color cursor-pointer"
            >
              СКОПИРОВАТЬ</span
            >
          </h1>
          <div class="mt-5">
            <h1>
              Количество пользователей, зарегистрированные по Вашей ссылке:
              {{ clientsReferred.length }}
            </h1>
            <h1>Ваш баланс в данный момент: {{ user.balance ? user.balance : 0 }} ₽</h1>
            <UIMainButton @click="updateBalance" class="mt-5"
              >Обновить баланс</UIMainButton
            >
          </div>
        </div> -->
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center">
    <UISpinner />
  </div>
</template>
