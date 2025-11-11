<script setup>

import { useRouter } from 'vue-router'
import { useTemplateRef, ref, onMounted } from 'vue'
import Modal from '../components/Modal.vue'
import Header from '@/components/Header.vue'


const router = useRouter()
const modal = useTemplateRef('name-modal')

onMounted(() => {
  grabData()
})

const firstName = ref()
const lastName = ref()
const username = ref()
const email = ref()


const newFirstName = ref()
const newLastName = ref()
const newUsername = ref()
const newEmail = ref()
const newPassword = ref()




async function grabData() {
  let url = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app/user'
  const userToken = localStorage.getItem('token');
  console.log(userToken);



  const options = {
    method: 'GET',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${userToken}`
    }

  }


  const response = await fetch(url, options)

  if(response.status === 200) {
    const data = await response.json()

    firstName.value = data.user.firstName
    lastName.value = data.user.lastName
    username.value = data.user.username
    email.value = data.user.email

    console.log(data.user)
  } else {
    console.log("sum ting wong", response.status)
  }
}

async function editUser() {



    const data = {
      firstName: newFirstName.value || firstName.value,
      lastName: newLastName.value || lastName.value,
      username: newUsername.value || username.value,
      email: newEmail.value || email.value,
      password: newPassword.value
    }

    let url = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app/user'

    const options = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
    }

    const response = await fetch(url, options)

    if (response.status === 200) {

      localStorage.setItem('firstName', data.firstName)
      localStorage.setItem('lastName', data.lastName)
      localStorage.setItem('username', data.username)
      localStorage.setItem('email', data.email)
      grabData()
      console.log('firstName')

    } else {
        console.log('error')
        console.log(response.status)
    }
}







function cancel(e) {
    modal.value.close(e)
}

function save(e) {
    e.preventDefault()
    editUser()
    modal.value.close(e)
}





</script>

<template>
  <Header />
  <div class="main-container">
    <div class="form-container">
      <div class="form-header-container">
        <button class="back-button" @click="router.back()">Go Back</button>
        <span class="form-header">User Info</span>
        <div class="edit-button-container">
          <button class="edit-button" @click="modal.open"> Edit </button>
        </div>


      </div>

      <div class="user-info-container">
        <div class="user-name-container">
          <div class="input-name-wrapper">
            <span class="input-header">First Name</span>
            <span class="data-text">{{ firstName }}</span>
          </div>
          <div class="input-name-wrapper">
            <span class="input-header">Last Name</span>
            <span class="data-text">{{ lastName }}</span>
          </div>
        </div>
        <div class="user-background-container">
          <div class="user-background-wrapper">
            <span class="input-header">Username</span>
            <span class="data-text large">{{ username }}</span>
          </div>
          <div class="user-background-wrapper">
            <span class="input-header">Email</span>
            <span class="data-text large">{{ email }}</span>
          </div>
        </div>

      </div>

    </div>


  </div>
  <Modal ref="name-modal">
            <template #header>
                <h1 class="primary-heading">Edit Profile</h1>
            </template>
            <template #main>
                <div class="firstLastModal">
                    <input
                        type="text"
                        v-model="newFirstName"
                        id="firstName"
                        name="firstName"
                        placeholder="New First Name"
                    />
                    <input
                        type="text"
                        v-model="newLastName"
                        id="lastName"
                        name="lastName"
                        placeholder="New Last Name"
                    />
                </div>
                <div class="user-info-container">
                    <input
                        type="email"
                        v-model="newEmail"
                        id="userEmail"
                        name="userEmail"
                        placeholder="New Email"
                        required
                    />
                    <input
                        type="text"
                        v-model="newUsername"
                        id="username"
                        name="username"
                        placeholder="New Username"
                    />
                    <input
                        type="text"
                        v-model="newPassword"
                        id="password"
                        name="password"
                        placeholder="New Password"
                    />
                </div>
            </template>
            <template #footer>
                <button @click.stop="cancel">Cancel</button>
                <button @click.stop="save">Save</button>
            </template>
        </Modal>
</template>

<style scoped>



.user-background-wrapper {
  display: flex;
  flex-direction: column;



}

.input-header {
  font-size: 17px;
  color: white;
}


.user-background-container {
  display: flex;
  flex-direction: column;

  height: 300px;
  align-items: center;
  padding-top: 1rem;
  gap: 3rem;
}
.user-name-container {
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: space-between;
  align-items: center;




}
.input-name-wrapper {
  display: flex;
  flex-direction: column;
}

.data-text {
  width: 325px;
  height: 60px;
  border-radius: 20px;
  background: rgba(230, 234, 236, 0.412);
  display: flex;
  align-items: center;
  justify-content: left;
  padding-left: 1rem;
  font-size: 20px;

}


.input-background {
  height: 45px;
  width: 700px;
}
.user-info-container {
  width: 700px;
  height: 450px;


  display: flex;
  flex-direction: column;
  justify-content: space-arou;
}

.header-container {
  width: 100vw;
  height: 80px;
 background: #1976d2;
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: left;

}


.back-img {
  width: 50px;

}


button:hover {
  transform: scale(1.1);
}

.form-header-container {
  height: 100px;
  width: 700px;
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;




}



.back-button {
  width: 60px;
  height: 40px;
  border: none;
  background: rgba(233, 229, 229, 0.419);
  margin: 0;
  border-radius: 10px;
  cursor: pointer;
}


.edit-button {
  width: 60px;
  height: 40px;
  border: none;

  background: rgba(233, 229, 229, 0.419);
  border-radius: 10px;
  cursor: pointer;


}



.form-header {
  font-size: 35px;
  color: rgba(255, 255, 255, 0.75);
  padding-right: 1rem;
}

.form-container {
  width: 800px;
  height: 600px;
background: linear-gradient(180deg, #6366f1 0%, #1976d2 100%);

  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;


}

.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 80px);
  background: white;
  position: relative;





}


.large {
  width: 700px;
}


/* modal editing */
.modal .firstLastModal {
    display: flex;
    flex-direction: column;
}

.modal .user-info-container {
    display: flex;
    flex-direction: column;
}

.modal input {
    margin: 0.7rem 0.5rem;
    height: 50px;
    color: white;
    outline: none;
    border: 2px solid grey;

    background: rgba(233, 233, 233, 0.506);
    box-sizing: border-box;
    padding-left: 1rem;
    font-size: 15px;
}

/* Modal button styling */
.modal button {
    width: 100px;
    height: 40px;
    border-radius: 10px;
    color: white;
    font-size: 15px;

    background: transparent;
    backdrop-filter: blur(5px);
    border: 2px solid grey;
    cursor: pointer;
}

.modal button:hover {
    background: rgba(174, 40, 40, 0.274);
}

.primary-heading {
  margin-block: 1rem;
  font-size: 30px;
  color: white;
}
</style>
