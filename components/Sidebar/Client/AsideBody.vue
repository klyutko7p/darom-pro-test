<script setup lang="ts">
const emits = defineEmits(["editMenu", "signOut"]);

function editMenu() {
  emits("editMenu");
}

function signOut() {
  emits("signOut");
}

const router = useRouter();

let isShowInfo = ref(false);
</script>
<template>
  <div>
    <div v-auto-animate class="px-3">
      <div v-auto-animate>
        <ul class="space-y-5 font-medium">
          <li>
            <div
              class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 justify-center group cursor-pointer"
              @click="router.push('/?home=true')"
            >
              <Icon
                class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                name="material-symbols:home-and-garden-rounded"
                size="24"
              />
              <span class="flex-1 ms-3 whitespace-nowrap">На главную</span>
            </div>
          </li>
          <li>
            <div
              class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 group cursor-pointer"
              @click="router.push('/client/order'), editMenu()"
            >
              <Icon
                class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                name="i-material-symbols-order-approve-rounded"
                size="24"
              />
              <span class="flex-1 ms-3 whitespace-nowrap">Оформить заказ</span>
            </div>
          </li>
          <li>
            <div
              class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 group cursor-pointer"
              @click="router.push('/client/delivery'), editMenu()"
            >
              <Icon
                class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                name="i-mdi-truck-delivery"
                size="24"
              />
              <span class="flex-1 ms-3 whitespace-nowrap"
                >Оформить доставку Вашего
                <br class="max-[500px]:block hidden" />
                заказа <br class="max-[500px]:hidden block" />
                из интернет-магазина <br class="max-[500px]:block hidden" />
                по Штрих-коду (QR)</span
              >
            </div>
          </li>
          <li>
            <div
              class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 group cursor-pointer"
              @click="router.push('/client/my-orders'), editMenu()"
            >
              <Icon
                class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                name="i-material-symbols-shopping-cart"
                size="24"
              />
              <span class="flex-1 ms-3 whitespace-nowrap">Мои заказы</span>
            </div>
          </li>
          <li>
            <div
              class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 group cursor-pointer"
              @click="
                router.push('/client/order/accept-order?card=true'), editMenu()
              "
            >
              <Icon
                class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                name="i-mdi-basket-check"
                size="24"
              />
              <span class="flex-1 ms-3 whitespace-nowrap">Моя корзина</span>
            </div>
          </li>
          <li>
            <div
              class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
              @click="router.push('/client/goods'), editMenu()"
            >
              <Icon
                class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                name="i-material-symbols-light-shopping-bag"
                size="24"
              />
              <span class="flex-1 ms-3 whitespace-nowrap"
                >Купленные товары</span
              >
            </div>
          </li>
          <li>
            <div
              class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
              @click="router.push('/client/profile'), editMenu()"
            >
              <Icon
                class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                name="i-material-symbols-settings-account-box"
                size="24"
              />
              <span class="flex-1 ms-3 whitespace-nowrap">Личные данные</span>
            </div>
          </li>
          <li>
            <a
              class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
              href="https://t.me/Svetlana_Darompro"
              target="_blank"
            >
              <Icon
                class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                name="material-symbols:contact-support"
                size="24"
              />
              <span class="flex-1 ms-3 whitespace-nowrap"
                >Служба поддержки</span
              >
            </a>
          </li>
          <li>
            <div
              class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
              @click="signOut"
            >
              <Icon
                class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                name="i-majesticons-door-exit"
                size="24"
              />
              <span class="flex-1 ms-3 whitespace-nowrap">Выйти</span>
            </div>
          </li>
        </ul>
      </div>
      <UIMainButton
        @click="isShowInfo = true"
        class="mt-5 w-full max-w-[300px] mx-auto"
        >Важная информация</UIMainButton
      >
    </div>

    <UINewModalEdit v-show="isShowInfo" @close-modal="isShowInfo = !isShowInfo">
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
                бытовая химия, лекарственные ср-ва, пищевые продукты, ювелирные
                украшения, нижнее белье, термобелье, постельное белье,
                купальник, плавки, носки, колготки, технически сложные
                устройства (смартфоны, планшеты и т.п.)
              </li>
            </ul>
          </div>
          <div class="mt-3">
            <h1
              class="font-bold text-lg text-left max-sm:text-left max-sm:text-lg"
            >
              Проверяйте товары в пункте выдачи на комплектность, размер и брак.
              <br />
              Возврат из дома не принимаем!
            </h1>
          </div>
          <div class="mt-3">
            <h1
              class="font-bold text-lg text-left max-sm:text-left max-sm:text-lg"
            >
              При заказе товаров OZON GLOBAL и WB доставка из-за рубежа, с Вами
              свяжется менеджер для внесения предоплаты
            </h1>
          </div>
        </div>
      </template>
    </UINewModalEdit>
  </div>
</template>
