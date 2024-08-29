<script lang="ts" setup>
defineProps({
  disabled: { type: Boolean },
});
</script>

<template>
  <!-- <button
    :disabled="disabled"
    class="button-62 disabled:opacity-50 disabled:cursor-not-allowed"
    role="button"
  >
    <slot />
  </button> -->
  <UButton
    icon="material-symbols:cancel-presentation"
    size="sm"
    color="red"
    variant="solid"
    label="Button"
    :trailing="false"
    class="duration-200"
  >
    <slot />
  </UButton>
</template>

<style scoped>
.button-62 {
  background: linear-gradient(to bottom right, #fe9651, #ff0909);
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 2.5;
  outline: transparent;
  padding: 0 1rem;
  text-align: center;
  text-decoration: none;
  transition: box-shadow 0.2s ease-in-out;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
  font-weight: bold;
  text-transform: uppercase;
}

.button-62:not([disabled]):focus {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}

.button-62:not([disabled]):hover {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}
</style>
