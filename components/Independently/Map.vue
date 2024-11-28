<script setup lang="ts">
import Cookies from "js-cookie";
const selectedPVZClient = ref("");

const address = ref("");

onMounted(async () => {
  selectedPVZClient.value = address.value;

  if (props.marketplace === "OZON") {
    address.value = localStorage.getItem("addressData") || "";
    let addressString = JSON.parse(address.value);
    if (addressString === "ПВЗ_1") {
      selectedMarkerId.value = 1;
    } else if (addressString === "ПВЗ_3") {
      selectedMarkerId.value = 3;
    } else if (addressString === "ПВЗ_4") {
      selectedMarkerId.value = 4;
    } else if (addressString === "ППВЗ_5") {
      selectedMarkerId.value = 5;
    } else if (addressString === "ППВЗ_7") {
      selectedMarkerId.value = 7;
    }
  } else if (props.marketplace === "WB") {
    address.value = localStorage.getItem("addressData") || "";
  } else if (props.marketplace === "YM") {
    address.value = localStorage.getItem("addressData") || "";
  }
});

const coordinates = ref([47.971605, 37.860323]);
const controls = [
  "geolocationControl",
  "zoomControl",
  "typeSelector",
  "fullscreenControl",
];

let isOpenMap = ref(true);
let isOpenList = ref(false);

const props = defineProps({
  marketplace: { type: String, required: true },
});
const emit = defineEmits(["saveAddress"]);

function saveAddress() {
  emit("saveAddress", address.value);
}

const selectedMarkerId = ref();

function selectMarker(marker: any) {
  address.value = "";
  isOpenList.value = true;
  if (selectedMarkerId.value === marker.id) {
    selectedMarkerId.value = null;
  } else {
    selectedMarkerId.value = marker.id;
    changeAddress(marker.coords);
  }
}

function changeAddress(coordinatesData: Array<number>) {
  if (
    coordinatesData[0] === 47.98958366983051 &&
    coordinatesData[1] === 37.8955255423278
  ) {
    address.value = "ПВЗ_1";
  } else if (
    coordinatesData[0] === 47.945142 &&
    coordinatesData[1] === 37.960908
  ) {
    address.value = "ПВЗ_4";
  } else if (
    coordinatesData[0] === 47.955462 &&
    coordinatesData[1] === 37.964951
  ) {
    address.value = "ПВЗ_3";
  } else if (
    coordinatesData[0] === 47.946192 &&
    coordinatesData[1] === 37.90365
  ) {
    address.value = "ППВЗ_5";
  } else if (
    coordinatesData[0] === 47.974937 &&
    coordinatesData[1] === 37.837714
  ) {
    address.value = "ППВЗ_7";
  }
  coordinates.value = coordinatesData;
}
const searchQuery = ref("");
let markers = [
  {
    id: 1,
    coords: [47.98958366983051, 37.8955255423278],
    commentary:
      "Вход «ремонт обуви». Нет примерочной. Пн-пт 09:00-17:00; Сб 09:00-14:00; Выходной - воскресенье",
    address: "г. Донецк, ул. Антропова 16",
  },
  {
    id: 3,
    coords: [47.955462, 37.964951],
    commentary: "Есть примерочная. Ежедневно 9:00-17:00",
    address: "г. Донецк, ул. Палладина, 20",
  },
  {
    id: 4,
    coords: [47.945142, 37.960908],
    commentary:
      "Возле магазина «Добрый». Есть примерочная. Ежедневно 9:00-17:00",
    address: "г. Донецк, ул. Нартова, 1",
  },
  {
    id: 5,
    coords: [47.946192, 37.90365],
    commentary: "Домашний пункт. Ежедневно 10:00-21:00",
    address: "г. Донецк, ул. Дудинская, 4, кв. 7",
  },
  {
    id: 7,
    coords: [47.974937, 37.837714],
    commentary: "Домашний пункт. Ежедневно 12:00-20:00",
    address: "г. Донецк, ул. Жебелева, 7",
  },
];

let markersCopy = [
  {
    id: 1,
    coords: [47.98958366983051, 37.8955255423278],
    commentary:
      "Вход «ремонт обуви». Нет примерочной. Пн-пт 09:00-17:00; Сб 09:00-14:00; Выходной - воскресенье",
    address: "г. Донецк, ул. Антропова 16",
  },
  {
    id: 3,
    coords: [47.955462, 37.964951],
    commentary: "Есть примерочная. Ежедневно 9:00-17:00",
    address: "г. Донецк, ул. Палладина, 20",
  },
  {
    id: 4,
    coords: [47.945142, 37.960908],
    commentary:
      "Возле магазина «Добрый». Есть примерочная. Ежедневно 9:00-17:00",
    address: "г. Донецк, ул. Нартова, 1",
  },
  {
    id: 5,
    coords: [47.946192, 37.90365],
    commentary: "Домашний пункт. Ежедневно 10:00-21:00",
    address: "г. Донецк, ул. Дудинская, д. 4, кв. 7",
  },
  {
    id: 7,
    coords: [47.974937, 37.837714],
    commentary: "Домашний пункт. Ежедневно 12:00-20:00",
    address: "г. Донецк, ул. Жебелева, д. 7",
  },
];

function searchRows() {
  if (searchQuery.value) {
    markers = markersCopy.filter((row) =>
      row.address
        .trim()
        .toLowerCase()
        .includes(searchQuery.value.trim().toLowerCase())
    );
  } else {
    markers = markersCopy;
  }
}

watch([searchQuery], searchRows);
</script>

