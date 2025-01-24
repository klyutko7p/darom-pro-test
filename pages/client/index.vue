<script setup lang="ts">
import Cookies from "js-cookie";

const router = useRouter();
const token = Cookies.get("token");

onMounted(() => {
  if (!token) {
    router.push('/auth/client/login?stay=true')
  } else {
    router.push('/client/main')
  }
})
</script>


<template>
    <div>

    </div>
</template>

