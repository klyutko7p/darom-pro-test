<script setup lang="ts">
import Cookies from "js-cookie";
import crypto from "crypto-js";
import { useToast } from "vue-toastification";
const storeClients = useClientsStore();
const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();
const toast = useToast();

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
const botToken = config.public.tokenTelegramBot;

let originallyConfirmationCode = ref("");
async function uploadData(chat_id: string) {
  const confirmationCode = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  const messageText = `Ваш код подтверждения: ${confirmationCode}`;
  originallyConfirmationCode.value = confirmationCode;

  const formData = new FormData();
  formData.append("chat_id", chat_id);
  formData.append("text", messageText);

  let response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    body: formData,
  });

  let data = await response.json();
}

async function getChatData() {
  const apiUrl = `https://api.telegram.org/bot${botToken}/getUpdates`;
  let requestSent = false;
  let requestPhone = false;

  while (!requestSent) {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok && data.ok) {
        if (data.result.length > 0) {
          data.result.forEach(async (update: any) => {
            const chatData = update.message;
            const username = chatData.chat.username;
            const contact = chatData.contact;

            if (username === usernameTG.value && !requestPhone) {
              if (!contact) {
                await requestContact(chatData.chat.id);
                requestPhone = true;
              }
            }

            if (contact) {
              const phoneNumber = contact.phone_number;
              if (phoneNumber === phoneNumberData.value) {
                await uploadData(chatData.chat.id);
              }

              requestSent = true;
              return;
            }
          });
        } else {
          console.log("No updates received.");
        }
      } else {
        console.log("Failed to get updates.");
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}

async function requestContact(chatId: string) {
  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const keyboard = {
    keyboard: [[{ text: "Предоставить номер телефона", request_contact: true }]],
    one_time_keyboard: true,
  };

  const formData = new URLSearchParams();
  formData.append("chat_id", chatId);
  formData.append("text", "Предоставьте свой номер телефона:");
  formData.append("reply_markup", JSON.stringify(keyboard));

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
  } catch (error) {
    console.error("Error requesting contact:", error);
  }
}

let isLoading = ref(false);

let errorTextValidation = ref("");
let confirmationCode = ref("");

async function isValidateConfirmationCode() {
  if (confirmationCode.value.length === 5) {
    if (confirmationCode.value === originallyConfirmationCode.value) {
      isLoading.value = true;
      let data = await storeClients.register({
        id: 0,
        phoneNumber: phoneNumberData.value,
        password: password.value,
        fio: fio.value,
        role: "CLIENT",
        created_at: new Date(),
      });
      console.log(data);
      isLoading.value = false;
    } else {
      toast.error("Вы ввели неправильный код, попробуйте ещё раз!");
    }
  }
}

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

  // isLoading.value = true;
  // let data = await storeClients.sendMessage('+77056281919')
  // console.log(data);

  // await storeClients.register({
  //   id: 0,
  //   phoneNumber: phoneNumberData.value,
  //   password: password.value,
  //   fio: fio.value,
  //   role: "CLIENT",
  //   created_at: new Date(),
  // });

  // if (storeClients.compareReferralLinkNumber(queryValue, refValue)) {
  //   await storeClients.createReferralClient(phoneNumberData.value, phoneNumberValue);
  // }
  isShowSecondModal.value = true;
  await getChatData();

  // isLoading.value = false;
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
let isShowSecondModal = ref(false);

function validationPhoneNumber() {
  phoneNumberData.value = phoneNumberData.value.replace(/[^0-9+]/g, "");
}

function closeSecondModal() {
  isShowSecondModal.value = false;
}
let showPassword = ref(false);
let usernameTG = ref("");
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
              >Никнейм в телеграме</label
            >
            <div class="mt-2">
              <input
                v-model="usernameTG"
                id="usernameTG"
                name="usernameTG"
                type="text"
                autocomplete="usernameTG"
                required
                placeholder="Пример: ivan_0241"
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
      data-aos="zoom-out"
      v-if="isShowSecondModal"
      class="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-65 z-[200]"
    >
      <div class="flex items-center justify-center h-screen max-sm:px-2">
        <div class="bg-white rounded-3xl max-sm:rounded-none max-w-[500px] py-5">
          <div class="flex justify-end px-3">
            <Icon
              @click="closeSecondModal"
              class="hover:text-hover-color duration-200 cursor-pointer"
              name="material-symbols:close-rounded"
              size="24"
            />
          </div>
          <div class="border-b-2 p-5 flex items-center gap-24 justify-between">
            <p class="font-medium text-2xl max-sm:text-xl max-sm:text-center">
              Подтверждение номера телефона
            </p>
          </div>
          <div>
            <p class="text-xl m-5 max-sm:text-lg px-3 text-center">
              Подтвердите свой номер телефона введя цифры, который отправил Вам наш бот!
              Как это сделать?
            </p>
            <ul class="list-decimal mt-3 px-10">
              <li>Перейдите в телеграм</li>
              <li>
                Вбейте в поиск "Бот-Поддержка Darom.pro" или кликните
                <NuxtLink
                  class="underline text-secondary-color"
                  to="https://t.me/DaromProSupportBot"
                  target="_blank"
                  >здесь</NuxtLink
                >
              </li>
              <li>Нажмите кнопку "/start" или напишите любое сообщение боту.</li>
              <li>Нажмите кнопку <br> "Предоставить номер телефона".</li>
              <li>
                Вы должны увидеть сообщение: <br>
                <span class="italic text-muted-color">Ваш код подтверждения: *****</span>
              </li>
              <li>Впишите код подтверждения ниже</li>
            </ul>
            <div class="flex justify-center mt-5">
              <input
                class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
                type="text"
                @input="isValidateConfirmationCode"
                v-model="confirmationCode"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="text-center underline absolute top-3 right-2 text-secondary-color font-bold"
    >
      <NuxtLink to="/auth/login">Зайти как сотрудник</NuxtLink>
    </div>
  </div>
  <div v-else class="flex items-center justify-center">
    <UISpinner />
  </div>
</template>
