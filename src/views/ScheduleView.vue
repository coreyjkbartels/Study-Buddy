<script setup>
import { fetchResponse } from '@/assets/fetch'
import { getMonthLength } from '@/assets/util'
import DateCard from '@/components/DateCard.vue'
import { ref, onMounted, onUnmounted } from 'vue'

const sessions = ref([])
const selectedSession = ref(null)
const currentUser = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const pollingInterval = ref(null)

const today = ref(new Date())
const weekOffset = ref(0)
console.log(today.value.getDay())

const creatingNewSession = ref(false)

const formModel = ref({
  name: '',
  description: '',
  date: '',
  location: '',
})

// 1. GETS/users
async function fetchCurrentUser() {
  try {
    const response = await fetchResponse('/user', 'GET')

    if (!response.ok) {
      if (response.status === 400 || response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        window.location.href = '/signin'
      }
      return
    }
    const data = await response.json()
    currentUser.value = data.user
  } catch (err) {
    console.error('fetchCurrentUser error:', err)
  }
}

// 2. GETS/sessions
async function fetchSessions(isInitialLoad = false) {
  if (isInitialLoad) isLoading.value = true

  try {
    const response = await fetchResponse('/sessions', 'GET')

    if (!response.ok) {
      errorMessage.value = 'Failed to load assignments'
      return
    }

    const data = await response.json()
    sessions.value = data
  } catch (err) {
    console.error('fetchAssignments error:', err)
    errorMessage.value = 'Failed to load assignments'
  } finally {
    if (isInitialLoad) isLoading.value = false
  }
}

async function createSession() {
  const data = { ...formModel.value }

  try {
    const response = await fetchResponse('/session', 'POST', data)

    if (!response.ok) {
      const errorData = await response.json()
      console.log('Server Error Details:', errorData)

      errorMessage.value = 'Failed to create session. Check console for details.'
      return
    }

    await fetchSessions()
    resetForm()
    errorMessage.value = ''
  } catch (err) {
    console.log('createAssignment error:', err)
    errorMessage.value = 'Error creating assignment'
  }
}

function selectSession(session) {
  stopPolling()

  creatingNewSession.value = false
  selectedSession.value = session

  console.log(session)

  errorMessage.value = ''
}

function formatISOString(string) {
  const dateObject = new Date(string)
  const formattedDate = dateObject.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return formattedDate
}

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...'
  }
  return text
}

function resetForm() {
  selectedSession.value = null
  formModel.value = {
    name: '',
    description: '',
    date: '',
    location: '',
  }
}

