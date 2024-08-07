<script lang="ts" setup>
import { useUsersStore } from "../stores/users";

const router = useRouter();
const route = useRoute();
const storeClients = useClientsStore();
let user = ref({} as Client);
let isOpen = ref(false);
let requests = ref<Array<IBalance>>();
let requests2 = ref<Array<IAdvanceReport>>();

function signOut() {
  storeClients.signOut();
}

function editMenu() {
  isOpen.value = !isOpen.value;
}

onMounted(async () => {
  user.value = storeClients.getClient();
});

let isShowInfo = ref(false);
</script>
<template>
  <div
    class="fixed z-50 backdrop-blur-2xl w-full h-screen flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 max-w-[16rem] p-4 shadow-xl shadow-blue-gray-900/5 max-xl:hidden overflow-y-auto"
    v-if="isOpen"
  >
    <div class="p-4 flex justify-between items-center">
      <h1 class="font-bold text-xl text-secondary-color">DAROM.PRO</h1>
      <Icon
        @click="editMenu"
        name="ooui:arrow-previous-ltr"
        size="20"
        class="hover:text-orange-300 duration-200 cursor-pointer"
      />
    </div>
    <nav
      class="flex flex-col gap-1 min-w-[240px] p-2 font-sans text-base font-normal text-gray-700 overflow-y-auto"
    >
      <div
        role="button"
        @click="router.push('/client/order'), editMenu()"
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
        @click="router.push('/client/delivery'), editMenu()"
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
        @click="router.push('/client/my-orders'), editMenu()"
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
        @click="router.push('/client/goods'), editMenu()"
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
        @click="router.push('/client/profile'), editMenu()"
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
      <UIMainButton @click="isShowInfo = true" class="mt-5"
        >Важная информация</UIMainButton
      >
    </nav>
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
        <h1 class="font-bold text-2xl text-center mb-5 text-secondary-color">ВАЖНАЯ ИНФОРМАЦИЯ</h1>
        <div>
          <h1 class="font-bold text-xl">Стоимость доставки:</h1>
          <h1 class="italic text-base">
            ≈10% от стоимости товара
          </h1>
        </div>
        <div class="mt-3">
          <h1 class="font-bold text-xl">Невозвратные товары:</h1>
          <ul class="list-disc px-5 max-sm:px-3">
            <li class="italic">товары Ozon global</li>
            <li class="max-h-[150px] italic overflow-auto">
              товары WB парфюмерия, косметика, предметы личной гигиены, бытовая химия,
              лекарственные ср-ва, пищевые продукты, ювелирные украшения, нижнее белье,
              термобелье, постельное белье, купальник, плавки, носки, колготки, технически
              сложные устройства (смартфоны, планшеты и т.п.)
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

  <div
    class="absolute bg-gradient-to-tr from-white via-white to-yellow-100 bg-image top-0 bottom-0 left-0 right-0 z-50 hidden max-xl:flex items-center justify-center bg-white"
    v-if="isOpen"
  >
    <Icon
      name="material-symbols:close"
      class="absolute duration-200 cursor-pointer hover:text-orange-400 top-2 right-4"
      size="40"
      @click="editMenu"
    />
    <nav
      class="flex flex-col gap-1 min-w-[240px] p-2 font-sans text-base font-normal text-gray-700"
    >
      <h1 class="text-center font-bold text-3xl text-secondary-color mb-5">DAROM.PRO</h1>
      <div
        role="button"
        @click="router.push('/client/order'), editMenu()"
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
        @click="router.push('/client/delivery'), editMenu()"
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
        @click="router.push('/client/my-orders'), editMenu()"
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
        @click="router.push('/client/goods'), editMenu()"
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
        @click="router.push('/client/profile'), editMenu()"
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
      <UIMainButton @click="isShowInfo = true" class="mt-5"
        >Важная информация</UIMainButton
      >
    </nav>
  </div>

  <div
    v-else
    :class="{
      absolute:
        route.fullPath.includes('+') ||
        route.fullPath === '/spreadsheets/our-ransom' ||
        route.fullPath === '/spreadsheets/client-ransom',
    }"
    class="py-1 px-3 fixed z-40 max-xl:right-0 flex items-center max-sm:gap-3 justify-between duration-200 w-full bg-gradient-to-br from-purple-700 to-orange-400 backdrop-blur-2xl text-white"
  >
    <div class="flex items-center gap-1">
      <Icon
        @click="editMenu"
        size="40"
        name="material-symbols-light:menu"
        class="hover:opacity-50 duration-200 cursor-pointer"
      />
      <h1 class="font-medium">{{ user.fio }}</h1>
    </div>
    <Icon
      @click="router.go(-1)"
      name="material-symbols:arrow-back-rounded"
      size="32"
      class="cursor-pointer hover:opacity-50 duration-200"
    />
  </div>
</template>
