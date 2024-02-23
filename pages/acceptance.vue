<script setup lang="ts">
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const toast = useToast()

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const router = useRouter();

let user = ref({} as User);
const token = Cookies.get("token");
let isLoading = ref(false);

onBeforeMount(async () => {
    isLoading.value = true;
    user.value = await storeUsers.getUser();

    isLoading.value = false;
});

onMounted(() => {
    if (!token) {
        router.push("/auth/login");
    }
});

definePageMeta({
    layout: false,
    name: "Приёмка",
});

let isScanActive = ref(false);

let scanStringItem = ref('')
let timeoutId: ReturnType<typeof setTimeout> | null = null;

async function updateDeliveryRow(row: any, flag: any) {
    await storeRansom.updateDeliveryStatus(row, flag, "OurRansom", user.value.username);
}
async function acceptItem(row: any) {
    if (user.value.role === 'PVZ') {
        if (user.value.visiblePVZ.includes(row.dispatchPVZ)) {
            if (row.deliveredPVZ === null && row.deliveredSC !== null) {
                await updateDeliveryRow(row, "PVZ");
                toast.success('Товар принят на ПВЗ!');
            } else {
                toast.warning('Товар принят ранее или неотсортирован!');
            }
        }
        else {
            toast.error("У вас нет доступа к товаром данного ПВЗ!")
        }
    }
}

let arrayOfRows = ref<Array<IOurRansom | IClientRansom | IDelivery>>([])

function scanItem() {
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
        let scannedLink = scanStringItem.value.trim();
        scannedLink = convertToURL(scannedLink)
        let rowData = await storeRansom.getRansomRowsById(+scannedLink, "OurRansom")
        await acceptItem(rowData);
        arrayOfRows.value.push(rowData)
        scanStringItem.value = ''
    }, 2000);
}

function convertToURL(inputString: string) {
    if (inputString.includes('/')) {
        const parts = inputString.split('/');
        const entryID = parts[parts.length - 1];
        return entryID;
    } else if (inputString.includes('.')) {
        const parts = inputString.split('.');
        const entryID = parts[parts.length - 1];
        return entryID;
    }

}

const myInput = ref(null);

function focusInput() {
    isScanActive.value = true;
    myInput.value.focus();
}

function formatPhoneNumber(phoneNumber: string) {
    if (!phoneNumber) {
        return 'Номер телефона не указан';
    }

    const digitsOnly = phoneNumber.replace(/\D/g, '');

    if (digitsOnly.length < 11) {
        return 'Неправильный формат номера телефона';
    }

    const maskedPhoneNumber =
        '+7' +
        '*'.repeat(digitsOnly.length - 5) +
        digitsOnly.slice(-4);

    return maskedPhoneNumber;
}

</script>

<template>
    <Head>
        <Title>Приёмка</Title>
    </Head>

    <div v-if="!isLoading">
        <div v-if="token && user.role === 'ADMIN'">
            <NuxtLayout name="admin">
                <div class="mt-10">
                    <div class="flex items-center flex-col justify-center gap-5">
                        <UIMainButton @click="focusInput">СКАНИРОВАТЬ</UIMainButton>
                        <h1 v-if="isScanActive">Сканирование товаров включено</h1>
                        <input ref="myInput" autofocus class="opacity-0" v-model="scanStringItem" @input="scanItem" />
                        <div class="w-full gap-10 flex flex-col">
                            <div v-for="row in arrayOfRows" class="border-b-2">
                                <div v-if="'clientLink1' in row">
                                    <h1>Заказ – <span @click="router.push(`/spreadsheets/order/${row.clientLink1}`)"
                                            class="text-secondary-color cursor-pointer duration-200 hover:opacity-50 border-b-2 border-secondary-color font-medium">{{
                                                row.clientLink1 }}</span></h1>
                                    <div class="mt-5 flex items-center justify-between">
                                        <div>
                                            <h1>{{ formatPhoneNumber(row.fromName) }} </h1>
                                            <h1 class="text-4xl font-bold"> {{ row.cell }} </h1>
                                        </div>
                                        <div class="text-right">
                                            <h1> {{ row.productName }} </h1>
                                            <a class="text-secondary-color cursor-pointer duration-200 hover:opacity-50 border-b-2 border-secondary-color font-medium"
                                                :href="row.productLink"> Ссылка на товар </a>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="'clientLink2' in row">
                                    <h1>Заказ – <span @click="router.push(`/spreadsheets/order/${row.clientLink2}`)"
                                            class="text-secondary-color cursor-pointer duration-200 hover:opacity-50 border-b-2 border-secondary-color font-medium">{{
                                                row.clientLink2 }}</span></h1>
                                    <div class="mt-5 flex items-center justify-between">
                                        <div>
                                            <h1>{{ formatPhoneNumber(row.fromName) }} </h1>
                                            <h1 class="text-4xl font-bold"> {{ row.cell }} </h1>
                                        </div>
                                        <div class="text-right">
                                            <h1> {{ row.productName }} </h1>
                                            <a class="text-secondary-color cursor-pointer duration-200 hover:opacity-50 border-b-2 border-secondary-color font-medium"
                                                :href="row.productLink"> Ссылка на товар </a>
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
                <div class="mt-10"></div>
            </NuxtLayout>
        </div>
    </div>

<div v-else class="flex items-center justify-center">
    <UISpinner />
</div></template>
