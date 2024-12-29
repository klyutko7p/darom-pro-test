<script setup lang="ts">
import Cookies from "js-cookie";

const storeClients = useClientsStore();
const router = useRouter();
const route = useRoute();

let isLoading = ref(false);

let user = ref({} as User);
const token = Cookies.get("token");
let marketplaceData = ref("");
onMounted(async () => {
  if (route.query.marketplace) {
    marketplaceData.value = route.query.marketplace as string;
  }

  isLoading.value = true;
  user.value = await storeClients.getClient();
  isLoading.value = false;
});
</script>

<template>
  <div
    :class="{
      'bg-gradient-to-br from-purple-700 to-orange-400':
        route.fullPath !== '/client/order/independently/ozon' &&
        route.fullPath !== '/client/order/independently/wb' &&
        route.fullPath !== '/client/order/independently/ym',
      'bg-[#005df6]': route.fullPath === '/client/order/independently/ozon',
      'bg-gradient-to-r from-[#7c2570] via-[#bb3c95] to-[#ec208b]':
        route.fullPath === '/client/order/independently/wb',
      'bg-[#f8cf02]': route.fullPath === '/client/order/independently/ym',
    }"
    class="py-1 px-3 fixed z-40 max-xl:right-0 flex items-center max-sm:gap-3 justify-between duration-200 w-full backdrop-blur-2xl text-white"
  >
    <div class="flex items-center gap-1">
      <Icon
        @click="router.push('/?home=true')"
        size="24"
        name="material-symbols:home-and-garden-rounded"
        class="hover:opacity-50 duration-200 cursor-pointer mr-2"
      />
    </div>
    <Icon
      v-if="
        !route.fullPath.includes('/auth/client?marketplace') &&
        !route.fullPath.includes('/auth/client?card')
      "
      @click="router.go(-1)"
      name="ion:ios-arrow-back"
      size="32"
      class="cursor-pointer hover:opacity-50 duration-200"
    />
    <Icon
      v-if="route.fullPath.includes('/auth/client?marketplace=wb')"
      @click="router.push('/client/delivery?marketplace=wb')"
      name="ion:ios-arrow-back"
      size="32"
      class="cursor-pointer hover:opacity-50 duration-200"
    />
    <Icon
      v-if="route.fullPath.includes('/auth/client?marketplace=ozon')"
      @click="router.push('/client/delivery?marketplace=ozon')"
      name="ion:ios-arrow-back"
      size="32"
      class="cursor-pointer hover:opacity-50 duration-200"
    />
    <Icon
      v-if="route.fullPath.includes('/auth/client?marketplace=ym')"
      @click="router.push('/client/delivery?marketplace=ym')"
      name="ion:ios-arrow-back"
      size="32"
      class="cursor-pointer hover:opacity-50 duration-200"
    />
    <Icon
      v-if="route.fullPath.includes('/auth/client?card=true')"
      @click="router.push('/client/order/accept-order?card=true')"
      name="ion:ios-arrow-back"
      size="32"
      class="cursor-pointer hover:opacity-50 duration-200"
    />
  </div>
</template>
