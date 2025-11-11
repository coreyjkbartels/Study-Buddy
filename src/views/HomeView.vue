<script setup>
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'

const router = useRouter()

function signOut() {
  localStorage.clear()
  router.push('/')
}
</script>

<template>
  <Header />

  <div class="dashboard">
    <aside class="sidebar">
      <h2>Study Buddy</h2>
      <nav>
        <RouterLink to="/home" class="nav-item">Dashboard</RouterLink>
        <RouterLink to="/profile" class="nav-item">Profile</RouterLink>
        <RouterLink to="/friends" class="nav-item">Study Buddies</RouterLink>
        <RouterLink to="/messages" class="nav-item">Messages</RouterLink>
        <RouterLink to="/groupchat" class="nav-item">Group Chat</RouterLink>
        <RouterLink to="/assignment" class="nav-item">Assignments</RouterLink>
      </nav>
      <button class="signout" @click="signOut">Sign Out</button>
    </aside>

    <main class="main-content">
      <header>
        <h1>Welcome Back!</h1>
        <p>Here’s your Study Buddy dashboard.</p>
      </header>
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
  grid-template-columns: 260px 1fr 340px;
  /* left / center / right */
  gap: var(--gap);
  background: var(--white);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  padding: 1.25rem;
  box-sizing: border-box;
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
  box-shadow: 0 8px 30px rgba(25, 118, 210, 0.10);
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
  display: inline-block;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  color: var(--white);
  text-decoration: none;
  font-weight: 600;
  transition: background .18s ease, transform .12s ease;
  text-align: left;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
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

header {
  background: var(--white);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(25, 118, 210, 0.06);
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
</style>