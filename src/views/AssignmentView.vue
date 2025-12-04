<script setup>
import { fetchResponse } from '@/assets/fetch'
import InfoCard from '@/components/InfoCard.vue'
import { ref, onMounted, onUnmounted } from 'vue'

const assignments = ref([])
const selectedAssignment = ref(null)
const currentUser = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const pollingInterval = ref(null)

const changingStatus = ref(false)
const creatingNewAssignment = ref(false)
const editingAssignment = ref(false)
const assignmentCounts = ref(null)

const formModel = ref({
  title: '',
  course: '',
  description: '',
  dueDate: '',
  isComplete: false,
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

// 2. GETS/assignment
async function fetchAssignments(isInitialLoad = false) {
  if (isInitialLoad) isLoading.value = true

  try {
    const response = await fetchResponse('/assignments', 'GET')

    if (!response.ok) {
      errorMessage.value = 'Failed to load assignments'
      return
    }

    const data = await response.json()
    assignments.value = data
  } catch (err) {
    console.error('fetchAssignments error:', err)
    errorMessage.value = 'Failed to load assignments'
  } finally {
    if (isInitialLoad) isLoading.value = false
  }
}

async function createAssignment() {
  if (!formModel.value.title || !formModel.value.course) {
    errorMessage.value = 'Title and Course are required.'
    return
  }
  const data = { ...formModel.value }

  if (!data.dueDate) {
    delete data.dueDate
  }

  data.dateAssigned = new Date()

  try {
    const response = await fetchResponse('/assignment', 'POST', data)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Server Error Details:', errorData)

      errorMessage.value = 'Failed to create assignment. Check console for details.'
      return
    }

    await fetchAssignments()
    resetForm()
    await fetchAssignmentCounts()
    errorMessage.value = ''
  } catch (err) {
    console.log('createAssignment error:', err)
    errorMessage.value = 'Error creating assignment'
  }
}

// 4. PATCH /assignment/:assignmentId
async function editAssignment() {
  const updates = {
    title: formModel.value.title,
    course: formModel.value.course,
    description: formModel.value.description,
    isComplete: formModel.value.isComplete,
  }

  if (formModel.value.dueDate) {
    updates.dueDate = formModel.value.dueDate
  }

  try {
    const response = await fetchResponse(
      `/assignment/${selectedAssignment.value._id}`,
      'PATCH',
      updates,
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Update failed:', errorData)
      errorMessage.value = 'Failed to update assignment'
      return
    }

    await fetchAssignments()
    errorMessage.value = ''
    resetForm()
    editingAssignment.value = false
    alert('Assignment updated successfully!')
  } catch (err) {
    console.error('updateAssignment error:', err)
    errorMessage.value = 'Error updating assignment'
  }
}

async function changeStatus(newStatus) {
  try {
    changingStatus.value = false

    const data = {
      oldStatus: selectedAssignment.value.status,
      newStatus: newStatus,
    }

    const response = await fetchResponse(
      `/assignment/${selectedAssignment.value._id}/status`,
      'PATCH',
      data,
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.log(errorData)
      errorMessage.value = 'Failed to update assignment'
      return
    }

    await fetchAssignments()
    errorMessage.value = ''
    resetForm()
    fetchAssignmentCounts()
    editingAssignment.value = false
  } catch (error) {
    console.log(error)
  }
}

async function fetchAssignmentCounts() {
  try {
    const response = await fetchResponse('/user/assignment-counts', 'GET')

    if (response.ok) {
      const data = await response.json()
      assignmentCounts.value = data
      console.log(data)
    }
  } catch (error) {
    console.log(error)
  }
}

function selectAssignment(assignment) {
  stopPolling()

  creatingNewAssignment.value = false
  editingAssignment.value = false
  selectedAssignment.value = assignment
  changingStatus.value = false

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
  selectedAssignment.value = null
  formModel.value = {
    title: '',
    course: '',
    description: '',
    dueDate: '',
    isComplete: false,
  }
}

function startPolling() {
  stopPolling()
  pollingInterval.value = setInterval(() => {
    fetchAssignments(false)
  }, 5000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

function toggleAssignmentCreation() {
  resetForm()
  selectedAssignment.value = null
  creatingNewAssignment.value = true
  editingAssignment.value = false
  changingStatus.value = false
}

function toggleAssignmentEditing() {
  formModel.value = selectedAssignment.value
  creatingNewAssignment.value = false
  editingAssignment.value = true
  changingStatus.value = false
}

onMounted(async () => {
  await fetchCurrentUser()
  await fetchAssignments(true)
  await fetchAssignmentCounts()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="main-column">
    <div class="main-column-heading">
      <h1>Assignments</h1>
      <button class="clicker clicker-inverted" v-on:click="toggleAssignmentCreation()">
        Create Assignment
      </button>
    </div>

    <div class="info-card-row">
      <InfoCard>
        <template #card-icon>
          <span class="material-symbols-outlined" :style="{ color: 'var(--c-primary)' }">
            import_contacts
          </span>
        </template>
        <template #card-info>
          <h4>{{ assignmentCounts?.totalNum || 0 }}</h4>
        </template>
        <template #card-label>
          <h4>Total</h4>
        </template>
      </InfoCard>
      <InfoCard>
        <template #card-icon>
          <span class="material-symbols-outlined" :style="{ color: '#eca540' }"> warning </span>
        </template>
        <template #card-info>
          <h4>{{ assignmentCounts?.numNotStarted || 0 }}</h4>
        </template>
        <template #card-label>
          <h4>Not Started</h4>
        </template>
      </InfoCard>
      <InfoCard>
        <template #card-icon>
          <span class="material-symbols-outlined" :style="{ color: 'var(--c-accent)' }">
            schedule
          </span>
        </template>
        <template #card-info>
          <h4>{{ assignmentCounts?.numInProgress || 0 }}</h4>
        </template>
        <template #card-label>
          <h4>In Progress</h4>
        </template>
      </InfoCard>
      <InfoCard>
        <template #card-icon>
          <span class="material-symbols-outlined" :style="{ color: '#56c56f' }">
            check_circle
          </span>
        </template>
        <template #card-info>
          <h4>{{ assignmentCounts?.numCompleted || 0 }}</h4>
        </template>
        <template #card-label>
          <h4>Completed</h4>
        </template>
      </InfoCard>
    </div>

    <div class="grid">
      <div class="grid-card">
        <div class="tabs">
          <div v-if="isLoading" class="loading">Loading...</div>
          <div v-else-if="assignments.length === 0" class="empty-state">
            <p>No assignments found.</p>
          </div>
          <button
            class="tab clicker"
            v-else
            v-for="assignment in assignments"
            :key="assignment._id"
            @click="selectAssignment(assignment)"
            :class="{
              active: selectedAssignment?._id === assignment._id,
              complete: assignment.isComplete,
            }"
          >
            <div class="tab-header">
              <div class="tab-title">{{ assignment.title }}</div>
              <div class="tab-subtitle">{{ assignment.course }}</div>
            </div>
            <div class="tab-description">{{ truncateText(assignment.description, 72) }}</div>
          </button>
        </div>
      </div>

      <div class="grid-card">
        <!-- New Assignment -->
        <div v-if="creatingNewAssignment" class="right-card-wrapper">
          <div class="right-card-header">
            <h3>New Assignment</h3>
          </div>
          <div class="form-container">
            <div class="form-group">
              <label>Assignment Title</label>
              <input v-model="formModel.title" placeholder="e.g. Final Project" />
            </div>

            <div class="form-group">
              <label>Course Name</label>
              <input v-model="formModel.course" placeholder="e.g. CSCI 101" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea
                v-model="formModel.description"
                placeholder="Details..."
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Due Date</label>
              <input type="date" v-model="formModel.dueDate" />
            </div>
          </div>
          <button class="clicker-inverted" @click="createAssignment()">Submit</button>
        </div>

        <div v-else-if="editingAssignment" class="right-card-wrapper">
          <div class="right-card-header">
            <h3>Edit Assignment</h3>
          </div>
          <div class="form-container">
            <div class="form-group">
              <label>Assignment Title</label>
              <input v-model="formModel.title" placeholder="e.g. Final Project" />
            </div>

            <div class="form-group">
              <label>Course Name</label>
              <input v-model="formModel.course" placeholder="e.g. CSCI 101" />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea
                v-model="formModel.description"
                placeholder="Details..."
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Due Date</label>
              <input type="date" v-model="formModel.dueDate" />
            </div>
          </div>
          <button class="clicker-inverted" @click="editAssignment()">Submit</button>
        </div>

        <!-- Assignment Details -->
        <div v-else-if="selectedAssignment" class="right-card-wrapper">
          <div class="right-card-header">
            <div class="title-with-icon">
              <h3>{{ selectedAssignment.title }}</h3>
              <button
                class="material-symbols-outlined"
                id="edit-button"
                @click="toggleAssignmentEditing()"
              >
                edit
              </button>
            </div>

            <div v-if="changingStatus" class="status-buttons-row">
              <button
                class="material-symbols-outlined clicker-inverted status-button"
                :style="{ background: '#eca540' }"
                @click="changeStatus('Not Started')"
              >
                warning
              </button>
              <button
                class="material-symbols-outlined clicker-inverted status-button"
                :style="{ background: 'var(--c-accent)' }"
                @click="changeStatus('In Progress')"
              >
                schedule
              </button>
              <button
                class="material-symbols-outlined clicker-inverted status-button"
                :style="{ background: '#56c56f' }"
                @click="changeStatus('Complete')"
              >
                check_circle
              </button>
            </div>

            <div v-else class="status-button">
              <button
                v-if="selectedAssignment.status === 'Not Started'"
                class="material-symbols-outlined clicker-inverted status-button"
                @click="changingStatus = true"
                :style="{ background: '#eca540' }"
              >
                warning
              </button>
              <button
                v-else-if="selectedAssignment.status === 'In Progress'"
                class="material-symbols-outlined clicker-inverted status-button"
                :style="{ background: 'var(--c-accent)' }"
                @click="changingStatus = true"
                id="complete-button"
              >
                schedule
              </button>
              <button
                v-else
                class="material-symbols-outlined clicker-inverted status-button"
                :style="{ background: '#56c56f' }"
                @click="changingStatus = true"
                id="complete-button"
              >
                check_circle
              </button>
            </div>
          </div>
          <p class="right-card-description">{{ selectedAssignment.description }}</p>

          <div>
            <div class="right-card-meta">
              <h4>Course:</h4>
              <span>{{ selectedAssignment.course }}</span>
            </div>
            <div class="right-card-meta">
              <h4>Status:</h4>
              <span>{{ selectedAssignment.status }}</span>
            </div>
            <div class="right-card-meta">
              <h4>Date Assigned:</h4>
              <span>{{ formatISOString(selectedAssignment.dateAssigned) }}</span>
            </div>
            <div class="right-card-meta">
              <h4>Date Due:</h4>
              <span>{{ formatISOString(selectedAssignment.dueDate) }}</span>
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
.title-with-icon {
  display: flex;
  align-items: center;
  gap: 2px;
}

#edit-button {
  padding: 0px;
  background-color: transparent;
  font-size: var(--fs-body-medium);

  position: relative;
  translate: 0px 7px;
}

.status-button {
  display: flex;
  align-self: baseline;
}

.status-buttons-row {
  display: flex;
  gap: var(--space-075);

  align-self: baseline;
}

.status-button {
  border: 8px;
  font-size: var(--fs-heading-small);
}
</style>
