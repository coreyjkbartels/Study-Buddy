<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import ProfileView from '@/views/ProfileView.vue'
import FriendsView from '@/views/FriendsView.vue'
import MessagesView from '@/views/MessagesView.vue'
import GroupchatView from '@/views/GroupchatView.vue'
import Assignment from '@/views/Assignment.vue'

const activeTab = ref('dashboard')

function setActiveTab(tab) {
  activeTab.value = tab
}
</script>

<template class="test">
  <div class="page">
    <Header />

    <div class="dashboard">
      <nav class="sidebar">
        <button
          @click="setActiveTab('profile')"
          :class="['clicker', { active: activeTab === 'profile' }]"
        >
          Profile
        </button>
        <button
          @click="setActiveTab('friends')"
          :class="['clicker', { active: activeTab === 'friends' }]"
        >
          Study Buddies
        </button>
        <button
          @click="setActiveTab('messages')"
          :class="['clicker', { active: activeTab === 'messages' }]"
        >
          Messages
        </button>
        <button
          @click="setActiveTab('groupchat')"
          :class="['clicker', { active: activeTab === 'groupchat' }]"
        >
          Group Chat
        </button>
        <button
          @click="setActiveTab('assignment')"
          :class="['clicker', { active: activeTab === 'assignment' }]"
        >
          Assignments
        </button>
      </nav>

      <main class="main-content">
        <!-- Dashboard Tab -->
        <div v-if="activeTab === 'dashboard'" class="tab-content">
          <header>
            <h1>Welcome Back!</h1>
            <p>Here's your Study Buddy dashboard.</p>
          </header>
        </div>

        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="tab-content">
          <ProfileView />
        </div>

        <!-- Study Buddies Tab -->
        <div v-if="activeTab === 'friends'" class="tab-content">
          <FriendsView />
        </div>

        <!-- Messages Tab -->
        <div v-if="activeTab === 'messages'" class="tab-content">
          <MessagesView />
        </div>

        <!-- Group Chat Tab -->
        <div v-if="activeTab === 'groupchat'" class="tab-content">
          <GroupchatView />
        </div>

        <!-- Assignments Tab -->
        <div v-if="activeTab === 'assignment'" class="tab-content">
          <Assignment />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);

  height: 100%;

  padding-inline: var(--width-gutter);
  padding-block: var(--height-gutter);
}

.dashboard {
  height: 100%;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-500);
}

/* :deep(.messages-page) {
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.messages-container) {
  width: 100% !important;
  max-width: 100% !important;
}

:deep(.friends-page) {
  margin-left: 10% !important;
  padding: 0 !important;
  width: 80% !important;
}

:deep(.friends-container) {
  width: 80% !important;
} */

.sidebar {
  grid-column: 1 / 2;

  display: flex;
  flex-direction: column;
  align-items: stretch;

  padding-inline: var(--space-250);
  padding-block: var(--space-400);
  border-radius: 12px;
  gap: var(--space-100);

  background: var(--background-gradient);
}

.clicker {
  font-size: var(--fs-link-large);
  text-align: left;
  background: transparent;
}

.clicker:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.clicker.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 700;
}

.main-content {
  height: 100%;
}

.tab-content {
  /* display: flex;
  flex-direction: column;
  gap: 1.25rem; */
  height: 100%;
}

/* header h1 {
  margin: 0 0 0.4rem 0;
  color: var(--primary);
  font-size: 1.4rem;
  font-weight: 800;
} */

/* header p {
  margin: 0;
  color: #263044;
} */

/* .content-card {
  background: var(--white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(25, 118, 210, 0.06);
} */
</style>
