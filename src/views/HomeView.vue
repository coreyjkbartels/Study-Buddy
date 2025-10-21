<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function signOut() {
  // Replace this with userStore reset logic
  console.log('User signed out!')
  router.push('/')
}
</script>

<template>
  <div class="home">
    <nav class="navbar">
      <RouterLink to="/profile" class="nav-btn">Profile</RouterLink>
      <button class="nav-btn" @click="signOut">Sign Out</button>
    </nav>

    <main class="content">
      <h1>Home</h1>
      <p>Welcome to your Study Buddy dashboard!</p>
    </main>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9fafb;
  color: #222;
  font-family: system-ui, sans-serif;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: #1976d2;
}

/* Buttons */
.nav-btn {
  color: white;
  text-decoration: none;
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}
.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
