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
          'Authorization': `Bearer ${token}`
        }
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
      <h1 class="logo">Study Buddy</h1>
      <nav class="nav">
        <RouterLink to="/home" class="nav-item">Home</RouterLink>
        <RouterLink to="/profile" class="nav-item">Profile</RouterLink>
        <RouterLink to="/friends" class="nav-item">Friends</RouterLink>
        <button class="signout" @click="logout">Sign Out</button>
      </nav>
    </div>
  </header>
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

.header {
  color: var(--white);
  border-radius: var(--radius);
  padding: 0.75rem 1.5rem;
  box-shadow: 0 8px 24px rgba(25,118,210,0.15);
  margin-bottom: 1.25rem;
}

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

.nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-item {
  color: var(--white);
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: background 0.2s ease, transform 0.1s ease;
}

.nav-item:hover {
  background: rgba(255,255,255,0.15);
  transform: translateY(-2px);
}

.signout {
  background: var(--white);
  color: var(--primary);
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.1s ease;
}

.signout:hover {
  background: linear-gradient(90deg, #6366f1, #1976d2);
  color: var(--white);
  transform: translateY(-2px);
}
</style>