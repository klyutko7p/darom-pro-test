<script setup lang="ts">
import Cookies from "js-cookie";
import crypto from "crypto-js";
const storeClients = useClientsStore();
const router = useRouter();
const route = useRoute();

const phoneNumber = ref("");
const fio = ref("");
const password = ref("");
const repeatPassword = ref("");
const message = ref("");
const refValue = route.query.ref ? route.query.ref : "";
const queryValue = route.query.q ? route.query.q : "";
const phoneNumberValue = route.query.phone
  ? storeClients.decryptPhoneNumber(route.query.phone)
  : "";

let isLoading = ref(false);

let errorTextValidation = ref("");
async function register() {
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
    errorTextValidation.value = "Пожалуйста, введите пароль";
    return;
  }

  if (repeatPassword.value?.trim() === "") {
    errorTextValidation.value = "Пожалуйста, повторите пароль";
    return;
  }

  if (password.value !== repeatPassword.value) {
    errorTextValidation.value = "Пароль и повтор пароля не совпадают";
    return;
  }

  errorTextValidation.value = "";

  isLoading.value = true;
  await storeClients.register({
    id: 0,
    phoneNumber: phoneNumber.value,
    password: password.value,
    fio: fio.value,
    role: "CLIENT",
    created_at: new Date(),
  });

  if (storeClients.compareReferralLinkNumber(queryValue, refValue)) {
    await storeClients.createReferralClient(phoneNumber.value, phoneNumberValue);
  }

  isLoading.value = false;
}

let user = ref({} as User);
const token = Cookies.get("token");

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeClients.getClient();
  isLoading.value = false;

  if (token && user.value.role === "ADMIN") {
    router.push("/admin/main");
  } else if (token && user.value.role === "USER") {
    router.push("/user/main");
  } else if (token && user.value.role === "CLIENT") {
    router.push("/client/main");
  }
});
</script>

<template>
  <Head>
    <Title>Регистрация</Title>
  </Head>
  <div
    v-if="!isLoading"
    class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <div class="flex items-center gap-4 justify-center">
        <h1 class="text-center text-secondary-color text-4xl font-bold">DAROM.PRO</h1>
        <Icon size="40" name="material-symbols:account-circle" />
      </div>
      <h2
        class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900"
      >
        Регистрация пользователя
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="register">
        <div>
          <label for="phone" class="block text-sm font-medium leading-6 text-gray-900"
            >Телефон</label
          >
          <div class="mt-2">
            <input
              v-model="phoneNumber"
              id="phone"
              name="phone"
              type="text"
              autocomplete="phone"
              required
              class="block w-full bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label for="fio" class="block text-sm font-medium leading-6 text-gray-900"
            >ФИО</label
          >
          <div class="mt-2">
            <input
              v-model="fio"
              id="fio"
              name="fio"
              type="text"
              autocomplete="fio"
              required
              class="block w-full bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label
              for="password"
              class="block text-sm font-medium leading-6 text-gray-900"
              >Придумайте пароль</label
            >
          </div>
          <div class="mt-2">
            <input
              v-model="password"
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="block w-full bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between">
            <label
              for="repeat-password"
              class="block text-sm font-medium leading-6 text-gray-900"
              >Повторите пароль</label
            >
          </div>
          <div class="mt-2">
            <input
              v-model="repeatPassword"
              id="repeat-password"
              name="repeat-password"
              type="password"
              autocomplete="current-password"
              required
              class="block w-full bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div v-if="message !== ''">
          <h1 class="text-red-700">{{ message }}</h1>
        </div>
        <div class="flex items-center justify-center">
          <UIMainButton class="w-full">Зарегистрироваться</UIMainButton>
        </div>
        <h1 class="text-center font-bold text-red-500">{{ errorTextValidation }}</h1>
      </form>
      <div class="text-center underline text-secondary-color font-bold mt-5">
        <NuxtLink to="/auth/client/login">Или войдите</NuxtLink>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center">
    <UISpinner />
  </div>
</template>
