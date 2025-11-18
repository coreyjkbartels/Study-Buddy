<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '../components/Modal.vue'

const router = useRouter()
const API_BASE = "https://studdy-buddy-api-h7kw3.ondigitalocean.app"

const assignments = ref([])
const createModal = ref(null)
const isLoading = ref(false)
const errorMsg = ref("")

const formData = ref({
  title: "",
  subject: "",
  description: "",
  due_date: "",
  priority: "Medium",
  status: "Not Started"
});

function signOut() {
  localStorage.clear()
  router.push('/')
}

function resetForm() {
  formData.value = {
    title: "",
    subject: "",
    description: "",
    due_date: "",
    priority: "Medium",
    status: "Not Started"
  };
  errorMsg.value = "";
}

async function fetchAssignments() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push('/');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/assignments`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      assignments.value = data || [];
    } else {
      console.error("Failed to fetch assignments");
      assignments.value = [];
    }
  } catch (error) {
    console.error("Error fetching assignments:", error);
  }
}
async function handleSubmit() {
  if (!formData.value.title || !formData.value.subject || !formData.value.due_date) {
    errorMsg.value = "Please fill out all required fields (*).";
    return;
  }

  isLoading.value = true;
  errorMsg.value = "";
  const token = localStorage.getItem("token");

  const assignmentData = {
    title: formData.value.title,
    course: formData.value.subject,
    description: formData.value.description,
    dueDate: formData.value.due_date,
    priority: formData.value.priority,
  };

  try {
    const response = await fetch(`${API_BASE}/assignment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(assignmentData)
    });

    if (response.ok) {
      const newAssignment = await response.json();

      const assignmentForList = {
        ...newAssignment,
        subject: assignmentData.course,
        due_date: assignmentData.dueDate,
        priority: assignmentData.priority
      }

      assignments.value.push(assignmentForList);
      createModal.value.close();
      resetForm();
    } else {
      const errData = await response.json();
      errorMsg.value = errData.error.message || "Failed to create assignment.";
    }
  } catch (error) {
    console.error("Error creating assignment:", error);
    errorMsg.value = "An error occurred. Please try again.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchAssignments);
</script>

<template>
<<<<<<< Updated upstream
<Header></Header>
=======
>>>>>>> Stashed changes
  <div class="dashboard">
    <aside class="sidebar">
      <h2>Study Buddy</h2>
      <nav>
        <RouterLink to="/home" class="nav-item">Dashboard</RouterLink>
        <RouterLink to="/profile" class="nav-item">Profile</RouterLink>
        <RouterLink to="/friends" class="nav-item">Study Buddies</RouterLink>
        <RouterLink to="/messages" class="nav-item">Messages</RouterLink>
        <RouterLink to="/assignments" class="nav-item">Assignments</RouterLink>
      </nav>
      <button class="signout" @click="signOut">Sign Out</button>
    </aside>

    <main class="main-content">
      <header>
        <div class="header-content">
          <h1>Your Assignments</h1>
          <p>Keep track of all your upcoming work.</p>
        </div>
        <button class="add-btn" @click="createModal.open()">
          + Add Assignment
        </button>
      </header>

      <section class="assignment-list">
        <div v-if="assignments.length === 0" class="empty-state">
          <p>You have no assignments. Click "+ Add Assignment" to get started!</p>
        </div>
        <ul v-else>
          <li v-for="assignment in assignments" :key="assignment._id" class="assignment-item">
            <span :class="['priority-dot', `priority-${assignment.priority.toLowerCase()}`]"></span>
            <div class="assignment-details">
              <strong>{{ assignment.title }}</strong>
              <span>{{ assignment.subject || assignment.course }}</span>
            </div>
            <div class="assignment-due">
              <span>Due: {{ new Date(assignment.due_date || assignment.dueDate).toLocaleDateString() }}</span>
            </div>
          </li>
        </ul>
      </section>
    </main>

    <Modal ref="createModal">
      <template #header>
        <h1 class="modal-title">Add New Assignment</h1>
      </template>

      <template #main>
        <form class="modal-form" @submit.prevent="handleSubmit">
          <p v-if="errorMsg" class="modal-error">{{ errorMsg }}</p>

          <div class="form-group">
            <label for="title">Assignment Title *</label>
            <input
              id="title"
              type="text"
              v-model="formData.title"
              placeholder="e.g., Essay on Modern Literature"
              required
            />
          </div>

          <div class="form-group">
            <label for="subject">Subject/Course *</label>
            <input
              id="subject"
              type="text"
              v-model="formData.subject"
              placeholder="e.g., English Literature 101"
              required
            />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Assignment details, requirements, notes..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="due_date">Due Date *</label>
              <input
                id="due_date"
                type="date"
                v-model="formData.due_date"
                required
              />
            </div>

            <div class="form-group">
              <label for="priority">Priority</label>
              <select id="priority" v-model="formData.priority">
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
        </form>
      </template>

      <template #footer>
        <button class="modal-btn-cancel" @click.stop="createModal.close()">Cancel</button>
        <button class="modal-btn-submit" @click.stop="handleSubmit" :disabled="isLoading">
          {{ isLoading ? "Adding..." : "Add Assignment" }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
:root {
  --primary: #6366f1;
  --accent: #1976d2;
  --white:  #ffffff;
  --text: #0b1220;
  --radius: 12px;
  --gap: 1.25rem;
}

.dashboard {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--gap);
  background: #f9fafb;
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  padding: 1.25rem;
  box-sizing: border-box;
}

.sidebar {
  grid-column: 1 / 2;
  background: linear-gradient(180deg, #6366f1 0%, #1976d2 100%);
  color: var(--white);
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  box-shadow: 0 8px 30px rgba(25,118,210,0.10);
  height: calc(100vh - 2.5rem);
  position: sticky;
  top: 1.25rem;
}

.sidebar h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-align: left;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  color: var(--white);
  text-decoration: none;
  font-weight: 600;
  transition: background .18s ease, transform .12s ease;
  text-align: left;
}
.nav-item:hover { background: rgba(255,255,255,0.12); transform: translateX(4px); }
.router-link-exact-active {
  background: rgba(255,255,255,0.2);
}

.signout {
  margin-top: auto;
  background: var(--white);
  color: #6366f1;
  border: none;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.main-content {
  grid-column: 2 / 3;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.75rem 1rem;
  background: transparent;
}

header {
  background: var(--white);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 8px 24px rgba(99,102,241,0.06);
  border: 1px solid rgba(25,118,210,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  margin: 0 0 0.2rem 0;
  color: var(--primary);
  font-size: 1.4rem;
  font-weight: 800;
}
header p {
  margin: 0;
  color: #263044;
}

.add-btn {
  background: var(--primary);
  color: var(--white);
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.add-btn:hover {
  background-color: #4f46e5;
}

.assignment-list {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(99,102,241,0.06);
  border: 1px solid rgba(25,118,210,0.06);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.assignment-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assignment-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: box-shadow 0.2s ease;
}
.assignment-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.assignment-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.assignment-details strong {
  font-weight: 600;
  color: #1f2937;
}
.assignment-details span {
  font-size: 0.9rem;
  color: #4b5563;
}
.assignment-due {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--accent);
}

.priority-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.priority-low { background-color: #22c55e; }
.priority-medium { background-color: #f59e0b; }
.priority-high { background-color: #ef4444; }
.priority-urgent { background-color: #b91c1c; }

.modal-title {
  margin: 1rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #f0f0f0;
  font-size: 0.9rem;
}

.modal-form input,
.modal-form textarea,
.modal-form select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid grey;
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(70, 48, 48, 0.274);
  color: white;
  box-sizing: border-box;
}
.modal-form input::placeholder,
.modal-form textarea::placeholder {
  color: #b0b0b0;
}
.modal-form input:focus,
.modal-form textarea:focus,
.modal-form select:focus {
  outline: none;
  border-color: var(--primary);
  background-color: rgba(70, 48, 48, 0.4);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.modal-error {
  color: #fca5a5;
  background-color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.modal-btn-cancel,
.modal-btn-submit {
  width: 120px;
  height: 40px;
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  background: transparent;
  backdrop-filter: blur(5px);
  border: 2px solid grey;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn-cancel:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.modal-btn-submit {
  background: var(--primary);
  border-color: var(--primary);
}
.modal-btn-submit:hover {
  background: #4f46e5;
  border-color: #4f46e5;
}
.modal-btn-submit:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}
</style>
