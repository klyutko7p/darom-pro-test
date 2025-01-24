<script setup lang="ts">
import { useToast } from "vue-toastification";
import Cookies from "js-cookie";

let toast = useToast();

const route = useRoute();
let idString = route.params.id;

const storeUsers = useUsersStore();
const storeBoxes = useBoxesStore();

const router = useRouter();

let isLoading = ref(false);
let user = ref({} as User);

async function deleteRow(idData: number) {
  let answer = confirm("Вы точно хотите продолжить?");
  if (answer) {
    isLoading.value = true;
    let deletedId = box.value.idRows.findIndex((id) => id === idData);
    box.value.idRows.splice(deletedId, 1);
    await storeBoxes.updateBox(box.value);
    box.value = await storeBoxes.getBoxById(Number(idString));
    isLoading.value = false;
  }
}

const idItem = ref();
async function addItemToBox() {
  isLoading.value = true;
  box.value.idRows.push(Number(idItem.value));
  await storeBoxes.updateBox(box.value);
  box.value = await storeBoxes.getBoxById(Number(idString));
  idItem.value = null;
  isLoading.value = false;
}

let box = ref({} as Box);
onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  box.value = await storeBoxes.getBoxById(Number(idString));

  if (!user.value.PVZ.includes(box.value.dispatchPVZ)) {
    toast.error("У вас нет прав на просмотр коробки этого ПВЗ!");
    router.push("/user/main");
  }

  if (user.value.role === "COURIER") {
    toast.error("У вас нет прав на просмотр коробки!");
    router.push("/user/main");
  }

  isLoading.value = false;
});

definePageMeta({
  layout: false,
  name: "Коробка",
});

const token = Cookies.get("token");

async function changeStatus(status: string) {
  if (status === "sorted") {
    isLoading.value = true;
    box.value.sorted = null;
    box.value.delivered = null;
    await storeBoxes.updateBox(box.value);
    box.value = await storeBoxes.getBoxById(Number(idString));
    isLoading.value = false;
  } else if (status === "delivered") {
    isLoading.value = true;
    box.value.sorted = new Date();
    box.value.delivered = null;
    await storeBoxes.updateBox(box.value);
    box.value = await storeBoxes.getBoxById(Number(idString));
    isLoading.value = false;
  } else if (status === "final") {
    isLoading.value = true;
    box.value.sorted = new Date();
    box.value.delivered = new Date();
    await storeBoxes.updateBox(box.value);
    box.value = await storeBoxes.getBoxById(Number(idString));
    isLoading.value = false;
  }
}
</script>

