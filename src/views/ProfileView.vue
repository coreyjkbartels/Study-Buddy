<script setup>


</script>

<template>
  <div class="main-container">
    <div class="header-container">
      <button class="back-button"></button>
    </div>
    <form action="" class="form-container">

    </form>


  </div>
</template>

<style scoped>


.header-container {
  width: 100vw;
  height: 70px;
  background: black;
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: left;

}

.back-button {
  margin-left: 4rem;
}

.form-container {
  width: 800px;
  height: 600px;
  background: blue;
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
