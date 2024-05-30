<script setup lang="ts">
import Cookies from "js-cookie";
const storeClients = useClientsStore();
const router = useRouter();
const route = useRoute();

const phoneNumberData = ref("");
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
  if (phoneNumberData.value.length < 11) {
    errorTextValidation.value = "Неправильный ввод номера телефона";
    return;
  }

  if (phoneNumberData.value.length > 12) {
    errorTextValidation.value = "Неправильный ввод номера телефона";
    return;
  }

  if (!phoneNumberData.value.startsWith("+7")) {
    errorTextValidation.value = 'Номер телефона должен начинаться с "+7"';
    return;
  }

  if (phoneNumberData.value.trim() === "") {
    errorTextValidation.value = "Пожалуйста, введите свой номер телефона";
    return;
  }

  if (password.value.trim() === "") {
    errorTextValidation.value = "Пожалуйста, введите пароль";
    return;
  }

  if (password.value.trim().length < 6) {
    errorTextValidation.value = "Пароль должен состоять хотя бы из 6 знаков!";
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
  // let data = await storeClients.sendMessage('+77056281919')
  // console.log(data);

  await storeClients.register({
    id: 0,
    phoneNumber: phoneNumberData.value,
    password: password.value,
    fio: fio.value,
    role: "CLIENT",
    created_at: new Date(),
  });

  if (storeClients.compareReferralLinkNumber(queryValue, refValue)) {
    await storeClients.createReferralClient(phoneNumberData.value, phoneNumberValue);
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

watch(() => phoneNumberData.value, validationPhoneNumber);

function validationPhoneNumber() {
  phoneNumberData.value = phoneNumberData.value.replace(/[^0-9+]/g, "");
}

let showPassword = ref(false);
</script>

<template>
  <Head>
    <Title>Регистрация</Title>
  </Head>
  <div v-if="!isLoading" class="h-screen flex items-center justify-center max-sm:block">
    <div
      class="px-10 py-40 max-sm:py-20 max-sm:px-1 shadow-2xl border-2 border-[#f0f0f0] bg-opacity-50"
    >
      <div class="">
        <div class="flex items-center justify-center">
          <h1 class="text-center text-secondary-color text-6xl max-sm:text-5xl font-bold">
            DAROM.PRO
          </h1>
        </div>
        <h2
          class="mt-5 text-center text-2xl max-sm:text-xl font-bold leading-9 tracking-tight text-gray-900"
        >
          Регистрация пользователя
        </h2>
      </div>

      <div class="mt-10 max-sm:px-3">
        <form class="space-y-10" @submit.prevent="register">
          <div>
            <label for="phone" class="block text-sm font-medium leading-6 text-gray-900"
              >Телефон</label
            >
            <div class="mt-2">
              <input
                v-model="phoneNumberData"
                id="phone"
                name="phone"
                type="text"
                autocomplete="phone"
                required
                placeholder="+7XXXXXXXXXX"
                class="block w-full ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-600 bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
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
                placeholder="Иванов Иван Иванович"
                class="block w-full ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-600 bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
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
            <div class="mt-2 relative">
              <input
                v-model="password"
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="******"
                class="block w-full ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-600 bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
              />
              <Icon
                @click="showPassword = !showPassword"
                name="ic:round-remove-red-eye"
                class="cursor-pointer hover:text-secondary-color duration-100 absolute top-2 right-2"
                size="20"
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
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="******"
                class="block w-full ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-600 bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 outline-none"
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

    <div
      class="underline absolute top-3 right-2 flex flex-col text-right text-secondary-color font-bold"
    >
      <NuxtLink to="/auth/login">Зайти как сотрудник</NuxtLink>
      <NuxtLink to="/">На главную</NuxtLink>
    </div>
  </div>
  <div v-else class="flex items-center justify-center">
    <UISpinner />
  </div>
</template>
