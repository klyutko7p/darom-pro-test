<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
const storeClients = useClientsStore();
const storeUsers = useUsersStore();
const router = useRouter();

const toast = useToast();
let user = ref({} as Client);
let clientsReferred = ref<Array<any>>([]);
let ourRansomRows = ref<Array<IOurRansom[]>>([]);
const token = Cookies.get("token");
const storeRansom = useRansomStore();
let urlReferral = ref("");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login?stay=true");
  }

  isLoading.value = true;
  user.value = await storeClients.getClient();
  let userData = await storeClients.getClientById(user.value.id);
  user.value = userData;
  phoneNumber.value = user.value.phoneNumber;
  fio.value = user.value.fio;
  isLoading.value = false;
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
  if (!isShowChangePassword.value) {
    isShowPasswordInput.value = !isShowPasswordInput.value;
  } else {
    isShowPasswordInput.value = false;
  }
}
let isShowPasswordInput = ref(false);
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

  if (isShowChangePassword.value) {
    if (newPassword.value.trim() === "") {
      errorTextValidation.value = "Пожалуйста, введите новый пароль";
      return;
    }

    if (newPassword.value.trim().length < 6) {
      errorTextValidation.value =
        "Новый пароль должен состоять хотя бы из 6 знаков!";
      return;
    }

    if (newPassword.value.trim() !== newPasswordRepeat.value.trim()) {
      errorTextValidation.value = "Пароль и повтор пароля не совпадают";
      return;
    }
  } else {
    isShowPasswordInput.value = true;
  }

  if (password.value.trim() === "") {
    isShowPasswordInput.value = true;
    errorTextValidation.value =
      "Пожалуйста, введите пароль, чтобы сохранить изменения.";
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

let showPassword = ref(false);
let newPasswordRepeat = ref("");
let isOpenModalNoRegistration = ref(true);

function signOut() {
  storeClients.signOut();
}
</script>

<template>
  <Head>
    <Title>Личные данные</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div
        v-if="user.phoneNumber !== '+70000000001'"
        class="py-5 flex mt-24 items-start justify-between gap-10 max-xl:flex-col max-xl:items-center"
      >
        <h1 class="text-2xl text-center">
          Изменить личные данные пользователя
        </h1>
        <div
          class="shadow-2xl p-10 border-2 border-dashed border-secondary-color w-full max-w-[900px]"
        >
          <div class="mb-5">
            <label
              for="phone"
              class="block text-sm font-medium leading-6 text-gray-900"
              >Телефон</label
            >
            <input
              type="text"
              v-model="phoneNumber"
              class="block mt-3 w-full bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
              name="phone"
            />
          </div>
          <div class="mb-5">
            <label
              for="phone"
              class="block text-sm font-medium leading-6 text-gray-900"
              >ФИО</label
            >
            <input
              type="text"
              v-model="fio"
              class="block mt-3 w-full bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
              name="phone"
            />
          </div>
          <div class="mb-5" v-if="isShowChangePassword">
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Старый пароль</label
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
          <div class="mb-5" v-if="isShowChangePassword">
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Новый пароль</label
              >
            </div>
            <div class="mt-2 relative">
              <input
                v-model="newPassword"
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
          <div class="mb-5" v-if="isShowChangePassword">
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Подтвердите новый пароль</label
              >
            </div>
            <div class="mt-2 relative">
              <input
                v-model="newPasswordRepeat"
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
          <div class="mb-10" v-if="isShowPasswordInput">
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="block text-sm font-medium leading-6 text-gray-900"
                >Подтвердите пароль</label
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
          <h1 class="text-center font-bold text-red-500 mb-5">
            {{ errorTextValidation }}
          </h1>
          <div
            class="flex items-center justify-end gap-5 mt-10 max-sm:flex-col"
          >
            <UIMainButton class="max-sm:w-full" @click="showChangePassword"
              >Поменять пароль</UIMainButton
            >
            <UIMainButton
              :disabled="user.phoneNumber === '+70000000001'"
              class="max-sm:w-full"
              @click="saveChanges"
              >Сохранить</UIMainButton
            >
          </div>
        </div>
      </div>
      <div v-else>
        <UModal
          :ui="{
            container: 'flex items-center justify-center text-center',
          }"
          v-auto-animate
          v-model="isOpenModalNoRegistration"
          prevent-close
        >
          <UCard
            v-auto-animate
            :ui="{
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Авторизация
                </h3>
                <Icon
                  @click="router.push('/client/main?notification=false')"
                  name="i-heroicons-x-mark-20-solid"
                  size="24"
                  class="cursor-pointer hover:text-secondary-color duration-200"
                />
              </div>
            </template>
            <div class="text-center">
              <h1>
                После входа вам будет доступен полный функционал личного
                кабинета!
              </h1>
              <div class="max-md:flex items-center justify-center">
                <UButton
                  @click="router.push('/auth/client')"
                  class="my-3 font-semibold uppercase"
                  >Войти или зарегистрироваться</UButton
                >
              </div>
            </div>
          </UCard>
        </UModal>
      </div>
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
