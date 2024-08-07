<script setup lang="ts">
import Cookies from "js-cookie";

const storeClients = useClientsStore();
const router = useRouter();

let user = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }
  requestPermission();

  isLoading.value = true;
  user.value = await storeClients.getClient();
  isLoading.value = false;
});

function signOut() {
  storeClients.signOut();
}

// import { useFirebaseApp } from "vuefire";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";

// const firebaseApp = useFirebaseApp();
// const messaging = getMessaging(firebaseApp);
// onMessage(messaging, (payload) => {
//   console.log(payload);
// });

// async function requestPermission() {
//   const permission = await Notification.requestPermission();
//   if (permission === "granted") {
//     const currentToken = await getToken(messaging, {
//       vapidKey:
//         "BLA8pMjiR3G7gYFd09kR1ZSHyIypsNJlQV5ZP-uXtW0_eslYlfZjpVHmE9XwMu_91v8BhEarXKFJiXKJFMk3QTk",
//     });
//     if (currentToken) {
//       console.log(currentToken);
//     }
//   } else if (permission === "denied") {
//     console.log("Denied for the notification");
//   }
// }

import { getToken } from "firebase/messaging";

const messagingToken = ref("");

async function setToken() {
  const { $messaging } = useNuxtApp();
  const token = await getToken($messaging, {
    vapidKey:
      "BLA8pMjiR3G7gYFd09kR1ZSHyIypsNJlQV5ZP-uXtW0_eslYlfZjpVHmE9XwMu_91v8BhEarXKFJiXKJFMk3QTk",
  });
  messagingToken.value = token;
  await storeClients.createTokenDevice(user.value.phoneNumber, token);
}

// async function sendMessage() {
//   await storeClients.sendMessageToClient("Статус заказа", "Заказ готов к выдаче!", user.value.phoneNumber);
// }

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

definePageMeta({
  layout: "client",
});

let isShowInfo = ref(false);
</script>

<template>
  <Head>
    <Title>Главная страница</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="py-5">
        <h1 v-if="user.fio" class="text-xl mt-10 mb-10">Приветствуем, {{ user.fio }}!</h1>
        <h1 v-else class="text-xl mt-10 mb-10">
          Приветствуем!
          <span class="text-sm italic"
            >Вы можете настроить личные данные в соответствующей вкладке.</span
          >
        </h1>
        <h1
          class="font-bold text-6xl max-[400px]:text-4xl max-md:text-center text-secondary-color mb-5"
        >
          DAROM.PRO
        </h1>

        <div
          role="button"
          @click="router.push('/client/order')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="material-symbols-light:order-approve-outline" size="20" />
          </div>
          <h1>Оформить заказ</h1>
        </div>
        <div
          role="button"
          @click="router.push('/client/delivery')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="carbon:delivery-truck" size="20" />
          </div>
          <h1>Доставить мой заказ</h1>
        </div>
        <div
          role="button"
          @click="router.push('/client/my-orders')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="material-symbols:shopping-cart-outline" size="20" />
          </div>
          <h1>Мои заказы</h1>
        </div>
        <div
          role="button"
          @click="router.push('/client/goods')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon
              name="streamline:shopping-bag-hand-bag-2-shopping-bag-purse-goods-item-products"
              size="20"
            />
          </div>
          <h1>Купленные товары</h1>
        </div>
        <div
          role="button"
          @click="router.push('/client/profile')"
          tabindex="0"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <Icon name="material-symbols:settings-account-box-outline" size="20" />
          </div>
          <h1>Личные данные</h1>
        </div>
        <div
          role="button"
          tabindex="0"
          @click="signOut()"
          class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        >
          <div class="grid place-items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              class="h-5 w-5"
            >
              <path
                fill-rule="evenodd"
                d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          Выйти
        </div>
        <div class="flex gap-3 mt-5 max-sm:flex-col">
          <UIMainButton @click="requestPermission"
            >Подписаться на обновления</UIMainButton
          >
          <UIMainButton @click="isShowInfo = true">Важная информация</UIMainButton>
        </div>
      </div>
      <div
        v-if="isShowInfo"
        class="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-70 z-[200]"
      >
        <div class="h-screen flex items-center justify-center max-sm:px-2">
          <div class="bg-white relative py-10 px-5 max-sm:px-3 rounded-2xl max-w-[500px]">
            <Icon
              class="absolute top-0 right-0 hover:text-secondary-color duration-200 cursor-pointer"
              name="material-symbols:close-small"
              size="40"
              @click="isShowInfo = false"
            />
            <h1 class="font-bold text-2xl text-center mb-5 text-secondary-color">
              ВАЖНАЯ ИНФОРМАЦИЯ
            </h1>
            <div>
              <h1 class="font-bold text-xl">Стоимость доставки:</h1>
              <h1 class="italic text-base">≈10% от стоимости товара</h1>
            </div>
            <div class="mt-3">
              <h1 class="font-bold text-xl">Невозвратные товары:</h1>
              <ul class="list-disc px-5 max-sm:px-3">
                <li class="italic">товары Ozon global</li>
                <li class="max-h-[150px] italic overflow-auto">
                  товары WB парфюмерия, косметика, предметы личной гигиены, бытовая химия,
                  лекарственные ср-ва, пищевые продукты, ювелирные украшения, нижнее
                  белье, термобелье, постельное белье, купальник, плавки, носки, колготки,
                  технически сложные устройства (смартфоны, планшеты и т.п.)
                </li>
              </ul>
            </div>
            <div class="mt-3">
              <h1 class="font-bold text-xl text-center max-sm:text-left max-sm:text-lg">
                Проверяйте товары в пункте выдачи на комплектность, размер и брак. <br />
                Возврат из дома не принимаем!
              </h1>
            </div>
            <div class="mt-3">
              <h1 class="font-bold text-xl text-center max-sm:text-left max-sm:text-lg">
                При заказе товаров OZON GLOBAL и WB доставка из-за рубежа, с Вами свяжется менеджер для внесения предоплаты
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
