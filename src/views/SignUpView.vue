<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const userName = ref("")
const password = ref("")
const confirmpassword = ref("")
const errormsg = ref("")

async function Join(event) {
  event.preventDefault()

  if (!firstName.value || !lastName.value || !email.value || !userName.value || !password.value || !confirmpassword.value) {
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
    userName: userName.value,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value
  }
  console.log(data)

  // const url =

  // const options = {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(data),
  // }

  let response = await fetch(url, options)
  console.log("Response:", response.status);
  if (response.status === 201) {
    const data = await response.json()
    console.log(data.status, response.text())
    localStorage.setItem("userName", data.user.userName)
    localStorage.setItem('firstName', data.user.firstName)
    localStorage.setItem('lastName', data.user.lastName)
    localStorage.setItem('email', data.user.email)

    router.push({
      name: 'normal'
    })
  }
  else if (response.status === 400) {
    errormsg.value = "Invalid email or password"
    console.log('hi')
  }
  else if (response.status === 500) {
    errormsg.value = "Internal Server Error"
    console.log(data.status, response.text())
  }
}
</script>

<template>
  <Header>
    <nav>
      <RouterLink to="/signin">Sign In</RouterLink>
      <RouterLink to="/">Home</RouterLink>
    </nav>
  </Header>

  <main>
    <div class="wrapper">
      <form @submit.prevent="Join">
        <h1>Join</h1>
        <p v-if="errormsg" class="err">{{ errormsg }}</p>
        <div class="input-box">
          <input type="text" v-model="firstName" placeholder="First Name" unique required>
        </div>
        <div class="input-box">
          <input type="text" v-model="lastName" placeholder="Last Name" required>
        </div>
        <div class="input-box">
          <input type="email" v-model="email" placeholder="Email" required>
        </div>
        <div class="input-box">
          <input type="text" v-model="userName" placeholder="Username" required>
        </div>
        <div class="input-box">
          <input type="password" v-model="password" placeholder="Password" required>
        </div>
        <div class="input-box">
          <input type="password" v-model="confirmpassword" placeholder="Confirm Password" required>
        </div>
        <button class="btn" type="submit">Join</button>
        <div class="join-link">
          <p>Already have a account? <RouterLink to="/signin">Sign in</RouterLink></p>
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
  background: #bbdefb;
}
</style>
