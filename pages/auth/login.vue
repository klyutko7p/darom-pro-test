<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const router = useRouter();

const username = ref("");
const password = ref("");
const message = ref("");

let isLoading = ref(false);

async function signIn() {
  isLoading.value = true;
  message.value = await storeUsers.signIn(username.value, password.value);
  isLoading.value = false;
}

let user = ref({} as User);
const token = Cookies.get("token");

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  isLoading.value = false;

  if (token && user.value.role === 'ADMIN') {
    router.push("/admin/main");
  } else if (token && user.value.role === 'USER') {
    router.push("/user/main")
  }
});
</script>

<template>
  <Head>
    <Title>Авторизация</Title>
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
        Авторизация пользователя
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="signIn">
        <div>
          <label for="username" class="block text-sm font-medium leading-6 text-gray-900"
            >Имя пользователя</label
          >
          <div class="mt-2">
            <input
              v-model="username"
              id="username"
              name="username"
              type="text"
              autocomplete="username"
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
              >Пароль</label
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
        <div v-if="message !== ''">
          <h1 class="text-red-700">{{ message }}</h1>
        </div>
        <div class="flex items-center justify-center">
          <UIMainButton class="w-full">Войти</UIMainButton>
        </div>
        <div class="text-center underline text-secondary-color font-bold">
          <NuxtLink to="/auth/register">Или зарегистрируйтесь</NuxtLink>
        </div>
      </form>
    </div>
  </div>
  <div v-else class="flex items-center justify-center">
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
