<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const email = ref("")
const password = ref("")
const errormsg = ref("")

async function signIn(event) {
  event.preventDefault()

  if(!email.value|| !password.value){
    errormsg.value = "Please enter your email and password."
    return
  }

  const data = {
    email: email.value,
    password: password.value
  }
    
  const url = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app/user/sign-in'

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    const data = await response.json()
    localStorage.setItem("token", data.token)
    localStorage.setItem("username", data.user.username)

    router.push({
      name: 'home'
    })
  }
  else if (response.status === 400) {
    errormsg.value = "Invalid email or password"
    console.log("Invalid email or password.")
  }
  else if (response.status === 500) {
    errormsg.value = "Internal Server Error"
    console.log("Internal Server Error")
  }
  else{
    console.log("other error",response.status,await response.text())
  }
}

</script>

<template>


  <main>
    <div class="wrapper">
      <form @submit.prevent="signIn">
        <h1>Sign in</h1>
        <p v-if="errormsg" class="err">{{ errormsg }}</p>
        <div class="input-box">
          <input type="email" v-model = "email" placeholder="Email" required>
        </div>
        <div class="input-box">
          <input type="password" v-model = "password" placeholder="Password" required>
        </div>
        <div class="remember-forgot">
          <label><input type="checkbox">Remember me</label>
        </div>
        <button class="btn" type="submit">Sign In</button>
        <div class="join-link">
          <p>Do not have a account? <RouterLink to="/signup">Join</RouterLink></p>
        </div>
      </form>

    </div>
  </main>
</template>

<style scoped>
:deep(body) {
  background-color: #f9fafb;
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}

.container,
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1.5rem;
}

form {
  background: #ffffff;
  padding: 2rem 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

h1, h2 {
  text-align: center;
  color: #1f2937;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

label {
  display: block;
  color: #4b5563;
  font-size: 0.875rem;
  margin-bottom: 0.4rem;
}

input[type="email"],
input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  outline: none;
}

button[type="submit"] {
  background-color: #1976d2;
  color: white;
  padding: 0.7rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

button[type="submit"]:hover {
  background-color: #4338ca;
}

p {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

a {
  color: #4f46e5;
  font-weight: 500;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
