<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Header from '@/components/Header.vue'

const searchTerm = ref('')
const searchResults = ref([])
const friends = ref([])
const requests = ref([])
const currentUser = ref(null)
const isSearching = ref(false)
const errorMessage = ref('')
const pollingInterval = ref(null)

const API_BASE = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app'

function authHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/user`, {
      method: 'GET',
      headers: authHeaders(),
    })

    if (!res.ok) {
      if (res.status === 400 || res.status === 401) {
        alert('Your session has expired. Please log in again.')
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        window.location.href = '/login'
      }
      return
    }

    const data = await res.json()
    currentUser.value = data.user
    localStorage.setItem('userId', data.user._id)
  } catch (err) {
    console.error('fetchCurrentUser error:', err)
    errorMessage.value = 'Failed to load user data'
  }
}

async function fetchFriends() {
  try {
    const res = await fetch(`${API_BASE}/friends`, {
      method: 'GET',
      headers: authHeaders(),
    })

    if (!res.ok) {
      console.error('Friends fetch failed:', res.status)
      return
    }

    const data = await res.json()
    const friendsList = data.friends || []

    if (friendsList.length > 0) {
      const friendsWithUsernames = await Promise.all(
        friendsList.map(async (f) => {
          try {
            const userRes = await fetch(`${API_BASE}/user/${f.friendId}`, {
              method: 'GET',
              headers: authHeaders(),
            })

            if (userRes.ok) {
              const userData = await userRes.json()
              return {
                friendId: f.friendId,
                username: userData.user.username,
                chatId: f.chatId,
              }
            }
          } catch (err) {
            console.error('Error fetching friend user:', err)
          }
          return { friendId: f.friendId, username: 'Unknown', chatId: f.chatId }
        }),
      )
      friends.value = friendsWithUsernames
    } else {
      friends.value = []
    }
  } catch (err) {
    console.error('fetchFriends error:', err)
    errorMessage.value = 'Failed to load friends'
  }
}

async function fetchRequests() {
  console.log('Fetching friend requests...', new Date().toLocaleTimeString())
  try {
    const res = await fetch(`${API_BASE}/friends/requests`, {
      method: 'GET',
      headers: authHeaders(),
    })

    if (!res.ok) {
      console.error('Requests fetch failed:', res.status)
      return
    }

    const data = await res.json()
    const userId = localStorage.getItem('userId')

    requests.value = data
      .filter((r) => !r.isAccepted && r.receiver?.[0]?._id === userId)
      .map((r) => ({
        id: r._id,
        username: r.sender?.[0]?.username || 'Unknown User',
        senderId: r.sender?.[0]?._id,
      }))

    console.log('Friend requests fetched:', requests.value.length, 'pending requests')
  } catch (err) {
    console.error('fetchRequests error:', err)
    errorMessage.value = 'Failed to load friend requests'
  }
}

function startPolling() {
  // Clear any existing interval
  stopPolling()

  console.log('Starting friend request polling (every 5 seconds)')

  // Poll for friend requests every 5 seconds
  pollingInterval.value = setInterval(() => {
    fetchRequests()
  }, 5000)
}

function stopPolling() {
  if (pollingInterval.value) {
    console.log('Stopping friend request polling')
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

async function searchUsers() {
  if (!searchTerm.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  errorMessage.value = ''

  try {
    const res = await fetch(`${API_BASE}/users?q=${encodeURIComponent(searchTerm.value)}`, {
      method: 'GET',
      headers: authHeaders(),
    })

    if (!res.ok) {
      errorMessage.value = 'Search failed. Please try again.'
      searchResults.value = []
      return
    }

    const users = await res.json()

    const friendIds = friends.value.map((f) => f.friendId)
    searchResults.value = users.filter(
      (u) => u._id !== currentUser.value?._id && !friendIds.includes(u._id),
    )
  } catch (err) {
    console.error('searchUsers error:', err)
    errorMessage.value = 'Search failed. Please try again.'
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

async function sendRequest(friendId) {
  try {
    const res = await fetch(`${API_BASE}/friends/requests/${friendId}`, {
      method: 'POST',
      headers: authHeaders(),
    })

    if (!res.ok) {
      const errorData = await res.json()
      errorMessage.value = errorData.Error || 'Failed to send friend request'
      return
    }

    searchResults.value = searchResults.value.filter((u) => u._id !== friendId)
    searchTerm.value = ''
    errorMessage.value = ''

    alert('Friend request sent!')
  } catch (err) {
    console.error('sendRequest error:', err)
    errorMessage.value = 'Failed to send friend request'
  }
}

async function acceptRequest(id) {
  try {
    const res = await fetch(`${API_BASE}/friends/requests/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ isAccepted: true }),
    })

    if (!res.ok) {
      errorMessage.value = 'Failed to accept request'
      return
    }

    errorMessage.value = ''
    await Promise.all([fetchFriends(), fetchRequests()])
    alert('Friend request accepted!')
  } catch (err) {
    console.error('acceptRequest error:', err)
    errorMessage.value = 'Failed to accept request'
  }
}

