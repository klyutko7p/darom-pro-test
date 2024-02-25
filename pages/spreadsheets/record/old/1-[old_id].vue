<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const router = useRouter();
const route = useRoute();
const old_id = +route.params.old_id;
const link = route.name?.toString()

let isLoading = ref(false);

let user = ref({} as User);
let row = ref({} as IOurRansom);

async function updateDeliveryRow(obj: any) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите изменить статус доставки?");
  if (answer) await storeRansom.updateDeliveryStatus(obj.row, obj.flag, "OurRansom");
  row.value = await storeRansom.getOldRansomRow(old_id, "OurRansom");
  isLoading.value = false;
}

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  row.value = await storeRansom.getOldRansomRow(old_id, "OurRansom");
  isLoading.value = false;
});

definePageMeta({
  layout: false,
});

onMounted(() => {
  if (!token) {
    router.push("/auth/login");
  }
});

const token = Cookies.get("token");
</script>

<template>
  <Head>
    <Title>Запись - {{ old_id }}</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-5" v-if="!isLoading">
          <RecordBody :link="link" :user="user" :row="row" @update-delivery-row="updateDeliveryRow" />
          <!-- <RecordQR class="mt-10" :row="row"
            :value="`https://soft-praline-633324.netlify.app/spreadsheets/record/1/${row.id}`" /> -->
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div class="mt-5" v-if="!isLoading">
          <RecordBody :link="link" :user="user" :row="row" @update-delivery-row="updateDeliveryRow" />
          <!-- <RecordQR class="mt-10" :row="row"
            :value="`https://soft-praline-633324.netlify.app/spreadsheets/record/1/${row.id}`" /> -->
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
