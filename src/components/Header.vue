<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app'

async function logout() {
  try {
    const token = localStorage.getItem('token')

    if (token) {
      await fetch(`${API_BASE}/user/sign-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    localStorage.clear()
    router.push('/signin')
  }
}
</script>

<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <img class="logo-image" src="../../favicon.svg" alt="App Logo" />
        <RouterLink to="/home" class="logo-text">Study Buddy</RouterLink>
      </div>
      <nav class="nav">
        <RouterLink to="/profile" class="clicker clicker-colored">Profile</RouterLink>
        <RouterLink to="/friends" class="clicker clicker-colored">Friends</RouterLink>
        <button class="clicker clicker-colored" @click="logout">Sign Out</button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.nav,
.logo {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.logo-image {
  width: 48px;
}

.logo-text {
  font-size: var(--fs-link-large);
  font-weight: bold;
  color: var(--color-text);
  text-decoration: none;
}

.clicker-colored:hover {
  background: var(--c-primary);
  transform: translateY(-2px);
}
</style>
