<script setup lang="ts">
import Cookies from "js-cookie";

const storeClients = useClientsStore();
const router = useRouter();

let client = ref({} as Client);
const token = Cookies.get("token");
let isLoading = ref(false);

let pvzData = ref("");

onMounted(async () => {
  if (!token) {
    router.push("/auth/client/login");
  }
  requestPermission();

  pvzData.value = Cookies.get("addressCookie") || "";
  pvzData.value = pvzData.value.replace(/"/g, "");

  isLoading.value = true;
  client.value = await storeClients.getClient();
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
  await storeClients.createTokenDevice(client.value.phoneNumber, token);
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

const pvzs = [
  {
    pvz: "ПВЗ_1",
    name: "ул. Антропова 16",
  },
  {
    pvz: "ПВЗ_3",
    name: "ул. Палладина, 20",
  },
  {
    pvz: "ПВЗ_4",
    name: "ул. Нартова, 1",
  },
  {
    pvz: "ППВЗ_5",
    name: "ул. Дудинская, д. 4, кв. 7",
  },
  {
    pvz: "ППВЗ_7",
    name: "ул. Жебелева, д. 7",
  },
];

function clearCookies() {
  Cookies.remove("addressCookie");
  Cookies.remove("isNotAskingOzon");
  Cookies.remove("isNotAskingWB");
  Cookies.remove("isNotAskingYM");
  router.push("/client/order/independently/ozon?change=true");
}
</script>

<template>
  <Head>
    <Title>Главная страница</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token">
      <div class="py-5">
        <div class="flex items-center gap-3 mt-3">
          <div class="bg-secondary-color text-white pt-2 rounded-full px-1.5">
            <Icon name="i-material-symbols-package-2" size="32" />
          </div>
          <div class="flex flex-col gap-0">
            <span class="text-sm text-gray-400 font-semibold"
              >Пункт выдачи</span
            >
            <h1
              @click="clearCookies"
              class="text-lg font-semibold cursor-pointer hover:text-secondary-color duration-200"
            >
              {{
                pvzs.find((pvz) => pvz.pvz === pvzData)?.name
                  ? pvzs.find((pvz) => pvz.pvz === pvzData)?.name
                  : "Не выбран"
              }}
            </h1>
          </div>
        </div>
        <div class="mt-7 mb-1 flex items-center gap-3">
          <h1 v-if="client.fio" class="text-xl">
            Приветствуем, {{ client.fio }}!
          </h1>
          <h1 v-else class="text-xl mt-10 mb-10">
            Приветствуем!
            <span class="text-sm italic"
              >Вы можете настроить личные данные в соответствующей
              вкладке.</span
            >
          </h1>
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
          class="font-bold text-6xl max-[400px]:text-4xl max-md:text-center text-secondary-color mb-5"
        >
          DAROM.PRO
        </h1>

        <SidebarClientAsideBody
          :client="client"
          @sign-out="signOut"
          v-auto-animate
        />
      </div>

      <UINewModalEdit
        v-show="isShowInfo"
        @close-modal="isShowInfo = !isShowInfo"
      >
        <template v-slot:icon-header> </template>
        <template v-slot:header> ВАЖНАЯ ИНФОРМАЦИЯ </template>
        <template v-slot:body>
          <div class="text-left px-0">
            <div>
              <h1 class="font-bold text-xl">Стоимость доставки:</h1>
              <h1 class="italic text-base">≈10% от стоимости товара</h1>
            </div>
            <div class="mt-3">
              <h1 class="font-bold text-xl">Невозвратные товары:</h1>
              <ul class="list-disc px-5 max-sm:px-3">
                <li class="italic">товары Ozon global</li>
                <li class="max-h-[150px] italic overflow-auto">
                  товары WB парфюмерия, косметика, предметы личной гигиены,
                  бытовая химия, лекарственные ср-ва, пищевые продукты,
                  ювелирные украшения, нижнее белье, термобелье, постельное
                  белье, купальник, плавки, носки, колготки, технически сложные
                  устройства (смартфоны, планшеты и т.п.)
                </li>
              </ul>
            </div>
            <div class="mt-3">
              <h1
                class="font-bold text-lg text-left max-sm:text-left max-sm:text-lg"
              >
                Проверяйте товары в пункте выдачи на комплектность, размер и
                брак. <br />
                Возврат из дома не принимаем!
              </h1>
            </div>
            <div class="mt-3">
              <h1
                class="font-bold text-lg text-left max-sm:text-left max-sm:text-lg"
              >
                При заказе товаров OZON GLOBAL и WB доставка из-за рубежа, с
                Вами свяжется менеджер для внесения предоплаты
              </h1>
            </div>
          </div>
        </template>
      </UINewModalEdit>
    </div>
  </div>
  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
