<script setup>

import { useRouter } from 'vue-router'


const router = useRouter()


</script>

<template>
  <div class="main-container">
    <div class="header-container">
      <div @click="router.back()" class="back-button"><img src="../assets/icons/back-button.png" alt="" class="back-img"></div>
    </div>
    <form action="" class="form-container">
      <div class="form-header-container">
        <span class="form-header">User Info</span>

      </div>

    </form>


  </div>
</template>

<style scoped>


.header-container {
  width: 100vw;
  height: 80px;
  background: rgb(208, 208, 208);
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: left;

}

.back-img {
  width: 50px;

}

.back-button {
  width: 50px;
  height: 50px;

  margin-left: 2rem;
  cursor: pointer;
}

.back-button:hover {
  transform: scale(1.1);
}

.form-header-container {
  height: 70px;

display: flex;
align-items: center;
justify-content: center;
}

.form-header {
  font-size: 30px;
}

.form-container {
  width: 800px;
  height: 600px;
  background: rgb(173, 173, 173);
  border-radius: 10px;


}

.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: rgb(229, 229, 229);
  position: relative;

}
</style>
