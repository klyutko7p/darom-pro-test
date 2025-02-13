<script setup lang="ts">
const selectedPVZClient = ref("");

const address = ref("");
const storePVZ = usePVZStore();

onMounted(async () => {
  selectedPVZClient.value = address.value;

  if (props.marketplace === "OZON") {
    address.value = localStorage.getItem("addressData") || "";
    let addressString = JSON.parse(address.value);
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
  pvzs: { type: Array as any, required: true },
});
const emit = defineEmits(["saveAddress"]);

function saveAddress() {
  emit("saveAddress", address.value);
}

const selectedMarkerId = ref();

function selectMarker(pvz: PVZ) {
  address.value = pvz.name;
  isOpenList.value = true;
  if (selectedMarkerId.value === pvz.id) {
    selectedMarkerId.value = null;
    address.value = "";
  } else {
    selectedMarkerId.value = pvz.id;
    changeAddress(pvz.coordinates);
  }
}

function changeAddress(coordinatesData: Array<number>) {
  coordinates.value = coordinatesData;
}
</script>

<template>
  <div>
    <ClientOnly>
      <YandexMap
        style="height: 900px"
        v-if="isOpenMap"
        :coordinates="coordinates"
        :controls="controls"
        :zoom="8"
      >
        <YandexMarker
          v-for="pvz in pvzs"
          :coordinates="pvz.coordinates"
          :marker-id="pvz.id"
          @click="selectMarker(pvz)"
        >
        </YandexMarker>
      </YandexMap>
    </ClientOnly>
    <div
      v-if="!isOpenList"
      class="absolute top-20 z-[10] h-full max-w-[350px] px-5 py-5 max-h-[50px] rounded-r-2xl max-md:max-w-[700px] max-md:left-1 max-md:rounded-none"
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
        class="absolute max-md:static top-20 left-10 z-[10] bg-gray-50 border-[1px] shadow-2xl h-full max-w-[300px] px-5 py-5 max-h-[750px] min-w-[300px] rounded-r-xl max-md:rounded-xl"
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
        <div
          class="max-h-[550px] max-lg:max-h-[380px] overflow-y-scroll px-1 flex flex-col gap-3"
        >
          <div
            v-for="pvz in pvzs"
            :key="pvz.id"
            class="flex items-start gap-3 pb-1"
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
                :checked="selectedMarkerId === pvz.id"
                @change="changeAddress(pvz.coordinates), selectMarker(pvz)"
              />
            </div>
            <div>
              <h1 class="font-semibold text-sm leading-4 my-1">
                {{ pvz.address }}
              </h1>
            </div>
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
