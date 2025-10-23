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

  // const url =

  // const options = {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(data),
  // }

  let response = await fetch(url, options)

  if (response.status === 200) {
    const data = await response.json()
    localStorage.setItem("token", data.token)
    localStorage.setItem("userName", data.user.userName)

    router.push({
      name: 'normal'
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
  <Header>
    <nav>
      <RouterLink to="/join">Join</RouterLink>
      <RouterLink to="/">Home</RouterLink>
    </nav>
  </Header>

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
          <p>Do not have a account? <RouterLink to="/join">Join</RouterLink></p>
        </div>
      </form>

    </div>
  </main>
</template>

<style scoped>
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #e3f2fd;
}
</style>
