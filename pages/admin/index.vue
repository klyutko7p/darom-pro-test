<script setup lang="ts">
import Cookies from "js-cookie";

const router = useRouter();
const token = Cookies.get("token");

onMounted(() => {
  if (!token) {
    router.push('/auth/login')
  } else {
    router.push('/admin/main')
  }
})
</script>

<template>
    <div>

    </div>
</template>
