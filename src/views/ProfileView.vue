<script setup>
import { useRouter } from 'vue-router'
import { useTemplateRef, ref, onMounted } from 'vue'
import Modal from '../components/Modal.vue'

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
  const userToken = localStorage.getItem('token')
  console.log(userToken)

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
  }

  const response = await fetch(url, options)

  if (response.status === 200) {
    const data = await response.json()

    firstName.value = data.user.firstName
    lastName.value = data.user.lastName
    username.value = data.user.username
    email.value = data.user.email

    console.log(data.user)
  } else {
    console.log('sum ting wong', response.status)
  }
}

async function editUser() {
  const data = {
    firstName: newFirstName.value || firstName.value,
    lastName: newLastName.value || lastName.value,
    username: newUsername.value || username.value,
    email: newEmail.value || email.value,
    password: newPassword.value,
  }

  let url = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app/user'

  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
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
  <!-- <Header /> -->
  <div class="main-container">
    <div class="profile-card">
      <div class="profile-header">
        <button class="back-button" @click="router.back()">← Back</button>
        <h1>User Profile</h1>
        <button class="edit-button" @click="modal.open">Edit</button>
      </div>

      <div class="profile-content">
        <div class="info-row">
          <div class="info-field">
            <label>First Name</label>
            <div class="info-value">{{ firstName }}</div>
          </div>
          <div class="info-field">
            <label>Last Name</label>
            <div class="info-value">{{ lastName }}</div>
          </div>
        </div>

        <div class="info-field full-width">
          <label>Username</label>
          <div class="info-value">{{ username }}</div>
        </div>

        <div class="info-field full-width">
          <label>Email</label>
          <div class="info-value">{{ email }}</div>
        </div>
      </div>
    </div>
  </div>

  <Modal ref="name-modal">
    <template #header>
      <h1 class="primary-heading">Edit Profile</h1>
    </template>
    <template #main>
      <div class="modal-fields">
        <input
          type="text"
          v-model="newFirstName"
          id="firstName"
          name="firstName"
          :placeholder="firstName || 'First Name'"
        />
        <input
          type="text"
          v-model="newLastName"
          id="lastName"
          name="lastName"
          :placeholder="lastName || 'Last Name'"
        />
        <input
          type="text"
          v-model="newUsername"
          id="username"
          name="username"
          :placeholder="username || 'Username'"
        />
        <input
          type="email"
          v-model="newEmail"
          id="userEmail"
          name="userEmail"
          :placeholder="email || 'Email'"
          required
        />
        <input
          type="password"
          v-model="newPassword"
          id="password"
          name="password"
          placeholder="New Password (leave blank to keep current)"
        />
      </div>
    </template>
    <template #footer>
      <button @click.stop="cancel" class="cancel-btn">Cancel</button>
      <button @click.stop="save" class="save-btn">Save</button>
    </template>
  </Modal>
</template>

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--white);
  padding: 1.25rem;
  box-sizing: border-box;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial;
}

.profile-card {
  width: 100%;
  max-width: 700px;
  background: var(--white);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border);
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid;
  border-image: linear-gradient(90deg, #6366f1, #1976d2) 1;
}

.profile-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text);
}

.back-button,
.edit-button {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--text);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.back-button:hover,
.edit-button:hover {
  background: var(--bg-light);
  border-color: var(--primary);
  color: var(--primary);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-field.full-width {
  width: 100%;
}

.info-field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--text);
  border: 1px solid var(--border);
}

/* Modal Styles */
:deep(.modal),
:deep(.modal-content),
:deep(.modal-wrapper) {
  background: #18181b !important;
}

.modal .primary-heading {
  margin: 20px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e5e7eb;
}

.modal .modal-fields {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.5rem 0;
}

.modal input {
  padding: 0.75rem 1rem;
  border: 1px solid #52525b;
  background: #3f3f46;
  color: var(--white);
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.15s ease;
  margin-left: 20px;
  margin-right: 20px;
}

.modal input::placeholder {
  color: #a1a1aa;
}

.modal input:focus {
  border-color: var(--primary);
  background: #52525b;
}

.modal button {
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal .cancel-btn {
  background: transparent;
  color: #a1a1aa;
  border: none;
}

.modal .cancel-btn:hover {
  color: #e5e7eb;
}

.modal .save-btn {
  background: var(--primary);
  color: var(--white);
  border: none;
}

.modal .save-btn:hover {
  background: var(--accent);
}
</style>
