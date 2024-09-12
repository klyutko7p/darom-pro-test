<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeEquipment = useEquipmentsStore();
const router = useRouter();
const route = useRoute();
const id = +route.params.id;
const link = route.name?.toString();

let isLoading = ref(false);

let user = ref({} as User);
let row = ref({} as IEquipmentRow);

onMounted(async () => {
  window.location.href = `https://darom.pro${route.fullPath}`
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  row.value = await storeEquipment.getEquipment(id);
  isLoading.value = false;
});

definePageMeta({
  layout: false,
});

const token = Cookies.get("token");
</script>

<template>
  <Head>
    <Title>Запись - {{ id }}</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-5" v-if="!isLoading">
          <RecordEquipmentBody
            :link="link"
            :row="row"
            :value="`https://darom.pro/equipment/record/${row.id}`"
          />
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div class="mt-5" v-if="!isLoading">
          <RecordEquipmentBody
            :link="link"
            :row="row"
            :value="`https://darom.pro/equipment/record/${row.id}`"
          />
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
