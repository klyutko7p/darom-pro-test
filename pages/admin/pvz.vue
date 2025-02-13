<script setup lang="ts">
import Cookies from "js-cookie";
import { usePVZStore } from "../../stores/pvz";

const storeUsers = useUsersStore();
const storePVZ = usePVZStore();
const router = useRouter();
const storeCells = useCellsStore();
const storePVZPercent = usePVZPercentStore();

const fields = ["название пвз", "изменение", "удаление"];

let pvz = ref<Array<PVZ>>();
let pvzData = ref({} as PVZ);

async function createPVZ() {
  isLoading.value = true;
  let createdPVZ = await storePVZ.createPVZ(pvzData.value);
  await storeCells.createCells(createdPVZ.name, 500);
  await storeCells.createCellsClient(createdPVZ.name, 100);
  let pvzDataOurRansom = {
    pvzId: createdPVZ.id,
    wb: 10,
    ozon: 10,
    ym: 10,
    flag: "OurRansom",
  } as IPVZPercent;

  let pvzDataClientRansom = {
    pvzId: createdPVZ.id,
    wb: 10,
    ozon: 10,
    ym: 10,
    flag: "ClientRansom",
  } as IPVZPercent;

  await storePVZPercent.createPVZ(pvzDataOurRansom);
  await storePVZPercent.createPVZ(pvzDataClientRansom);

  pvz.value = await storePVZ.getPVZ();
  closeModal();
  isLoading.value = false;
}

let isOpen = ref(false);
function openModal(row: PVZ) {
  isOpen.value = true;
  pvzData.value = JSON.parse(JSON.stringify(row));

  if (!pvzData.value.coordinates) {
    pvzData.value.coordinates = [];
  }
}

function closeModal() {
  isOpen.value = false;
  pvzData.value = {} as PVZ;
  pvzData.value.coordinates = [];
}

async function updatePVZ() {
  isLoading.value = true;
  await storePVZ.updatePVZ(pvzData.value);
  pvz.value = await storePVZ.getPVZ();
  closeModal();
  isLoading.value = false;
}

async function deletePVZ(id: number) {
  isLoading.value = true;
  let answer = confirm("Вы точно хотите удалить данное ПВЗ?");
  if (answer) await storePVZ.deletePVZ(id);
  pvz.value = await storePVZ.getPVZ();
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
  pvz.value = await storePVZ.getPVZ();
  isLoading.value = false;

  pvzData.value.coordinates = [];
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
    <NuxtLayout name="admin">
      <div v-if="!isLoading" class="bg-gray-50 px-5 pt-5 max-sm:px-1 pb-5">
        <AdminDataTablePVZ
          :rows="pvz"
          @delete-row="deletePVZ"
          @open-modal="openModal"
        />

        <UButton @click="openModal" class="mt-5 font-bold">Создать ПВЗ</UButton>

        <UINewModalEdit v-show="isOpen" @close-modal="closeModal">
          <template v-slot:icon-header>
            <Icon size="24" name="tabler:home-signal" />
          </template>
          <template v-slot:header>
            <div v-if="pvzData.id" class="custom-header">
              <h1>Создание</h1>
            </div>
            <div v-if="pvzData.id" class="custom-header">
              <h1>Изменение</h1>
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
              <div class="flex flex-col items-start text-left gap-2 mb-5">
                <label for="name">Координаты</label>
                <label for="name">1 число</label>
                <UInput
                  class="w-full"
                  v-model="pvzData.coordinates[0]"
                  type="number"
                />
                <label for="name">2 число</label>
                <UInput
                  class="w-full"
                  v-model="pvzData.coordinates[1]"
                  type="number"
                />
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <div class="flex gap-3 items-center justify-center">
              <UISaveModalButton v-if="pvzData.id" @click="updatePVZ"
                >СОХРАНИТЬ</UISaveModalButton
              >
              <UISaveModalButton v-if="!pvzData.id" @click="createPVZ"
                >СОЗДАТЬ</UISaveModalButton
              >
              <UIExitModalButton @click="closeModal">ЗАКРЫТЬ</UIExitModalButton>
            </div>
          </template>
        </UINewModalEdit>
      </div>

      <div v-else>
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
