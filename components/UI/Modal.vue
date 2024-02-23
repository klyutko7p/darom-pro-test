<template>
  <div class="fixed top-0 bottom-0 left-0 right-0 flex justify-center bg-[#000000da] z-[100] max-sm:absolute">

    <div class="modal text-black" @click.stop>
      <div class="text-secondary-color flex justify-end">
        <Icon  @click="$emit('close-modal')" name="material-symbols:close-rounded" size="32" class="cursor-pointer hover:opacity-50 duration-200" />
      </div>
      <div class="mb-10 border-b-2 border-black py-3">
        <slot name="header"></slot>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  background-color: #000000da;
  z-index: 100;
}

.modal {
  text-align: center;
  background-color: white;
  margin: 1rem;
  overflow: auto;
  padding: 20px 20px;
  border-radius: 20px;
  border: 4px solid orange;
}

.close-img {
  width: 25px;
}

.check {
  width: 150px;
}

h6 {
  font-weight: 500;
  font-size: 28px;
  margin: 20px 0;
}

p {
  font-size: 16px;
  margin: 20px 0;
}

button {
  background-color: #ac003e;
  width: 150px;
  height: 40px;
  color: white;
  font-size: 14px;
  border-radius: 16px;
  margin-top: 50px;
}
</style>