async function declineRequest(id) {
  try {
    const res = await fetch(`${API_BASE}/friends/requests/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })

    if (!res.ok) {
      errorMessage.value = 'Failed to decline request'
      return
    }

    errorMessage.value = ''
    await fetchRequests()
  } catch (err) {
    console.error('declineRequest error:', err)
    errorMessage.value = 'Failed to decline request'
  }
}

onMounted(() => {
  fetchCurrentUser()
  fetchFriends()
  fetchRequests()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <!-- <Header /> -->
  <div class="friends-page">
    <h1>Study Buddies</h1>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <section class="add-friend">
      <input
        v-model="searchTerm"
        @keyup.enter="searchUsers"
        placeholder="Enter username..."
        :disabled="isSearching"
      />
      <button @click="searchUsers" :disabled="isSearching">
        {{ isSearching ? 'Searching...' : 'Search' }}
      </button>
    </section>

    <section v-if="searchResults.length > 0" class="search-results">
      <h2>Search Results</h2>
      <ul>
        <li v-for="u in searchResults" :key="u._id">
          {{ u.username }}
          <button @click="sendRequest(u._id)">Add</button>
        </li>
      </ul>
    </section>

    <!-- <section v-else-if="searchTerm && !isSearching && searchResults.length === 0" class="no-results">
      <p>No users found matching "{{ searchTerm }}"</p>
    </section> -->

    <section class="requests" v-if="requests.length > 0">
      <h2>Friend Requests ({{ requests.length }})</h2>
      <ul>
        <li v-for="r in requests" :key="r.id">
          {{ r.username }}
          <div class="button-group">
            <button @click="acceptRequest(r.id)" class="accept-btn">Accept</button>
            <button @click="declineRequest(r.id)" class="decline-btn">Decline</button>
          </div>
        </li>
      </ul>
    </section>

    <section class="friends-list">
      <h2>Your Friends ({{ friends.length }})</h2>
      <ul v-if="friends.length > 0">
        <li v-for="f in friends" :key="f.friendId">
          {{ f.username }}
        </li>
      </ul>
      <p v-else class="empty-state">No friends yet. Search for users to add them!</p>
    </section>
  </div>
</template>

<style scoped>
:root {
  --primary: #6366f1;
  --accent: #1976d2;
  --white: #ffffff;
  --error: #ef4444;
  --success: #10b981;
  --radius: 10px;
  --gap: 1rem;
}

* {
  box-sizing: border-box;
}

.friends-page {
  max-width: 90%;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--white);
  border-radius: var(--radius);
  border-top: 6px solid var(--primary);
  color: var(--primary);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial;
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

.error-message {
  background: #fee;
  color: var(--error);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid var(--error);
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
  color: var(--white);
  font-size: 1rem;
}

.add-friend input::placeholder {
  color: var(--white);
  opacity: 0.8;
}

.add-friend input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-friend button {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: var(--white);
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  min-width: 100px;
}

.add-friend button:hover:not(:disabled) {
  opacity: 0.9;
}

.add-friend button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-results,
.friends-list,
.requests {
  margin-bottom: 1.5rem;
}

.search-results ul,
.friends-list ul,
.requests ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-results ul li,
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

.button-group {
  display: flex;
  gap: 0.5rem;
}

.search-results ul li button,
.friends-list ul li button {
  background: var(--white);
  color: var(--accent);
  border: none;
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.requests ul li button {
  background: var(--white);
  border: none;
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.accept-btn {
  color: var(--success);
}

.decline-btn {
  color: var(--error);
}

.search-results ul li button:hover,
.friends-list ul li button:hover {
  background: var(--primary);
  color: var(--white);
}

.requests ul li button:hover {
  opacity: 0.8;
}

.no-results,
.empty-state {
  text-align: center;
  color: #666;
  padding: 1rem;
  font-style: italic;
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

  .button-group {
    flex-direction: column;
    width: 100px;
  }
}
</style>
