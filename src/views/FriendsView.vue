<script setup>
import { ref, onMounted } from "vue";
import Header from "@/components/Header.vue";

const username = ref("");
const friends = ref([]);
const requests = ref([]);
const API_BASE = "https://studdy-buddy-api-h7kw3.ondigitalocean.app";

async function fetchFriends() {
  try {
    const res = await fetch(`${API_BASE}/friends`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch friends");
    const data = await res.json();
    friends.value = data.friends || [];
  } catch (err) {
    console.error(err);
  }
}

async function fetchRequests() {
  try {
    const res = await fetch(`${API_BASE}/friends/requests`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch requests");
    const data = await res.json();
    const userId = localStorage.getItem("userId");
    requests.value = (data.friendRequests || [])
      .filter((r) => !r.isAccepted && r.receiver[0]?._id === userId)
      .map((r) => ({
        id: r._id,
        from: r.sender[0]?.userName || "Unknown User",
      }));
  } catch (err) {
    console.error(err);
  }
}

async function sendRequest() {
  if (!username.value.trim()) return;
  try {
    const search = await fetch(`${API_BASE}/users?userName=${username.value}`, {
      credentials: "include",
    });
    if (!search.ok) {
      alert("User not found");
      return;
    }
    const searchData = await search.json();
    const friendUser = searchData.user || searchData.users?.[0];
    if (!friendUser) {
      alert("User not found");
      return;
    }

    const res = await fetch(`${API_BASE}/friends/requests`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId: friendUser._id }),
    });
    if (!res.ok) throw new Error("Request failed");
    alert(`Friend request sent to ${friendUser.userName}`);
    username.value = "";
    fetchRequests();
  } catch (err) {
    console.error(err);
    alert("Failed to send friend request.");
  }
}

async function acceptRequest(id) {
  try {
    const res = await fetch(`${API_BASE}/friends/requests/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAccepted: true }),
    });
    if (!res.ok) throw new Error("Failed to accept request");
    await fetchFriends();
    await fetchRequests();
  } catch (err) {
    console.error(err);
    alert("Failed to accept friend request.");
  }
}

onMounted(() => {
  fetchFriends();
  fetchRequests();
});
</script>



<template>
  <Header />
  <div class="friends-page">
    <h1>Study Buddies</h1>

    <section class="add-friend">
      <input v-model="username" placeholder="Enter username..." />
      <button @click="sendRequest">Add Buddy</button>
    </section>

    <section class="friends-list">
      <h2>Your Friends ({{ friends.length }})</h2>
      <ul>
        <li v-for="f in friends" :key="f._id || f.id">
          {{ f.userName || f.username }}
        </li>
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
:root {
  --primary: #6366f1;
  --accent: #1976d2;
  --white: #ffffff;
  --radius: 10px;
  --gap: 1rem;
}

* {
  box-sizing: border-box;
}

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
