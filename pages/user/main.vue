<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const router = useRouter();

let user = ref({} as User);
const token = Cookies.get("token");
let isLoading = ref(false);
const settings = ref<Array<any>>([]);
onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }
  settings.value = await storeUsers.getSettings();
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  isLoading.value = false;
  await storeRansom.getSumOfRejection();
});

function signOut() {
  storeUsers.signOut();
}

definePageMeta({
  layout: "user",
});

import { getToken } from "firebase/messaging";

const messagingToken = ref("");

async function setToken() {
  const { $messaging } = useNuxtApp();
  const token = await getToken($messaging, {
    vapidKey:
      "BLA8pMjiR3G7gYFd09kR1ZSHyIypsNJlQV5ZP-uXtW0_eslYlfZjpVHmE9XwMu_91v8BhEarXKFJiXKJFMk3QTk",
  });
  messagingToken.value = token;
  await storeUsers.createTokenDevice(user.value.username, token);
}

function requestPermission() {
  if (!window.Notification) return;

  if (window.Notification.permission === "granted") {
    setToken();
  } else {
    window.Notification.requestPermission((value) => {
      if (value === "granted") {
        setToken();
      }
    });
  }
}
</script>

<template>
  <Head>
    <Title>Главная страница</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="py-5">
        <div class="mt-5 mb-5 flex items-center gap-3">
          <h1 class="text-xl">Приветствуем, {{ user.username }}!</h1>
          <div
            @click="requestPermission"
            class="bg-orange-100 duration-200 cursor-pointer hover:opacity-50 pt-1 rounded-full px-1"
          >
            <Icon
              name="material-symbols:add-alert"
              size="24"
              class="text-secondary-color"
            />
          </div>
        </div>
        <h1
          v-if="settings[0]"
          class="font-bold text-6xl max-[400px]:text-4xl max-md:text-center text-secondary-color mb-5"
        >
          {{ settings[0].title }}
        </h1>
        <SidebarAsideBody :user="user" @sign-out="signOut" v-auto-animate />
      </div>
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