function startPolling() {
  stopPolling()
  pollingInterval.value = setInterval(() => {
    fetchSessions(false)
  }, 5000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

function toggleSessionCreation() {
  resetForm()
  selectSession.value = null
  creatingNewSession.value = true
}

function isToday(dayIndex, weekOffset) {
  return today.value.getDate() === getDate(dayIndex, weekOffset)
}

function getDate(dayIndex, weekOffset) {
  let previousMonthLength = today.value.getMonth() - 1
  if (previousMonthLength < 0) previousMonthLength = 11
  previousMonthLength = getMonthLength(previousMonthLength)
  let currentMonthLength = getMonthLength(today.value.getMonth())

  let value = today.value.getDate() + (dayIndex - today.value.getDay()) + weekOffset * 7
  if (value < 1) value = previousMonthLength - value
  else if (value > currentMonthLength) value -= currentMonthLength
  return value
}

onMounted(async () => {
  await fetchCurrentUser()
  await fetchSessions(true)
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="main-column">
    <div class="main-column-heading">
      <h1>Schedule</h1>
      <button class="clicker clicker-inverted" @click="toggleSessionCreation()">
        Schedule Session
      </button>
    </div>

    <div class="info-card-row">
      <DateCard :class="{ 'today-card': isToday(0, weekOffset) }">
        <template #date>
          <div class="column">
            <span>Sun</span>
            <h2>{{ getDate(0, weekOffset) }}</h2>
          </div>
          <div class="column bottom">
            <h2>2</h2>
            <span>sessions</span>
          </div>
        </template>
      </DateCard>

      <DateCard :class="{ 'today-card': isToday(1, weekOffset) }">
        <template #date>
          <div class="column">
            <span>Mon</span>
            <h2>{{ getDate(1, weekOffset) }}</h2>
          </div>
          <div class="column bottom">
            <h2>2</h2>
            <span>sessions</span>
          </div>
        </template>
      </DateCard>

      <DateCard :class="{ 'today-card': isToday(2, weekOffset) }">
        <template #date>
          <div class="column">
            <span>Tue</span>
            <h2>{{ getDate(2, weekOffset) }}</h2>
          </div>
          <div class="column bottom">
            <h2>2</h2>
            <span>sessions</span>
          </div>
        </template>
      </DateCard>

      <DateCard :class="{ 'today-card': isToday(3, weekOffset) }">
        <template #date>
          <div class="column">
            <span>Wed</span>
            <h2>{{ getDate(3, weekOffset) }}</h2>
          </div>
          <div class="column bottom">
            <h2>2</h2>
            <span>sessions</span>
          </div>
        </template>
      </DateCard>

      <DateCard :class="{ 'today-card': isToday(4, weekOffset) }">
        <template #date>
          <div class="column">
            <span>Thu</span>
            <h2>{{ getDate(4, weekOffset) }}</h2>
          </div>
          <div class="column bottom">
            <h2>2</h2>
            <span>sessions</span>
          </div>
        </template>
      </DateCard>

      <DateCard :class="{ 'today-card': isToday(5, weekOffset) }">
        <template #date>
          <div class="column">
            <span>Fri</span>
            <h2>{{ getDate(5, weekOffset) }}</h2>
          </div>
          <div class="column bottom">
            <h2>2</h2>
            <span>sessions</span>
          </div>
        </template>
      </DateCard>

      <DateCard :class="{ 'today-card': isToday(6, weekOffset) }">
        <template #date>
          <div class="column">
            <span>Sat</span>
            <h2>{{ getDate(6, weekOffset) }}</h2>
          </div>
          <div class="column bottom">
            <h2>2</h2>
            <span>sessions</span>
          </div>
        </template>
      </DateCard>
    </div>

    <div class="grid">
      <div class="grid-card">
        <div class="tabs">
          <div v-if="isLoading" class="loading">Loading...</div>
          <div v-else-if="sessions?.length === 0" class="empty-state">
            <p>No sessions found.</p>
          </div>
          <button
            class="tab clicker"
            v-else
            v-for="session in sessions"
            :key="session._id"
            @click="selectSession(session)"
            :class="{
              active: selectedSession?._id === session._id,
            }"
          >
            <div class="tab-header">
              <div class="tab-title">{{ session.name }}</div>
              <div class="tab-subtitle">{{ session.location }}</div>
            </div>
            <div class="tab-description">{{ truncateText(session.description, 72) }}</div>
          </button>
        </div>
      </div>

      <div class="grid-card">
        <!-- New Session -->
        <div v-if="creatingNewSession" class="right-card-wrapper right-card-wrapper-tighter">
          <div class="right-card-header">
            <h3>New Session</h3>
          </div>
          <div class="form-container">
            <div class="form-group">
              <label>Session Name</label>
              <input v-model="formModel.name" placeholder="e.g. Finals Review Sesh" />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea
                v-model="formModel.description"
                placeholder="Details..."
                rows="4"
              ></textarea>
            </div>

            <div class="form-group-row">
              <div class="form-group">
                <label>Location</label>
                <input v-model="formModel.location" placeholder="e.g. FLC" />
              </div>
              <div class="form-group">
                <label>Session Date</label>
                <input type="datetime-local" v-model="formModel.date" />
              </div>
            </div>
          </div>
          <button class="clicker-inverted" @click="createSession()">Submit</button>
        </div>

        <!-- Session Details -->
        <div v-else-if="selectedSession" class="right-card-wrapper">
          <div class="right-card-header">
            <h3>{{ selectedSession.name }}</h3>
          </div>
          <p class="right-card-description">{{ selectedSession.description }}</p>

          <div>
            <div class="right-card-meta">
              <h4>Location:</h4>
              <span>{{ selectedSession.location }}</span>
            </div>
            <div class="right-card-meta">
              <h4>Session Date:</h4>
              <span>{{ formatISOString(selectedSession.date) }}</span>
            </div>
            <div class="right-card-meta">
              <h4>Date Created:</h4>
              <span>{{ formatISOString(selectedSession.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="right-card-wrapper grid-content-no-selection">
          Such empty. Select An Assignment
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pink {
  background-color: pink;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
}

.bottom {
  justify-content: end;
  border-top: 1px solid var(--color-text);
}

.right-card-wrapper-tighter {
  gap: var(--space-300);
}

.form-group textarea {
  height: 50px;
}

.today-card {
  border: 1px solid var(--c-primary);
}
</style>
