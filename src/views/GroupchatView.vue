<script setup>
import Header from '@/components/Header.vue'

</script>

<template>
  <Header></Header>

  <div class="main-container">

    <div class="groupchat-container">
      <div class="sidebar-chats">
        <span class="sidebar-header">Groupchats</span>
        <div class="chatbox-container">


        </div>
      </div>
      <div class="chats-container">

      </div>

    </div>

  </div>
</template>


<style scoped>

.main-container {
  height: calc(100vh - 84px);
  background: white;
  display: flex;
  justify-content: center;
  align-items: top;

}

.sidebar-chats {
  width: 400px;
  height: 820px;;

  background: white;
  display: flex;
  flex-direction: column;


}

.chats-container {
  width: 800px;
  height: 820px;
  display: flex;
  background: rgb(255, 255, 255);
  border-left: 1px solid black;

}


.groupchat-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 820px;
  margin-top: 1rem;
  box-shadow: 0 0 5px 5px rgb(243, 243, 243);

}

.sidebar-header {
  font-size: 20px;
  padding: 1rem;
  font-weight: 700;
}

.chatbox-container {
  display: flex;
  flex-direction: column;

}

.chat-box {
  width: 400px;
  height: 80px;
  background: rgb(255, 255, 255);
  border-top: 1px solid black;

}





</style>
