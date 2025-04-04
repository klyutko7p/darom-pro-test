<script lang="ts" setup>
const emit = defineEmits(["close-modal"]);

const closeModal = () => {
  emit("close-modal");
};
</script>

<template>
  <div class="modal">
    <article class="modal-container">
      <header class="modal-container-header">
        <h1 class="modal-container-title">
          <slot name="icon-header"></slot>
          <slot name="header"></slot>
        </h1>
        <Icon
          @click="closeModal"
          name="material-symbols:cancel-rounded"
          size="32"
          class="cursor-pointer hover:opacity-50 duration-200"
        />
      </header>
      <section class="modal-container-body flex justify-center rtf">
        <slot name="body"></slot>
      </section>
      <footer class="modal-container-footer">
        <slot name="footer"></slot>
      </footer>
    </article>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap");

button,
input,
select,
textarea {
  font: inherit;
}

a {
  color: inherit;
}

* {
  scrollbar-width: 0;
}

*::-webkit-scrollbar {
  background-color: transparent;
  width: 12px;
}

*::-webkit-scrollbar-thumb {
  border-radius: 99px;
  background-color: #ddd;
  border: 4px solid #fff;
}

.modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.25);
}

.modal-container {
  max-height: 90vh;
  max-width: 500px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  background-color: #fff;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
}

@media (max-width: 600px) {
  .modal-container {
    width: 90%;
  }
}

.modal-container-header {
  padding: 16px 32px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-container-title {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1;
  font-weight: 700;
  font-size: 1.125rem;
}

.modal-container-title svg {
  width: 32px;
  height: 32px;
  color: #750550;
}

.modal-container-body {
  height: 450px;
  padding: 10px 32px 10px;
  overflow-y: auto;
}

.rtf h1,
.rtf h2,
.rtf h3,
.rtf h4,
.rtf h5,
.rtf h6 {
  font-weight: 700;
}

.rtf h1 {
  font-size: 1.5rem;
  line-height: 1.125;
}

.rtf h2 {
  font-size: 1.25rem;
  line-height: 1.25;
}

.rtf h3 {
  font-size: 1rem;
  line-height: 1.5;
}

.rtf > * + * {
  margin-top: 1em;
}

.rtf > * + h1,
.rtf > * + h2,
.rtf > * + h3 {
  margin-top: 2em;
}

.rtf > h1 + *,
.rtf > h2 + *,
.rtf > h3 + * {
  margin-top: 0.75em;
}

.rtf ul,
.rtf ol {
  margin-left: 20px;
}

.rtf ol {
  list-style: numeric;
}

.rtf ul {
  list-style: disc;
}

.modal-container-footer {
  padding: 15px 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid #ddd;
}


.modal-container-footer::after {
  content: "";
  display: block;
  position: absolute;
  top: -51px;
  left: 24px;
  right: 24px;
  height: 50px;
  flex-shrink: 0;
  background-image: linear-gradient(to top, rgba(255, 255, 255, 0.75), transparent);
  pointer-events: none;
}

.button {
  padding: 12px 20px;
  border-radius: 8px;
  background-color: transparent;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s ease;
}

.button.is-ghost:hover,
.button.is-ghost:focus {
  background-color: #dfdad7;
}

.button.is-primary {
  background-color: #750550;
  color: #fff;
}
.button.is-primary:hover,
.button.is-primary:focus {
  background-color: #4a0433;
}

.icon-button {
  padding: 0;
  border: none;
  background-color: transparent;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  cursor: pointer;
  border-radius: 8px;
  transition: 0.15s ease;
}
.icon-button svg {
  width: 24px;
  height: 24px;
}
.icon-button:hover,
.icon-button:focus {
  background-color: #dfdad7;
}
</style>
