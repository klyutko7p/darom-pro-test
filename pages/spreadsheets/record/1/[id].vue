<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const router = useRouter();
const route = useRoute();
const id = +route.params.id;
const link = route.name?.toString();

let isLoading = ref(false);

let user = ref({} as User);
let row = ref({} as IOurRansom);

async function updateDeliveryRow(obj: any) {
  await storeRansom.updateDeliveryStatus(
    obj.row,
    obj.flag,
    "OurRansom",
    user.value.username
  );
  row.value = await storeRansom.getRansomRow(id, "OurRansom");
}

const settings = ref<Array<any>>([]);
onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  settings.value = await storeUsers.getSettings();
  row.value = await storeRansom.getRansomRow(id, "OurRansom");
  isLoading.value = false;
});

definePageMeta({
  layout: false,
});

function getActualNameSite() {
  let link = window.location.href.split("/")[2].split("/")[0];
  return link;
}

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
          <RecordBody
            v-if="settings[0]"
            :link="link"
            :user="user"
            :row="row"
            :value="`https://${getActualNameSite()}/spreadsheets/record/1/${
              row.id
            }`"
            @update-delivery-row="updateDeliveryRow"
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
          <RecordBody
            v-if="settings[0]"
            :link="link"
            :user="user"
            :row="row"
            :value="`https://${getActualNameSite()}/spreadsheets/record/1/${
              row.id
            }`"
            @update-delivery-row="updateDeliveryRow"
          />
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
