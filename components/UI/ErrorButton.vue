<template>
  <button class="button-87" role="button">
    <slot/>
  </button>
</template>

<style scoped>
.button-87 {
  padding: 5px 10px;
  text-align: center;
  text-transform: uppercase;
  font-size: 14px;
  transition: 0.5s;
  background-size: 200% auto;
  color: white;
  border-radius: 10px;
  display: block;
  border: 0px;
  font-weight: 700;
  box-shadow: 0px 0px 14px -7px #f09819;
  background-image: linear-gradient(45deg, #ff2323 0%, #f01919  51%, #ff2f2f  100%);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-87:hover {
  background-position: right center;
  /* change the direction of the change here */
  color: #fff;
  text-decoration: none;
}

.button-87:active {
  transform: scale(0.95);
}
</style>
