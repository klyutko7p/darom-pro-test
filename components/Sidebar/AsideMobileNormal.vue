<script setup lang="ts">
import { vAutoAnimate } from "@formkit/auto-animate";
import type { PropType } from "vue";

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
});

const storeBalance = useBalanceStore();
const storeAdvanceReports = useAdvanceReports();
let requestsBalance = ref<Array<IBalance>>([]);
let requestsAdvanceReport = ref<Array<IAdvanceReport>>([]);

const emits = defineEmits(["editMenu", "signOut"]);

function editMenu() {
  emits("editMenu");
}

function signOut() {
  emits("signOut");
}

let quantityRequiredARRows = ref(0);
let quantityRequiredARRowsAdmin = ref(0);
let quantityRequiredBalanceRows = ref(0);
onMounted(async () => {
  try {
    const [balanceResult, advanceResult] = await Promise.all([
      storeBalance.getBalanceRows(),
      storeAdvanceReports.getAdvancedReports(),
    ]);

    requestsBalance.value = balanceResult;
    requestsAdvanceReport.value = advanceResult;

    quantityRequiredARRows.value = requestsAdvanceReport.value?.filter(
      (row) =>
        !row.received &&
        row.issuedUser === props.user.username &&
        row.notation !== "Пополнение баланса"
    ).length;
    quantityRequiredARRowsAdmin.value = requestsAdvanceReport.value?.filter(
      (row) =>
        !row.received &&
        (row.issuedUser === props.user.username ||
          row.issuedUser === "Директор (С)") &&
        row.notation !== "Пополнение баланса"
    ).length;
    quantityRequiredBalanceRows.value = requestsBalance.value?.filter(
      (row) =>
        row.issued &&
        !row.received &&
        (row.receivedUser2 === props.user.username ||
          row.receivedUser2 === "Нет")
    ).length;
  } catch (error) {
    console.error("Ошибка:", error);
  }
});

const router = useRouter();

let isShowGoodsList = ref(false);
let isShowFinancesList = ref(false);
let isShowEquipmentsList = ref(false);
let isShowDSList = ref(false);
let isShowSettingsList = ref(false);

function showGoodsList() {
  isShowGoodsList.value = !isShowGoodsList.value;
}

function showFinancesList() {
  isShowFinancesList.value = !isShowFinancesList.value;
}

function showEquipmentsList() {
  isShowEquipmentsList.value = !isShowEquipmentsList.value;
}

function showDSList() {
  isShowDSList.value = !isShowDSList.value;
}

function showSettingsList() {
  isShowSettingsList.value = !isShowSettingsList.value;
}
</script>
<template>
  <div
    @click="editMenu"
    class="hover:bg-orange-100 z-[200] absolute top-2 right-4 cursor-pointer duration-200 hover:text-secondary-color pt-2 px-1.5 rounded-xl"
  >
    <Icon name="material-symbols:close-small-outline-rounded" size="60" />
  </div>
  <div v-auto-animate class="h-full overflow-y-auto">
    <div class="px-3 justify-between mb-10 pb-2">
      <h5
        class="text-6xl max-[400px]:text-5xl text-center text-secondary-color font-bold uppercase dark:text-gray-400"
      >
        DAROM.PRO
      </h5>
    </div>

    <SidebarAsideBody
      :user="user"
      @sign-out="signOut"
      @edit-menu="editMenu"
      v-auto-animate
    />
  </div>
</template>