<template>
  <Head>
    <Title>Коробка</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="table-admin-no-pad">
        <div v-if="!isLoading" class="px-5 pt-5 max-sm:px-5 pb-5 w-screen">
          <div class="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-ic-round-numbers" size="24" />
                <h1>ID Коробки</h1>
              </div>
              <h1 class="text-lg">{{ box.id }}</h1>
            </div>
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-mdi-truck-delivery" size="24" />
                <h1>ПВЗ</h1>
              </div>
              <h1 class="text-lg">{{ box.dispatchPVZ }}</h1>
            </div>
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-material-symbols-type-specimen" size="24" />
                <h1>Тип</h1>
              </div>
              <h1 class="text-lg">
                {{ box.type === "standard" ? "Стандарт" : "КГТ" }}
              </h1>
            </div>
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-material-symbols-person-add-rounded" size="24" />
                <h1>Создал</h1>
              </div>
              <h1 class="text-lg">{{ box.createdUser }}</h1>
            </div>
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-material-symbols-event-available" size="24" />
                <h1>Дата создания</h1>
              </div>
              <h1 class="text-lg">
                {{ storeUsers.getNormalizedDate(box.created_at) }}
              </h1>
            </div>
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-ic-baseline-query-stats" size="24" />
                <h1>Статус</h1>
              </div>
              <UBadge
                v-if="!box.sorted && !box.delivered"
                size="md"
                label="На сортировщице"
                color="yellow"
                variant="subtle"
              />
              <UBadge
                v-if="box.sorted && !box.delivered"
                size="md"
                label="На курьере"
                color="yellow"
                variant="subtle"
              />
              <UBadge
                v-if="box.sorted && box.delivered"
                size="md"
                label="Доставлен"
                color="emerald"
                variant="subtle"
              />
              <div
                v-if="
                  user.username === 'Горцуева' ||
                  user.username === 'Директор' ||
                  user.username === 'Власенкова'
                "
                class="flex gap-3 mt-3 max-sm:flex-col"
              >
                <UButton
                  @click="changeStatus('sorted')"
                  class="font-semibold"
                  v-if="
                    (box.sorted && !box.delivered) ||
                    (box.sorted && box.delivered)
                  "
                  >Изм. на «На сортировщице»</UButton
                >
                <UButton
                  class="font-semibold"
                  @click="changeStatus('delivered')"
                  v-if="
                    (!box.sorted && !box.delivered) ||
                    (box.sorted && box.delivered)
                  "
                  >Изм. на «На курьере»</UButton
                >
                <UButton
                  class="font-semibold"
                  @click="changeStatus('final')"
                  v-if="
                    (!box.sorted && !box.delivered) ||
                    (box.sorted && !box.delivered)
                  "
                  >Изм. на «Доставлено»</UButton
                >
              </div>
            </div>
          </div>
          <div class="flex my-3 items-end justify-end">
            <CodeQR
              :value="`https://darom.pro/${route.fullPath}`"
              class="max-w-[110px] max-h-[100px] max-sm:mx-auto"
            />
          </div>
          <div
            v-if="
              user.username === 'Директор' ||
              user.username === 'Власенкова' ||
              user.username === 'Горцуева'
            "
          >
            <h1 class="mt-5">Добавить товар по ID в коробку</h1>
            <div class="flex items-center gap-3 mt-2">
              <UInput
                placeholder="Введите ID товара"
                v-model="idItem"
                class="max-w-[300px]"
                type="input"
              />
              <UButton
                class="font-semibold"
                icon="i-mdi-package-variant-closed-plus"
                @click="addItemToBox"
                :disabled="!idItem"
                >Добавить</UButton
              >
            </div>
          </div>
          <div
            v-if="box.idRows"
            class="bg-gray-100 mt-5 px-5 py-3 rounded-md shadow-inner"
          >
            <div class="flex items-center gap-3">
              <Icon name="i-lsicon-goods-outline" size="24" />
              <h1 class="font-semibold">
                Товары внутри коробки – {{ box.idRows.length }}
              </h1>
            </div>
            <DistributionTableForBoxId
              @delete-row="deleteRow"
              :user="user"
              :idRows="box.idRows"
            />
          </div>
        </div>
        <div v-else class="w-screen flex items-center justify-center">
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="table-user-no-pad">
        <div v-if="!isLoading" class="px-5 pt-5 max-sm:px-5 pb-5 w-screen">
          <div class="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-ic-round-numbers" size="24" />
                <h1>ID Коробки</h1>
              </div>
              <h1 class="text-lg">{{ box.id }}</h1>
            </div>
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-mdi-truck-delivery" size="24" />
                <h1>ПВЗ</h1>
              </div>
              <h1 class="text-lg">{{ box.dispatchPVZ }}</h1>
            </div>
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-material-symbols-type-specimen" size="24" />
                <h1>Тип</h1>
              </div>
              <h1 class="text-lg">
                {{ box.type === "standard" ? "Стандарт" : "КГТ" }}
              </h1>
            </div>
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-material-symbols-person-add-rounded" size="24" />
                <h1>Создал</h1>
              </div>
              <h1 class="text-lg">{{ box.createdUser }}</h1>
            </div>
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-material-symbols-event-available" size="24" />
                <h1>Дата создания</h1>
              </div>
              <h1 class="text-lg">
                {{ storeUsers.getNormalizedDate(box.created_at) }}
              </h1>
            </div>
            <div
              class="flex items-center flex-col border-[1px] shadow-inner py-3 px-5 rounded-md min-w-[200px]"
            >
              <div class="flex items-center gap-2 mb-3">
                <Icon name="i-ic-baseline-query-stats" size="24" />
                <h1>Статус</h1>
              </div>
              <UBadge
                v-if="!box.sorted && !box.delivered"
                size="md"
                label="На сортировщице"
                color="yellow"
                variant="subtle"
              />
              <UBadge
                v-if="box.sorted && !box.delivered"
                size="md"
                label="На курьере"
                color="yellow"
                variant="subtle"
              />
              <UBadge
                v-if="box.sorted && box.delivered"
                size="md"
                label="Доставлен"
                color="emerald"
                variant="subtle"
              />
            </div>
          </div>
          <div class="flex my-3 items-end justify-end">
            <CodeQR
              :value="`https://darom.pro/${route.fullPath}`"
              class="max-w-[110px] max-h-[100px] max-sm:mx-auto"
            />
          </div>
          <div
            v-if="
              user.username === 'Директор' ||
              user.username === 'Власенкова' ||
              user.username === 'Горцуева'
            "
          >
            <h1 class="mt-5">Добавить товар по ID в коробку</h1>
            <div class="flex items-center gap-3 mt-2">
              <UInput
                placeholder="Введите ID товара"
                v-model="idItem"
                class="max-w-[300px]"
                type="input"
              />
              <UButton
                class="font-semibold"
                icon="i-mdi-package-variant-closed-plus"
                @click="addItemToBox"
                :disabled="!idItem"
                >Добавить</UButton
              >
            </div>
          </div>
          <div
            v-if="box.idRows"
            class="bg-gray-100 mt-5 px-5 py-3 rounded-md shadow-inner"
          >
            <div class="flex items-center gap-3">
              <Icon name="i-lsicon-goods-outline" size="24" />
              <h1 class="font-semibold">
                Товары внутри коробки – {{ box.idRows.length }}
              </h1>
            </div>
            <DistributionTableForBoxId
              @delete-row="deleteRow"
              :user="user"
              :idRows="box.idRows"
            />
          </div>
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
