<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const assignments = ref([])
const selectedAssignment = ref(null)
const currentUser = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const pollingInterval = ref(null)

const formModel = ref({
  title: '',
  course: '',
  description: '',
  dueDate: '',
  isComplete: false,
})

const API_BASE = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app'

function authHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// 1. GETS/users
async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/user`, {
      method: 'GET',
      headers: authHeaders(),
    })

    if (!res.ok) {
      if (res.status === 400 || res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        window.location.href = '/signin'
      }
      return
    }
    const data = await res.json()
    currentUser.value = data.user
  } catch (err) {
    console.error('fetchCurrentUser error:', err)
  }
}

// 2. GETS/assignment
async function fetchAssignments(isInitialLoad = false) {
  if (isInitialLoad) isLoading.value = true

  try {
    const res = await fetch(`${API_BASE}/assignments`, {
      method: 'GET',
      headers: authHeaders(),
    })

    if (!res.ok) {
      errorMessage.value = 'Failed to load assignments'
      return
    }

    const data = await res.json()
    assignments.value = data
  } catch (err) {
    console.error('fetchAssignments error:', err)
    errorMessage.value = 'Failed to load assignments'
  } finally {
    if (isInitialLoad) isLoading.value = false
  }
}

// 3. POST /assignment
async function createAssignment() {
  if (!formModel.value.title || !formModel.value.course) {
    errorMessage.value = 'Title and Course are required.'
    return
  }
  const payload = { ...formModel.value }

  if (!payload.dueDate) {
    delete payload.dueDate
  }

  payload.dateAssigned = new Date()

  try {
    const res = await fetch(`${API_BASE}/assignment`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Server Error Details:', errorData)

      errorMessage.value = 'Failed to create assignment. Check console for details.'
      return
    }

    await fetchAssignments()
    resetForm()
    errorMessage.value = ''
  } catch (err) {
    console.error('createAssignment error:', err)
    errorMessage.value = 'Error creating assignment'
  }
}

// 4. PATCH /assignment/:assignmentId
async function updateAssignment() {
  if (!selectedAssignment.value) return

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
    const res = await fetch(`${API_BASE}/assignment/${selectedAssignment.value._id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Update failed:', errorData)
      errorMessage.value = 'Failed to update assignment'
      return
    }

    await fetchAssignments()
    errorMessage.value = ''
    alert('Assignment updated successfully!')
  } catch (err) {
    console.error('updateAssignment error:', err)
    errorMessage.value = 'Error updating assignment'
  }
}

// 5. DELETE /assignment/:assignmentId
async function deleteAssignment(id) {
  if (!confirm('Are you sure you want to delete this assignment?')) return

  try {
    const res = await fetch(`${API_BASE}/assignment/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })

    if (!res.ok) {
      errorMessage.value = 'Failed to delete assignment'
      return
    }

    if (selectedAssignment.value && selectedAssignment.value._id === id) {
      resetForm()
    }

    await fetchAssignments()
  } catch (err) {
    console.error('deleteAssignment error:', err)
    errorMessage.value = 'Error deleting assignment'
  }
}

function selectAssignment(assignment) {
  stopPolling()

  selectedAssignment.value = assignment
  formModel.value = {
    title: assignment.title || '',
    course: assignment.course || '',
    description: assignment.description || '',
    dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : '',
    isComplete: assignment.isComplete || false,
  }
  errorMessage.value = ''
}

function switchToCreateMode() {
  resetForm()
  startPolling()
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

onMounted(() => {
  fetchCurrentUser()
  fetchAssignments(true)
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="page-layout">
    <div class="main-container">
      <div class="sidebar-wrapper">
        <aside class="sidebar">
          <div class="sidebar-header">
            <h1>Assignments</h1>
          </div>
          <div class="sidebar-content">
            <div v-if="isLoading" class="loading">Loading...</div>
            <div v-else-if="assignments.length === 0" class="empty-state">
              <p>No assignments found.</p>
            </div>
            <button
              class="group"
              v-else
              v-for="asn in assignments"
              :key="asn._id"
              @click="selectAssignment(asn)"
              :class="{
                active: selectedAssignment?._id === asn._id,
                complete: asn.isComplete,
              }"
            >
              <div class="item-title">{{ asn.title }}</div>
              <div class="item-subtitle">{{ asn.course }}</div>
            </button>
          </div>

          <div class="sidebar-footer">
            <button @click="switchToCreateMode" class="clicker-inverted">Create Assignment</button>
          </div>
        </aside>
      </div>

      <main class="content-area">
        <div class="content-header">
          <h4>
            {{ selectedAssignment ? 'Edit Assignment' : 'Create New Assignment' }}
          </h4>
          <button
            v-if="selectedAssignment"
            @click="deleteAssignment(selectedAssignment._id)"
            class="clicker-inverted red-btn"
          >
            Delete
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-container">
          <div class="form-group">
            <label>Course Name</label>
            <input v-model="formModel.course" placeholder="e.g. CSCI 101" class="std-input" />
          </div>

          <div class="form-group">
            <label>Assignment Title</label>
            <input v-model="formModel.title" placeholder="e.g. Final Project" class="std-input" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="formModel.description"
              placeholder="Details..."
              rows="4"
              class="std-input"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Due Date</label>
              <input type="date" v-model="formModel.dueDate" class="std-input" />
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="formModel.isComplete" />
                Mark as Complete
              </label>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button v-if="selectedAssignment" @click="updateAssignment" class="clicker-inverted">
            Save Changes
          </button>
          <button v-else @click="createAssignment" class="clicker-inverted">
            Create Assignment
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-layout {
  height: 100%;
}

.main-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: 100%;

  overflow: hidden;

  border-radius: 12px;
  border: 1px solid var(--c-primary);
}

.sidebar-wrapper {
  padding-block: var(--space-300);
  height: 100%;
  display: flex;
}

.sidebar {
  padding-inline: var(--space-400);
  border-right: 0.25px solid var(--c-primary);
  overflow-y: auto;

  width: 100%;

  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;

  border-bottom: 2px solid var(--color-background-mute);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  list-style: none;

  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.sidebar-footer {
  padding-top: 1rem;
  border-top: 2px solid var(--color-background-mute);
  display: flex;
  gap: var(--space-075);
  align-items: center;
}

.sidebar-footer button {
  flex: 1;
}

.group {
  text-align: left;
}
.item-title {
  font-weight: 700;
}

.item-subtitle {
  font-size: var(--fs-label-small);
}

.content-area {
  padding-block: var(--space-300);
  padding-inline: var(--space-400);
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.content-header {
  width: 100%;
  margin-block-start: 9.6px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.form-container {
  flex: 1;
  /* padding: 2rem;
  max-width: 800px; */
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4b5563;
}

.std-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.std-input:focus {
  border-color: var(--primary);
}

.checkbox-group {
  display: flex;
  align-items: center;
  padding-top: 2rem;
}

.checkbox-group input {
  margin-right: 0.5rem;
  width: 1.2rem;
  height: 1.2rem;
}

.action-btn {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: var(--white);
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  width: 100%;
  font-size: 1.1rem;
}

.action-btn:hover {
  opacity: 0.9;
}

.error-message {
  background: #fee;
  color: var(--error);
  padding: 0.75rem;
  margin: 1rem;
  border-radius: 8px;
  border: 1px solid var(--error);
}

.loading,
.empty-state {
  text-align: center;
  padding: 2rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .main-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .sidebar {
    max-height: 300px;
  }
}
</style>
