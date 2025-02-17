<script setup lang="ts">
const emits = defineEmits(["editMenu", "signOut"]);

function editMenu() {
  emits("editMenu");
}

function signOut() {
  emits("signOut");
}
const storeUsers = useUsersStore();
const settings = ref<Array<any>>([]);
onMounted(async () => {
  settings.value = await storeUsers.getSettings();
});

const router = useRouter();

let isShowInfo = ref(false);
</script>
<template>
  <div>
    <aside
      v-auto-animate
      id="sidebar-multi-level-sidebar"
      class="fixed top-0 left-0 z-[200] w-72 h-screen transition-transform -translate-x-full sm:translate-x-0 max-sm:hidden"
      aria-label="Sidebar"
    >
      <div
        v-auto-animate
        class="h-full py-4 overflow-y-auto bg-gray-50 shadow-2xl dark:bg-gray-800"
      >
        <div
          class="flex items-center px-3 justify-between mb-3 pb-2 border-b-[1px] border-black"
        >
          <NuxtLink
            v-if="settings[0]"
            :to="'/client/main?notification=false'"
            @click="editMenu"
            class="text-3xl cursor-pointer text-secondary-color font-bold uppercase dark:text-gray-400"
          >
            {{ settings[0].title }}
          </NuxtLink>
          <div
            @click="editMenu"
            class="hover:bg-orange-100 cursor-pointer duration-200 hover:text-secondary-color pt-2 px-1.5 rounded-xl"
          >
            <Icon
              name="material-symbols:close-small-outline-rounded"
              size="32"
            />
          </div>
        </div>

        <div v-auto-animate class="px-3">
          <div v-auto-animate>
            <ul class="space-y-2 font-medium">
              <li>
                <NuxtLink
                  :to="'/?home=true'"
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white bg-gray-100 dark:hover:bg-gray-700 justify-center group cursor-pointer"
                >
                  <Icon
                    class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                    name="material-symbols:home-and-garden-rounded"
                    size="24"
                  />
                  <span class="flex-1 ms-3 whitespace-nowrap">На главную</span>
                </NuxtLink>
              </li>

              <li>
                <NuxtLink
                  :to="'/client/delivery/main'"
                  @click="editMenu"
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
                >
                  <Icon
                    class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                    name="i-mdi-truck-delivery"
                    size="24"
                  />
                  <span class="flex-1 ms-3 whitespace-nowrap">
                    Оформить доставку Вашего <br />
                    заказа по Штрих-коду (QR) (* от 0%)
                  </span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  :to="'/client/order'"
                  @click="editMenu"
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
                >
                  <Icon
                    class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                    name="i-material-symbols-order-approve-rounded"
                    size="24"
                  />
                  <span class="flex-1 ms-3 whitespace-nowrap">
                    Оформить заказ (* от 5%)
                  </span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  :to="'/client/my-orders'"
                  @click="editMenu"
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
                >
                  <Icon
                    class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                    name="i-material-symbols-shopping-cart"
                    size="24"
                  />
                  <span class="flex-1 ms-3 whitespace-nowrap">Мои заказы</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  :to="'/client/order/accept-order?card=true'"
                  @click="editMenu"
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
                >
                  <Icon
                    class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                    name="i-mdi-basket-check"
                    size="24"
                  />
                  <span class="flex-1 ms-3 whitespace-nowrap">Моя корзина</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  :to="'/client/goods'"
                  @click="editMenu"
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
                >
                  <Icon
                    class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                    name="i-material-symbols-light-shopping-bag"
                    size="24"
                  />
                  <span class="flex-1 ms-3 whitespace-nowrap">
                    Купленные товары
                  </span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  :to="'/client/profile'"
                  @click="editMenu"
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
                >
                  <Icon
                    class="text-gray-500 transition duration-75 group-hover:text-gray-900"
                    name="i-material-symbols-settings-account-box"
                    size="24"
                  />
                  <span class="flex-1 ms-3 whitespace-nowrap"
                    >Личные данные</span
                  >
                </NuxtLink>
              </li>
              <li>
                <div
                  class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
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
            class="mt-5 flex items-center justify-center w-full"
          >
            Важная информация
          </UIMainButton>
        </div>
      </div>
    </aside>

    <UINewModalEdit v-show="isShowInfo" @close-modal="isShowInfo = !isShowInfo">
      <template v-slot:icon-header> </template>
      <template v-slot:header> ВАЖНАЯ ИНФОРМАЦИЯ </template>
      <template v-slot:body>
        <div class="text-left px-0">
          <div>
            <h1 class="font-bold text-xl">Стоимость доставки:</h1>
            <h1 class="italic text-base">≈7% от стоимости товара</h1>
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
