<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
import { useClientsStore } from "../stores/clients";

const toast = useToast();

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storeClients = useClientsStore();

const router = useRouter();

const user = ref<User>({} as User);
const clients = ref<Client[]>([]);
const isLoading = ref(false);
const isScanActive = ref(false);
const scanStringItem = ref("");
const scannedLink = ref("");
const arrayOfRows = ref<IOurRansom[]>([]);
const rowData = ref<IOurRansom | null>(null);
const myInput = ref<HTMLInputElement | null>(null);
const selectedPVZ = ref(Cookies.get("selectedPVZ") || "");
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const token = Cookies.get("token");

onMounted(async () => {
  if (!token) {
    return router.push("/auth/login");
  }

  isLoading.value = true;
  try {
    user.value = await storeUsers.getUser();
  } catch (error) {
    toast.error("Failed to fetch user or clients data.");
  } finally {
    isLoading.value = false;
    focusInput();
  }
});

definePageMeta({
  layout: false,
  name: "Приёмка коробок",
});

function focusInput() {
  isScanActive.value = true;
  myInput.value?.focus();
}

function convertToURL(inputString: string) {
  if (inputString.includes("/")) {
    const parts = inputString.split("/");
    const entryID = parts[parts.length - 1];
    return entryID;
  } else if (inputString.includes(".")) {
    const parts = inputString.split(".");
    const entryID = parts[parts.length - 1];
    return entryID;
  }
}

const storeBoxes = useBoxesStore();
const box = ref({} as Box);
const boxesScanned = ref<Array<Box>>([]);
async function scanItem() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(async () => {
    let scannedLink = scanStringItem.value.trim() as string;
    scannedLink = convertToURL(scannedLink);
    console.log(scannedLink);
    storeRansom.announce(`ID ${+scannedLink}`);
    box.value = await storeBoxes.getBoxById(+scannedLink);

    if (selectedPVZ.value === box.value.dispatchPVZ) {
      boxesScanned.value.push(box.value);

      if (!box.value.delivered) {
        box.value.delivered = new Date();
        await storeBoxes.updateBox(box.value);
        toast.success("У коробки изменён статус на «Доставлено»!");
        return;
      } else {
        toast.warning("Коробка уже доставлена!");
      }
    } else {
      toast.error("Это коробка другого ПВЗ!");
    }
  }, 1000);
}

function updateCookies() {
  Cookies.set("selectedPVZ", selectedPVZ.value, { expires: 7 });
}

watch(selectedPVZ, updateCookies);

watch(scanStringItem, (newValue) => {
  if (newValue) scanItem();
});
</script>

<template>
  <Head>
    <Title>Приёмка</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-10">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="mb-3 font-bold text-xl">
                Выберите нужное ПВЗ, чтобы начать приёмку!
              </h1>
              <select
                class="py-1 px-2 border-2 bg-transparent rounded-lg text-base"
                v-model="selectedPVZ"
                @change="updateCookies"
                name="pvz"
              >
                <option disabled value="">Выберите ПВЗ</option>
                <option v-for="pvz in user.PVZ">{{ pvz }}</option>
              </select>
            </div>
            <UButton
              @click="router.push('/acceptance')"
              icon="i-lsicon-goods-outline"
              class="font-semibold"
              >Приёмка товаров</UButton
            >
          </div>
          <div
            class="flex items-center flex-col justify-center gap-5 mt-10"
            v-if="selectedPVZ"
          >
            <div class="flex items-center gap-5">
              <UIMainButton @click="focusInput"
                >СКАНИРОВАТЬ коробку</UIMainButton
              >
              <Icon
                v-if="isScanActive"
                name="eos-icons:bubble-loading"
                class="text-secondary-color"
              />
            </div>
            <input
              ref="myInput"
              class="opacity-0"
              autofocus
              v-model="scanStringItem"
              @input="scanItem"
            />
            <div
              class="w-full rounded-md bg-gray-100 py-5 flex items-center flex-col justify-center"
            >
              <DistributionBoxesTable
                v-if="boxesScanned.length"
                :user="user"
                :boxes="boxesScanned"
                class="w-full px-2"
              />
            </div>
          </div>
        </div>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="user">
        <div class="mt-10">
          <div>
            <h1 class="mb-3 font-bold text-xl">
              Выберите нужное ПВЗ, чтобы начать приёмку!
            </h1>
            <select
              class="py-1 px-2 border-2 bg-transparent rounded-lg text-base"
              v-model="selectedPVZ"
              name="pvz"
            >
              <option disabled value="">Выберите ПВЗ</option>
              <option v-for="pvz in user.PVZ">{{ pvz }}</option>
            </select>
          </div>
          <div
            class="flex items-center flex-col justify-center gap-5 mt-10"
            v-if="selectedPVZ"
          >
            <div class="flex items-center gap-5">
              <UIMainButton @click="focusInput"
                >СКАНИРОВАТЬ коробку</UIMainButton
              >
              <Icon
                v-if="isScanActive"
                name="eos-icons:bubble-loading"
                class="text-secondary-color"
              />
            </div>
            <input
              ref="myInput"
              class="opacity-0"
              autofocus
              v-model="scanStringItem"
              @input="scanItem"
            />
            <div
              class="w-full rounded-md bg-gray-100 py-5 flex items-center flex-col justify-center"
            >
              <DistributionBoxesTable
                v-if="boxesScanned.length"
                :user="user"
                :boxes="boxesScanned"
                class="w-full px-2"
              />
            </div>
          </div>
        </div>
      </NuxtLayout>
    </div>
  </div>

  <div v-else>
    <NuxtLayout name="default">
      <UISpinner />
    </NuxtLayout>
  </div>
</template>