<template>
  <div>
    <ClientOnly>
      <YandexMap
        style="height: 700px"
        v-if="isOpenMap"
        :coordinates="coordinates"
        :controls="controls"
        :zoom="12"
      >
        <YandexMarker
          v-for="marker in markersCopy"
          :coordinates="marker.coords"
          :marker-id="marker.id"
          @click="selectMarker(marker)"
        >
        </YandexMarker>
      </YandexMap>
    </ClientOnly>
    <div
      v-if="!isOpenList"
      class="absolute top-20 z-[10] h-full max-w-[350px] px-5 py-5 max-h-[700px] rounded-r-2xl max-md:max-w-[700px] max-md:left-1 max-md:rounded-none"
    >
      <UButton
        v-if="marketplace === 'OZON'"
        class="duration-200 font-semibold"
        icon="i-material-symbols-package-2"
        size="sm"
        color="blue"
        variant="solid"
        label="ПОКАЗАТЬ СПИСОК"
        :trailing="false"
        @click="isOpenList = !isOpenList"
      />

      <UButton
        v-if="marketplace === 'WB'"
        class="duration-200 font-semibold"
        icon="i-material-symbols-package-2"
        size="sm"
        color="pink"
        variant="solid"
        label="ПОКАЗАТЬ СПИСОК"
        :trailing="false"
        @click="isOpenList = !isOpenList"
      />

      <UButton
        v-if="marketplace === 'YM'"
        class="duration-200 font-semibold"
        icon="i-material-symbols-package-2"
        size="sm"
        color="yellow"
        variant="solid"
        label="ПОКАЗАТЬ СПИСОК"
        :trailing="false"
        @click="isOpenList = !isOpenList"
      />
    </div>

    <div
      v-if="isOpenList"
      class="max-md:fixed max-md:top-8 max-md:left-0 max-md:z-[10] max-md:py-5 max-md:w-screen max-md:flex max-md:items-center max-md:justify-center max-md:mt-5"
    >
      <div
        :class="{
          'border-[#005df6]': marketplace === 'OZON',
          'border-[#ec208b]': marketplace === 'WB',
          'border-[#f8cf02]': marketplace === 'YM',
        }"
        class="absolute max-md:static top-20 left-10 z-[10] bg-gray-50 border-[1px] shadow-2xl h-full max-w-[300px] px-5 py-5 max-h-[700px] rounded-r-xl max-md:rounded-xl"
      >
        <div class="flex items-center justify-between mb-4">
          <h1 class="font-semibold text-xl">Адреса</h1>
          <Icon
            :class="{
              'hover:bg-[#005df6]': marketplace === 'OZON',
              'hover:bg-[#ec208b]': marketplace === 'WB',
              'hover:bg-[#f8cf02]': marketplace === 'YM',
            }"
            class="cursor-pointer hover:opacity-50 duration-200"
            name="i-material-symbols-light-close-rounded"
            @click="isOpenList = !isOpenList"
            size="24"
          />
        </div>
        <UInput
          icon="i-heroicons-magnifying-glass-20-solid"
          size="sm"
          color="white"
          :trailing="false"
          placeholder="Поиск адреса..."
          class="mb-5 max-md:mb-7"
          @input="searchRows"
          v-model="searchQuery"
        />
        <div
          v-for="marker in markers"
          :key="marker.id"
          class="mb-3 flex items-start gap-5"
        >
          <div>
            <input
              :class="{
                'checked:ring-[#005df6] text-[#005df6] ring-[#005df6] focus-visible:ring-[#005df6] focus:ring-[#005df6]':
                  marketplace === 'OZON',
                'checked:ring-[#ec208b] text-[#ec208b] ring-[#ec208b] focus-visible:ring-[#ec208b] focus:ring-[#ec208b]':
                  marketplace === 'WB',
                'checked:ring-[#f8cf02] text-[#f8cf02] ring-[#f8cf02] focus-visible:ring-[#f8cf02] focus:ring-[#f8cf02]':
                  marketplace === 'YM',
              }"
              class="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0 checked:ring-[2px] focus:ring-offset-transparent form-checkbox rounded-full bg-white border border-gray-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ring-[2px] bg-transparent duration-100"
              type="checkbox"
              :checked="selectedMarkerId === marker.id"
              @change="changeAddress(marker.coords), selectMarker(marker)"
            />
          </div>
          <div>
            <h1 class="font-semibold text-sm leading-4 my-1">
              {{ marker.address }}
            </h1>
            <h1 class="text-sm text-gray-400 font-semibold leading-4">
              {{ marker.commentary }}
            </h1>
          </div>
        </div>
        <div class="flex items-center justify-center mt-10 max-md:mt-5">
          <UButton
            v-if="address && marketplace === 'OZON'"
            class="duration-200 font-semibold"
            icon="i-material-symbols-package-2"
            size="sm"
            color="blue"
            variant="solid"
            label="ЗАБЕРУ ЗДЕСЬ"
            :trailing="false"
            @click="saveAddress"
          />

          <UButton
            v-if="address && marketplace === 'WB'"
            class="duration-200 font-semibold"
            icon="i-material-symbols-package-2"
            size="sm"
            color="pink"
            variant="solid"
            label="ЗАБЕРУ ЗДЕСЬ"
            :trailing="false"
            @click="saveAddress"
          />

          <UButton
            v-if="address && marketplace === 'YM'"
            class="duration-200 font-semibold"
            icon="i-material-symbols-package-2"
            size="sm"
            color="yellow"
            variant="solid"
            label="ЗАБЕРУ ЗДЕСЬ"
            :trailing="false"
            @click="saveAddress"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
