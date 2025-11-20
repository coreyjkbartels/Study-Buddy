<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import Header from "@/components/Header.vue";

const assignments = ref([]);
const selectedAssignment = ref(null);
const currentUser = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");
const pollingInterval = ref(null);

const formModel = ref({
  title: "",
  course: "",
  description: "",
  dueDate: "",
  isComplete: false
});

const API_BASE = "https://studdy-buddy-api-h7kw3.ondigitalocean.app";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// 1. GETS/users
async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/user`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      if (res.status === 400 || res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/signin";
      }
      return;
    }
    const data = await res.json();
    currentUser.value = data.user;
  } catch (err) {
    console.error("fetchCurrentUser error:", err);
  }
}

// 2. GETS/assignment
async function fetchAssignments(isInitialLoad = false) {
  if (isInitialLoad) isLoading.value = true;

  try {
    const res = await fetch(`${API_BASE}/assignments`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      errorMessage.value = "Failed to load assignments";
      return;
    }

    const data = await res.json();
    assignments.value = data;

  } catch (err) {
    console.error("fetchAssignments error:", err);
    errorMessage.value = "Failed to load assignments";
  } finally {
    if (isInitialLoad) isLoading.value = false;
  }
}

// 3. POST /assignment
async function createAssignment() {
  if (!formModel.value.title || !formModel.value.course) {
    errorMessage.value = "Title and Course are required.";
    return;
  }
  const payload = { ...formModel.value };

  if (!payload.dueDate) {
    delete payload.dueDate;
  }

  payload.dateAssigned = new Date();

  try {
    const res = await fetch(`${API_BASE}/assignment`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server Error Details:", errorData);

      errorMessage.value = "Failed to create assignment. Check console for details.";
      return;
    }

    await fetchAssignments();
    resetForm();
    errorMessage.value = "";
  } catch (err) {
    console.error("createAssignment error:", err);
    errorMessage.value = "Error creating assignment";
  }
}

// 4. PATCH /assignment/:assignmentId
async function updateAssignment() {
  if (!selectedAssignment.value) return;

  const updates = {
    title: formModel.value.title,
    course: formModel.value.course,
    description: formModel.value.description,
    dueDate: formModel.value.dueDate,
    isComplete: formModel.value.isComplete,
  };

  try {
    const res = await fetch(`${API_BASE}/assignment/${selectedAssignment.value._id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      errorMessage.value = "Failed to update assignment";
      return;
    }

    await fetchAssignments();
    errorMessage.value = "";
    alert("Assignment updated successfully!");
  } catch (err) {
    console.error("updateAssignment error:", err);
    errorMessage.value = "Error updating assignment";
  }
}

// 5. DELETE /assignment/:assignmentId
async function deleteAssignment(id) {
  if (!confirm("Are you sure you want to delete this assignment?")) return;

  try {
    const res = await fetch(`${API_BASE}/assignment/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      errorMessage.value = "Failed to delete assignment";
      return;
    }

    if (selectedAssignment.value && selectedAssignment.value._id === id) {
      resetForm();
    }

    await fetchAssignments();
  } catch (err) {
    console.error("deleteAssignment error:", err);
    errorMessage.value = "Error deleting assignment";
  }
}


function selectAssignment(assignment) {
  stopPolling();

  selectedAssignment.value = assignment;
  formModel.value = {
    title: assignment.title || "",
    course: assignment.course || "",
    description: assignment.description || "",
    dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : "",
    isComplete: assignment.isComplete || false
  };
  errorMessage.value = "";
}

function switchToCreateMode() {
  resetForm();
  startPolling();
}

function resetForm() {
  selectedAssignment.value = null;
  formModel.value = {
    title: "",
    course: "",
    description: "",
    dueDate: "",
    isComplete: false
  };
}

function startPolling() {
  stopPolling();
  pollingInterval.value = setInterval(() => {
    fetchAssignments(false);
  }, 5000);
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
}

onMounted(() => {
  fetchCurrentUser();
  fetchAssignments(true);
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <Header />
  <div class="page-layout">
    <div class="main-container">

      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>My Assignments</h2>
          <button @click="switchToCreateMode" class="new-btn">+ New</button>
        </div>

        <div v-if="isLoading" class="loading">Loading...</div>

        <div v-else-if="assignments.length === 0" class="empty-state">
          <p>No assignments found.</p>
        </div>

        <ul v-else class="item-list">
          <li v-for="asn in assignments" :key="asn._id" @click="selectAssignment(asn)" :class="{
            active: selectedAssignment?._id === asn._id,
            complete: asn.isComplete
          }">
            <div class="item-title">{{ asn.title }}</div>
            <div class="item-subtitle">{{ asn.course }}</div>
          </li>
        </ul>
      </aside>

      <main class="content-area">
        <div class="content-header">
          <h3>
            {{ selectedAssignment ? 'Edit Assignment' : 'Create New Assignment' }}
          </h3>
          <button v-if="selectedAssignment" @click="deleteAssignment(selectedAssignment._id)" class="delete-btn">
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
            <textarea v-model="formModel.description" placeholder="Details..." rows="4" class="std-input"></textarea>
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

          <div class="form-actions">
            <button v-if="selectedAssignment" @click="updateAssignment" class="action-btn">
              Save Changes
            </button>
            <button v-else @click="createAssignment" class="action-btn">
              Create Assignment
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary: #6366f1;
  --accent: #1976d2;
  --white: #ffffff;
  --error: #ef4444;
  --bg-gray: #f9fafb;
  --border-gray: #e5e7eb;
  --text-gray: #6b7280;
  --radius: 10px;
}

* {
  box-sizing: border-box;
}

.page-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.main-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1rem;
  height: calc(100vh - 150px);
  background: var(--white);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.sidebar {
  background: linear-gradient(135deg, var(--accent), var(--primary));
  color: var(--white);
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 0.5rem;
}

.sidebar h2 {
  margin: 0;
  font-weight: 700;
  font-size: 1.2rem;
}

.new-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-weight: bold;
}

.new-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item-list li {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
}

.item-list li:hover {
  background: rgba(255, 255, 255, 0.2);
}

.item-list li.active {
  background: var(--white);
  color: var(--primary);
}

.item-list li.complete {
  text-decoration: line-through;
  opacity: 0.8;
}

.item-title {
  font-weight: 700;
}

.item-subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
}

.content-area {
  background: var(--white);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.content-header {
  padding: 1rem 1.5rem;
  border-bottom: 2px solid var(--border-gray);
  background: #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-header h3 {
  margin: 0;
  color: #333;
}

.delete-btn {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #f87171;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #fecaca;
}

.form-container {
  padding: 2rem;
  max-width: 800px;
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
