<script setup>
import { ref, onMounted } from "vue";

const friends = ref([]);
const requests = ref([]);
const username = ref("");

function fetchFriends() {
  friends.value = [
    { id: 1, username: "alice" },
    { id: 2, username: "bob" }
  ];
}

function fetchRequests() {
  requests.value = [
    { id: 1, from: "charlie" },
    { id: 2, from: "diana" }
  ];
}

function sendRequest() {
  if (username.value.trim()) {
    requests.value.push({ id: Date.now(), from: username.value });
    username.value = "";
  }
}

function acceptRequest(id) {
  const r = requests.value.find((req) => req.id === id);
  if (r) {
    friends.value.push({ id: Date.now(), username: r.from });
    requests.value = requests.value.filter((req) => req.id !== id);
  }
}

onMounted(() => {
  fetchFriends();
  fetchRequests();
});
</script>

<template>
  <div class="friends-page">
    <h1>Study Buddies</h1>

    <section class="add-friend">
      <input v-model="username" placeholder="Enter username..." />
      <button @click="sendRequest">Add Buddy</button>
    </section>

    <section class="friends-list">
      <h2>Your Friends ({{ friends.length }})</h2>
      <ul>
        <li v-for="f in friends" :key="f.id">{{ f.username }}</li>
      </ul>
    </section>

    <section class="requests">
      <h2>Friend Requests</h2>
      <ul>
        <li v-for="r in requests" :key="r.id">
          {{ r.from }}
          <button @click="acceptRequest(r.id)">Accept</button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
:root{
  --primary: #6366f1;
  --accent: #1976d2;
  --white: #ffffff;
  --radius: 10px;
  --gap: 1rem;
}

* { box-sizing: border-box; }

.friends-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--white);
  border-radius: var(--radius);
  border-top: 6px solid var(--primary);
  color: var(--primary);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

h1 {
  text-align: center;
  color: var(--primary);
  margin: 0 0 1.5rem 0;
  font-weight: 700;
}

h2 {
  margin: 0 0 0.75rem 0;
  color: var(--accent);
  padding-bottom: 0.25rem;
  border-bottom: 2px solid var(--primary);
  font-weight: 700;
}

.add-friend {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.add-friend input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 2px solid var(--accent);
  background: #6366f1;
  color: var(--primary);
  font-size: 1rem;
}

.add-friend input::placeholder {
  color: var(--accent);
}

.add-friend button {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: var(--white);
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.add-friend button:hover {
  opacity: 0.9;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.friends-list ul li,
.requests ul li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--accent), var(--primary));
  color: var(--white);
  font-weight: 600;
  background-color: #1976d2;
}

.requests ul li button,
.friends-list ul li button {
  background: var(--white);
  color: var(--accent);
  border: none;
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.requests ul li button:hover,
.friends-list ul li button:hover {
  background: var(--primary);
  color: var(--white);
}

@media (max-width: 720px) {
  .friends-page {
    margin: 1rem;
    padding: 1rem;
  }
  .add-friend {
    flex-direction: column;
  }
  .add-friend button {
    width: 100%;
  }
}
</style>
