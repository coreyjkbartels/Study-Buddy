<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import ProfileView from '@/views/ProfileView.vue'
import FriendsView from '@/views/FriendsView.vue'
import MessagesView from '@/views/MessagesView.vue'
import GroupchatView from '@/views/GroupchatView.vue'
import Assignment from '@/views/Assignment.vue'

const router = useRouter()
const activeTab = ref('dashboard')

function signOut() {
  localStorage.clear()
  router.push('/')
}

function setActiveTab(tab) {
  activeTab.value = tab
}
</script>

<template>
  <Header />

  <div class="dashboard">
    <aside class="sidebar">
      <h2>Dashboard</h2>
      <nav>
        <button
          @click="setActiveTab('profile')"
          :class="['nav-item', { active: activeTab === 'profile' }]"
        >
          Profile
        </button>
        <button
          @click="setActiveTab('friends')"
          :class="['nav-item', { active: activeTab === 'friends' }]"
        >
          Study Buddies
        </button>
        <button
          @click="setActiveTab('messages')"
          :class="['nav-item', { active: activeTab === 'messages' }]"
        >
          Messages
        </button>
        <button
          @click="setActiveTab('groupchat')"
          :class="['nav-item', { active: activeTab === 'groupchat' }]"
        >
          Group Chat
        </button>
        <button
          @click="setActiveTab('assignment')"
          :class="['nav-item', { active: activeTab === 'assignment' }]"
        >
          Assignments
        </button>
      </nav>
      <button class="signout" @click="signOut">Sign Out</button>
    </aside>

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
</template>

<style scoped>
:root {
  --primary: #6366f1;
  --accent: #1976d2;
  --white: #ffffff;
  --text: #0b1220;
  --radius: 12px;
  --gap: 1.25rem;
}

.dashboard {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--gap);
  background: var(--white);
  color: var(--text);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial;
  padding: 1.25rem;
  box-sizing: border-box;
}

:deep(.messages-page) {
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
}

.sidebar {
  grid-column: 1 / 2;
  background: linear-gradient(180deg, #6366f1 0%, #1976d2 100%);
  color: var(--white);
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  box-shadow: 0 8px 30px rgba(25, 118, 210, 0.1);
}

.sidebar h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-align: left;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  color: var(--white);
  text-decoration: none;
  font-weight: 600;
  transition:
    background 0.18s ease,
    transform 0.12s ease;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 700;
}

.signout {
  margin-top: auto;
  background: var(--white);
  color: #6366f1;
  border: none;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.signout:hover {
  background: linear-gradient(180deg, #6366f1, #1976d2);
  color: var(--white);
}

.main-content {
  grid-column: 2 / 3;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.75rem 1rem;
  background: transparent;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

header h1 {
  margin: 0 0 0.4rem 0;
  color: var(--primary);
  font-size: 1.4rem;
  font-weight: 800;
}

header p {
  margin: 0;
  color: #263044;
}

.content-card {
  background: var(--white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(25, 118, 210, 0.06);
}
</style>
