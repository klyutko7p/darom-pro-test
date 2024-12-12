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
    clients.value = await storeClients.getClients();
  } catch (error) {
    toast.error("Failed to fetch user or clients data.");
  } finally {
    isLoading.value = false;
    focusInput();
  }
});

definePageMeta({
  layout: false,
  name: "Приёмка",
});

function focusInput() {
  isScanActive.value = true;
  myInput.value?.focus();
}

function formatPhoneNumber(phoneNumber: string) {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  if (digitsOnly.length < 11) {
    return "Неправильный формат номера телефона";
  }
  return `+7${"*".repeat(digitsOnly.length - 5)}${digitsOnly.slice(-4)}`;
}

function convertToURL(inputString: string): number {
  const parts = inputString.split(/[/.]/);
  return Number(parts[parts.length - 1]) || 0;
}

async function updateDeliveryRow(row: IOurRansom, flag: string) {
  try {
    await storeRansom.updateDeliveryStatus(
      row,
      flag,
      "OurRansom",
      user.value?.username || ""
    );
  } catch (error) {
    toast.error("Error updating delivery status.");
  }
}

async function acceptItem(row: IOurRansom) {
  if (!user.value) return toast.error("User data is not available.");

  const { role, PVZ } = user.value;

  if (["PVZ", "ADMINISTRATOR", "PPVZ", "ADMIN"].includes(role)) {
    if (
      PVZ.includes(row.dispatchPVZ) &&
      PVZ.includes(selectedPVZ.value) &&
      row.dispatchPVZ === selectedPVZ.value
    ) {
      if (row.deliveredPVZ === null && row.deliveredSC !== null) {
        await updateDeliveryRow(row, "PVZ");
        const client = clients.value.find(
          (client) => client.phoneNumber === row.fromName
        );
        if (client) {
          await storeClients.sendMessageToClient(
            "Статус заказа: Darom.pro",
            "Уважаемый клиент, Ваш заказ готов к получению.",
            row.fromName
          );
        }
        toast.success("Товар принят на ПВЗ!");
      } else if (row.deliveredPVZ !== null) {
        toast.warning("Товар принят ранее!");
      } else if (row.deliveredSC === null) {
        toast.warning("Товар неотсортирован!");
      } else {
        toast.error("Неизвестная ошибка!");
      }
    } else {
      toast.error(
        "У вас нет доступа к товарам данного ПВЗ или вы выбрали не то ПВЗ!"
      );
    }
  } else {
    toast.error("Отказано в доступе");
  }
}

async function scanItem() {
  if (timeoutId) clearTimeout(timeoutId);

  timeoutId = setTimeout(async () => {
    const trimmedScanString = scanStringItem.value.trim();
    if (!trimmedScanString) {
      console.warn("Сканированная строка пуста.");
      return;
    }

    scannedLink.value = trimmedScanString;
    const idRow = convertToURL(scannedLink.value);
    scanStringItem.value = "";

    try {
      rowData.value = await storeRansom.getRansomRowById(idRow, "OurRansom");
      if (rowData.value) {
        storeRansom.announce(`${rowData.value.cell}`);
        await acceptItem(rowData.value);
        arrayOfRows.value.push(rowData.value);
        console.log("Полученные данные:", rowData.value);
      } else {
        console.warn("Данные не найдены для idRow:", idRow);
      }
    } catch (error) {
      console.error("Ошибка при обработке данных:", error);
    } finally {
      scannedLink.value = "";
      rowData.value = null;
    }
  }, 1700);

  focusInput();
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
          <div
            class="flex items-center flex-col justify-center gap-5 mt-10"
            v-if="selectedPVZ"
          >
            <div class="flex items-center gap-5">
              <UIMainButton @click="focusInput">СКАНИРОВАТЬ qr клиента</UIMainButton>
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
            <div class="w-full gap-10 flex flex-col-reverse">
              <div
                v-for="row in arrayOfRows"
                class="border-2 border-dashed border-secondary-color p-5"
              >
                <div v-if="'clientLink1' in row">
                  <div class="mt-5 flex items-center justify-between">
                    <div>
                      <h1>ID: {{ row.id }}</h1>
                      <h1>{{ formatPhoneNumber(row.fromName) }}</h1>
                      <h1 class="text-4xl font-bold">{{ row.cell }}</h1>
                    </div>
                    <div class="text-right">
                      <h1>{{ row.productName }}</h1>
                      <a
                        class="text-secondary-color cursor-pointer duration-200 hover:opacity-50 border-b-2 border-secondary-color font-medium"
                        :href="row.productLink"
                      >
                        Ссылка на товар
                      </a>
                    </div>
                  </div>
                </div>
                <div v-if="'clientLink2' in row">
                  <div class="mt-5 flex items-center justify-between">
                    <div>
                      <h1>{{ row.id }}</h1>
                      <h1>{{ formatPhoneNumber(row.fromName) }}</h1>
                      <h1 class="text-4xl font-bold">{{ row.cell }}</h1>
                    </div>
                    <div class="text-right">
                      <h1>{{ row.productName }}</h1>
                      <a
                        class="text-secondary-color cursor-pointer duration-200 hover:opacity-50 border-b-2 border-secondary-color font-medium"
                        :href="row.productLink"
                      >
                        Ссылка на товар
                      </a>
                    </div>
                  </div>
                </div>
              </div>
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
              <UIMainButton @click="focusInput">СКАНИРОВАТЬ qr клиента</UIMainButton>
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
            <div class="w-full gap-10 flex flex-col-reverse">
              <div
                v-for="row in arrayOfRows"
                class="border-2 border-dashed border-secondary-color p-5"
              >
                <div v-if="'clientLink1' in row">
                  <div class="mt-5 flex items-center justify-between">
                    <div>
                      <h1>ID: {{ row.id }}</h1>
                      <h1>{{ formatPhoneNumber(row.fromName) }}</h1>
                      <h1 class="text-4xl font-bold">{{ row.cell }}</h1>
                    </div>
                    <div class="text-right">
                      <h1>{{ row.productName }}</h1>
                      <a
                        class="text-secondary-color cursor-pointer duration-200 hover:opacity-50 border-b-2 border-secondary-color font-medium"
                        :href="row.productLink"
                      >
                        Ссылка на товар
                      </a>
                    </div>
                  </div>
                </div>
                <div v-if="'clientLink2' in row">
                  <div class="mt-5 flex items-center justify-between">
                    <div>
                      <h1>{{ row.id }}</h1>
                      <h1>{{ formatPhoneNumber(row.fromName) }}</h1>
                      <h1 class="text-4xl font-bold">{{ row.cell }}</h1>
                    </div>
                    <div class="text-right">
                      <h1>{{ row.productName }}</h1>
                      <a
                        class="text-secondary-color cursor-pointer duration-200 hover:opacity-50 border-b-2 border-secondary-color font-medium"
                        :href="row.productLink"
                      >
                        Ссылка на товар
                      </a>
                    </div>
                  </div>
                </div>
              </div>
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
