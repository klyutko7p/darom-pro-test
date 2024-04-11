<template>
  <div>
    Создал {{ marker.createdUser }} в
    {{ storeUsers.getNormalizedDate(marker.createdAt) }}. <br />
    Комментарий - {{ marker.notation }}
    <UIActionButton
      v-if="user.username === 'Директор' || user.username === 'Шведова'"
      class="mt-1"
      @click="deleteMarker"
      >Удалить маркер</UIActionButton
    >
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";

const storeMarkers = useMarkersStore();
const storeUsers = useUsersStore();

const emit = defineEmits(["updateMarkers"]);

async function deleteMarker() {
  emit("updateMarkers", props.marker.id);
}

const props = defineProps({
  marker: { type: {} as PropType<Marker>, required: true },
  user: { type: {} as PropType<User>, required: true },
});
</script>
