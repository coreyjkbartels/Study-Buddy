<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Header from '@/components/Header.vue';

const router = useRouter()

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const username = ref("")
const password = ref("")
const confirmpassword = ref("")
const errormsg = ref("")

async function Join(event) {
  event.preventDefault()
  errormsg.value = ""

  if (!firstName.value || !lastName.value || !email.value || !username.value || !password.value || !confirmpassword.value) {
    errormsg.value = "Fill out all the fields"
    return
  }
  if (password.value !== confirmpassword.value) {
    errormsg.value = "Password does not match"
    return
  }
  if (password.value.length < 8) {
    errormsg.value = "Atleast 8 characters"
    return
  }

  const data = {
    username: username.value,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value
  }
  console.log("Sending Data:", data)

  const url = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app/user'

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }

  let response = await fetch(url, options)
  console.log("Response:", response.status);

  if (response.status === 201) {
    const data = await response.json()
    console.log("Registration successful:", data)

    localStorage.clear()

    localStorage.setItem("username", data.user.username)
    localStorage.setItem('firstName', data.user.firstName)
    localStorage.setItem('lastName', data.user.lastName)
    localStorage.setItem('email', data.user.email)
    localStorage.setItem('userId', data.user._id)

    if (data.token) {
      localStorage.setItem("token", data.token)
      console.log("Token stored successfully")
    } else {
      console.warn("No 'token' property found in the registration response.");
    }

    router.push({
      name: 'home'
    })
  }
  else if (response.status === 400) {
    const errorData = await response.json()
    console.log("Error data:", errorData)

    if (errorData.errors) {
      const firstError = Object.values(errorData.errors)[0]
      errormsg.value = firstError.message || "Invalid input"
    } else {
      errormsg.value = "Invalid email or password"
    }
  }
  else if (response.status === 500) {
    errormsg.value = "Internal Server Error"
    console.log("Server error")
  }
}
</script>

<template>
  <main>
    <div class="wrapper">
      <form @submit.prevent="Join">
        <h1>Join</h1>
        <p v-if="errormsg" class="err">{{ errormsg }}</p>
        <div class="input-box">
          <input type="text" v-model="firstName" placeholder="First Name" required>
        </div>
        <div class="input-box">
          <input type="text" v-model="lastName" placeholder="Last Name" required>
        </div>
        <div class="input-box">
          <input type="email" v-model="email" placeholder="Email" required>
        </div>
        <div class="input-box">
          <input type="text" v-model="username" placeholder="Username" required>
        </div>
        <div class="input-box">
          <input type="password" v-model="password" placeholder="Password" required>
        </div>
        <div class="input-box">
          <input type="password" v-model="confirmpassword" placeholder="Confirm Password" required>
        </div>
        <button class="btn" type="submit">Join</button>
        <div class="join-link">
          <p>Already have a account? <RouterLink to="/signin">Sign in</RouterLink>
          </p>
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

h1,
h2 {
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
  background-color: #4f46e5;
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

.err {
  background: #fee;
  color: #dc2626;
  padding: 0.6rem;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
  border: 1px solid #fca5a5;
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
