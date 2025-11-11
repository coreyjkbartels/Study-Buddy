<template>
  <div class="splash">
    <main class="content">
      <h1>Study Buddy</h1>

      <div class="buttons">
        <RouterLink to="/signin" class="nav-btn">Sign In</RouterLink>
        <RouterLink to="/signup" class="nav-btn">Sign Up</RouterLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
.splash {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  color: white;
  font-family: system-ui, sans-serif;
}

.content {
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.nav-btn {
  color: white;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  transition: background 0.2s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* temp */
.temp {
  margin-top: 2.5rem;
}

.temp-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #fff;
  color: #1976d2;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s ease;
}

.temp-btn:hover {
  background: #e3f2fd;
}
</style>
