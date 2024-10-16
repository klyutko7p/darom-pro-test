<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storePVZDelivery = usePVZDeliveryStore();
const router = useRouter();

const fields = ["название пвз", "адрес", "изменение", "удаление"];

let pvz = ref<Array<PVZ>>();
let pvzData = ref({} as PVZ);

async function createPVZ(obj: any) {
  isLoading.value = true;
  await storePVZDelivery.createPVZ(obj.name, obj.address);
  pvz.value = await storePVZDelivery.getPVZ();
  isLoading.value = false;
}

let isOpen = ref(false);
function openModal(row: PVZ) {
  isOpen.value = true;
  pvzData.value = JSON.parse(JSON.stringify(row));
}

function closeModal() {
  isOpen.value = false;
  pvzData.value = {} as PVZ;
}

async function updatePVZ() {
  isLoading.value = true;
  await storePVZDelivery.updatePVZ(pvzData.value);
  pvz.value = await storePVZDelivery.getPVZ();
  closeModal();
  isLoading.value = false;
}

async function deletePVZ(id: number) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данное ПВЗ?");
  if (answer) await storePVZDelivery.deletePVZ(id);
  pvz.value = await storePVZDelivery.getPVZ();
  isLoading.value = false;
}

let user = ref({} as User);
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  pvz.value = await storePVZDelivery.getPVZ();
  isLoading.value = false;
});

definePageMeta({
  layout: false,
});

function lockScroll() {
  document.body.classList.add("no-scroll");
}

function unlockScroll() {
  document.body.classList.remove("no-scroll");
}

watch(isOpen, (newValue) => {
  if (newValue) {
    lockScroll();
  } else {
    unlockScroll();
  }
});
</script>

<template>
  <Head>
    <Title>ПВЗ</Title>
  </Head>

  <div v-if="token && user.role === 'ADMIN'">
    <NuxtLayout name="table-admin-no-pad">
      <div
        v-if="!isLoading"
        class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5 w-screen"
      >
        <AdminDataTable2
          :fields="fields"
          :rows="pvz"
          @delete-row="deletePVZ"
          @open-modal="openModal"
        />

        <AdminDataCreate2 :title="'ПВЗ'" @create-data="createPVZ" />

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="tabler:home-signal" />
          </template>
          <template v-slot:header>
            <div class="custom-header">
              <h1>Изменение: {{ pvzData.name }}</h1>
            </div>
          </template>
          <template v-slot:body>
            <div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Название ПВЗ</label>
                <UInput class="w-full" v-model="pvzData.name" type="text" />
              </div>
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Адрес ПВЗ</label>
                <UInput class="w-full" v-model="pvzData.address" type="text" />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex gap-3 items-center justify-center">
              <UISaveModalButton @click="updatePVZ"
                >СОХРАНИТЬ</UISaveModalButton
              >
              <UIExitModalButton @click="closeModal">ЗАКРЫТЬ</UIExitModalButton>
            </div>
          </template>
        </UINewModalEdit>
      </div>

      <div class="w-screen" v-else>
        <UISpinner />
      </div>
    </NuxtLayout>
  </div>

  <div v-else-if="user.role === 'USER'">
    <NuxtLayout name="user">
      <h1>
        У вас недостаточно прав на просмотр этой информации. Обратитесь к
        администратору
      </h1>
    </NuxtLayout>
  </div>
</template>
