<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeCells = useCellsStore();
const router = useRouter();

let user = ref({} as User);
let cells = ref<Array<Cell[]>>()
const token = Cookies.get("token");
let isLoading = ref(false);

onBeforeMount(async () => {
    isLoading.value = true;
    user.value = await storeUsers.getUser();
    cells.value = await storeCells.getCells();
    isLoading.value = false;
});

onMounted(() => {
    if (!token) {
        router.push("/auth/login");
    }
});

const fields = ["название", "ПВЗ", "статус", "кем занято"];

definePageMeta({
    layout: false,
});

</script>

<template>
    <Head>
        <Title>Ячейки</Title>
    </Head>

    <div v-if="token && user.role === 'ADMIN'">
        <NuxtLayout name="admin">
            <div v-if="!isLoading" class="mt-10">
                <AdminDataTable3 :fields="fields" :rows="cells" />
            </div>

            <div v-else>
                <UISpinner />
            </div>
        </NuxtLayout>
    </div>

    <div v-else-if="user.role === 'USER'">
        <NuxtLayout name="user">
            <h1>
                У вас недостаточно прав на просмотр этой информации. Обратитесь к администратору
            </h1>
        </NuxtLayout>
    </div>
</template>
