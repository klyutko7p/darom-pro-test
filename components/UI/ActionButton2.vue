<script lang="ts" setup>
defineProps({
  disabled: { type: Boolean },
});
</script>

<template>
  <button :disabled="disabled" class="button-87" role="button">
    <slot />
  </button>
</template>

<style scoped>
.button-87 {
  padding: 5px 10px;
  text-align: center;
  font-size: 12px;
  text-transform: uppercase;
  transition: 0.5s;
  background-size: 200% auto;
  color: white;
  border-radius: 10px;
  display: block;
  border: 0px;
  font-weight: 700;
  box-shadow: 0px 0px 14px -7px #f09819;
  background-image: linear-gradient(45deg, #fc3b3b 0%, #4576ff 51%, #f88538 100%);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-87:not([disabled]):hover {
  background-position: right center;
  /* change the direction of the change here */
  color: #fff;
  text-decoration: none;
}

.button-87:not([disabled]):active {
  transform: scale(0.95);
}

.button-87:disabled {
  opacity: 70%;
  cursor: not-allowed;
}
</style>
