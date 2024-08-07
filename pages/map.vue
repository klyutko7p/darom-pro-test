<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";
import { YandexMap, YandexMarker } from "vue-yandex-maps";

let markers = ref<Array<Marker>>();
const coordinates = ref([47.98511258974997, 37.88900439172217]);
const controls = [
  "fullscreenControl",
  "geolocationControl",
  "searchControl",
  "zoomControl",
  "typeSelector",
];
let coords = [47.98958366983051, 37.8955255423278];
let notationMsg = ref("");
let coordsMarker = ref([]);
let isShowCreatingMarker = ref(false);

async function createMarker() {
  isShowCreatingMarker.value = false;
  await storeMarkers.createMarker(
    coordsMarker.value,
    selectedType.value,
    user.value.username,
    notationMsg.value
  );
  markers.value = await storeMarkers.getMarkers();
  coordsMarker.value = [];
  notationMsg.value = "";
}

async function getCoords(e) {
  coords = e.get("coord");

  const globalPixelCenter = e.originalEvent.map._globalPixelCenter;
  const projection = e.originalEvent.map._projection;

  if (globalPixelCenter && projection) {
    const coordinates = projection.fromGlobalPixels(
      globalPixelCenter,
      e.originalEvent.map._zoom
    );
    coordsMarker.value = e.get("coords");
    isShowCreatingMarker.value = true;
  }
}

let selectedAddress = ref([47.98958366983051, 37.8955255423278]);
function changeAddress() {
  coordinates.value = selectedAddress.value;
}

const storeUsers = useUsersStore();
const storeMarkers = useMarkersStore();
const router = useRouter();
let selectedType = ref("Посещенный");
const toast = useToast();
let user = ref({} as User);
let rows = ref<Array<Task>>();
const token = Cookies.get("token");
let isLoading = ref(false);

onMounted(async () => {
  if (!token) {
    router.push("/auth/login");
  }

  isLoading.value = true;
  user.value = await storeUsers.getUser();
  markers.value = await storeMarkers.getMarkers();
  isLoading.value = false;
});


async function updateMarkers(id: number) {
  isLoading.value = true;
  await storeMarkers.deleteMarker(id);
  markers.value = await storeMarkers.getMarkers();
  isLoading.value = false;
}

definePageMeta({
  layout: false,
  name: "Карта",
});
</script>

<template>
  <Head>
    <Title>Карта</Title>
  </Head>

  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="py-10">
          <div class="flex gap-3">
            <UIMainButton @click="selectedType = 'Наша точка'">Наша точка</UIMainButton>
            <UIMainButton @click="selectedType = 'Посещенный'"
              >Посещенное место</UIMainButton
            >
          </div>

          <ClientOnly>
            <YandexMap
              style="width: 100%; height: 1000px; margin-top: 20px"
              v-if="true"
              :coordinates="coordinates"
              :controls="controls"
              :zoom="18"
              @click="getCoords"
            >
              <YandexMarker
                v-for="marker in markers?.filter((row) => row.type === 'Наша точка')"
                :coordinates="marker.coordinates"
                :marker-id="marker.id"
                type="Circle"
                :radius="5"
              >
                <template #component>
                  <CustomBalloon
                    :user="user"
                    :marker="marker"
                    @update-markers="updateMarkers"
                  />
                </template>
              </YandexMarker>
              <YandexMarker
                v-for="marker in markers?.filter((row) => row.type === 'Посещенный')"
                :coordinates="marker.coordinates"
                :marker-id="marker.id"
              >
                <template #component>
                  <CustomBalloon
                    :user="user"
                    :marker="marker"
                    @update-markers="updateMarkers"
                  />
                </template>
              </YandexMarker>
            </YandexMap>
          </ClientOnly>
        </div>

        <div
          v-if="isShowCreatingMarker"
          class="fixed top-0 bottom-0 z-[1000] left-0 right-0 bg-black bg-opacity-75 flex items-center justify-center h-screen"
        >
          <div class="bg-white text-black rounded-2xl p-10">
            <h1 class="text-center text-2xl font-bold">Комментарий</h1>
            <input
              type="text"
              class="bg-transparent my-5 w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
              v-model="notationMsg"
            />
            <div class="flex gap-5">
              <UIMainButton @click="createMarker">Создать маркер</UIMainButton>
              <UIErrorButton @click="isShowCreatingMarker = !isShowCreatingMarker"
                >Отменить</UIErrorButton
              >
            </div>
          </div>
        </div>
      </NuxtLayout>
    </div>

    <div v-else>
      <NuxtLayout name="user">
        <div class="py-10">
          <div class="flex gap-3">
            <UIMainButton @click="selectedType = 'Наша точка'">Наша точка</UIMainButton>
            <UIMainButton @click="selectedType = 'Посещенный'"
              >Посещенное место</UIMainButton
            >
          </div>

          <ClientOnly>
            <YandexMap
              style="width: 100%; height: 1000px; margin-top: 20px"
              v-if="true"
              :coordinates="coordinates"
              :controls="controls"
              :zoom="18"
              @click="getCoords"
            >
              <YandexMarker
                v-for="marker in markers?.filter((row) => row.type === 'Наша точка')"
                :coordinates="marker.coordinates"
                :marker-id="marker.id"
                type="Circle"
                :radius="5"
              >
                <template #component>
                  <CustomBalloon
                    :user="user"
                    :marker="marker"
                    @update-markers="updateMarkers"
                  />
                </template>
              </YandexMarker>
              <YandexMarker
                v-for="marker in markers?.filter((row) => row.type === 'Посещенный')"
                :coordinates="marker.coordinates"
                :marker-id="marker.id"
              >
                <template #component>
                  <CustomBalloon
                    :user="user"
                    :marker="marker"
                    @update-markers="updateMarkers"
                  />
                </template>
              </YandexMarker>
            </YandexMap>
          </ClientOnly>
        </div>

        <div
          v-if="isShowCreatingMarker"
          class="fixed top-0 bottom-0 z-[1000] left-0 right-0 bg-black bg-opacity-75 flex items-center justify-center h-screen"
        >
          <div class="bg-white text-black rounded-2xl p-10">
            <h1 class="text-center text-2xl font-bold">Комментарий</h1>
            <input
              type="text"
              class="bg-transparent my-5 w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
              v-model="notationMsg"
            />
            <div class="flex gap-5">
              <UIMainButton @click="createMarker">Создать маркер</UIMainButton>
              <UIErrorButton @click="isShowCreatingMarker = !isShowCreatingMarker"
                >Отменить</UIErrorButton
              >
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

<style>
.yandex-balloon {
  height: 150px;
  width: 200px;
}
</style>
