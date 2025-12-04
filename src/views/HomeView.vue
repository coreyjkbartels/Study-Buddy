<script setup>
import Header from '@/components/Header.vue'
</script>

<template class="test">
  <div class="page">
    <Header />

    <div class="dashboard">
      <nav class="sidebar">
        <RouterLink class="clicker" :to="{ name: 'dashboard' }">Dashboard</RouterLink>

        <RouterLink class="clicker" :to="{ name: 'profile' }">Profile</RouterLink>

        <RouterLink class="clicker" :to="{ name: 'friends' }">Buddies</RouterLink>

        <RouterLink class="clicker" :to="{ name: 'messages' }">Messages</RouterLink>

        <RouterLink class="clicker" :to="{ name: 'assignments' }">Assignments</RouterLink>

        <RouterLink class="clicker" :to="{ name: 'schedule' }">Schedule</RouterLink>
      </nav>

      <main class="main-content">
        <RouterView></RouterView>
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

.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 700;
}

.main-content {
  height: 100%;
}

.tab-content {
  height: 100%;
}
</style>
