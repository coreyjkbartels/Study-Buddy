<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const friends = ref([])
const selectedFriend = ref(null)
const messages = ref([])
const newMessage = ref('')
const currentUser = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const messagesContainer = ref(null)
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

async function fetchFriends() {
  try {
    const res = await fetch(`${API_BASE}/friends`, {
      method: 'GET',
      headers: authHeaders(),
    })

    if (!res.ok) {
      if (res.status === 400 || res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        window.location.href = '/signin'
        return
      }
      console.error('Friends fetch failed:', res.status)
      return
    }

    const data = await res.json()

    let friendsList = []

    if (data.friends) {
      friendsList = data.friends
    } else if (Array.isArray(data)) {
      friendsList = data
    } else if (data._id && data.friends) {
      friendsList = data.friends
    }

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

      const friendIdFromRoute = route.params.friendId
      if (friendIdFromRoute) {
        const friend = friendsWithUsernames.find((f) => f.friendId === friendIdFromRoute)
        if (friend) {
          selectFriend(friend)
        }
      }
    } else {
      friends.value = []
    }
  } catch (err) {
    console.error('fetchFriends error:', err)
  }
}

async function fetchMessages(friendId, isInitialLoad = false) {
  if (!friendId) return

  if (isInitialLoad) {
    isLoading.value = true
  }

  try {
    const res = await fetch(`${API_BASE}/friend/${friendId}/messages`, {
      method: 'GET',
      headers: authHeaders(),
    })

    if (!res.ok) {
      errorMessage.value = 'Failed to load messages'
      return
    }

    const data = await res.json()
    console.log('Raw API response:', data)

    let newMessages = []

    if (Array.isArray(data)) {
      if (data.length > 0 && data[0].messages) {
        data.forEach((bucket) => {
          if (bucket.messages && Array.isArray(bucket.messages)) {
            newMessages.push(...bucket.messages)
          }
        })
      } else {
        newMessages = data
      }
    } else if (data.messages && Array.isArray(data.messages)) {
      newMessages = data.messages
    } else if (typeof data === 'object') {
      const keys = Object.keys(data)
      for (const key of keys) {
        if (Array.isArray(data[key])) {
          if (data[key].length > 0 && data[key][0].messages) {
            data[key].forEach((bucket) => {
              if (bucket.messages && Array.isArray(bucket.messages)) {
                newMessages.push(...bucket.messages)
              }
            })
          } else if (data[key].length > 0 && data[key][0].content) {
            newMessages = data[key]
          }
        }
      }
    }

    console.log('Processed messages:', newMessages)

    const wasAtBottom = isAtBottom()
    messages.value = newMessages

    if (isInitialLoad || wasAtBottom) {
      await nextTick()
      scrollToBottom()
    }
  } catch (err) {
    console.error('fetchMessages error:', err)
    errorMessage.value = 'Failed to load messages'
  } finally {
    if (isInitialLoad) {
      isLoading.value = false
    }
  }
}

function isAtBottom() {
  if (!messagesContainer.value) return true
  const threshold = 100
  const position = messagesContainer.value.scrollTop + messagesContainer.value.clientHeight
  const height = messagesContainer.value.scrollHeight
  return position >= height - threshold
}

function startPolling() {
  stopPolling()
  pollingInterval.value = setInterval(() => {
    if (selectedFriend.value) {
      fetchMessages(selectedFriend.value.friendId, false)
    }
  }, 2000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

function selectFriend(friend) {
  stopPolling()
  selectedFriend.value = friend
  messages.value = []
  errorMessage.value = ''
  fetchMessages(friend.friendId, true)
  startPolling()
}

async function sendMessage() {
  if (!newMessage.value.trim() || !selectedFriend.value) return

  const messageContent = newMessage.value.trim()
  newMessage.value = ''

  try {
    const res = await fetch(`${API_BASE}/friend/${selectedFriend.value.friendId}/message`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ content: messageContent }),
    })

    if (!res.ok) {
      errorMessage.value = 'Failed to send message'
      newMessage.value = messageContent
      return
    }

    const sentMessage = await res.json()
    console.log('Message sent successfully:', sentMessage)

    setTimeout(() => {
      fetchMessages(selectedFriend.value.friendId, false)
    }, 100)
  } catch (err) {
    console.error('sendMessage error:', err)
    errorMessage.value = 'Failed to send message'
    newMessage.value = messageContent
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function isOwnMessage(message) {
  return message.sender === currentUser.value?._id
}

onMounted(() => {
  fetchCurrentUser()
  fetchFriends()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <!-- <Header /> -->
  <div class="messages-page">
    <div class="messages-container">
      <aside class="friends-sidebar">
        <h2>Messages</h2>

        <div v-if="friends.length === 0" class="empty-state">
          <p>No friends yet. Add friends to start messaging!</p>
        </div>

        <ul v-else class="friends-list">
          <li
            v-for="f in friends"
            :key="f.friendId"
            @click="selectFriend(f)"
            :class="{ active: selectedFriend?.friendId === f.friendId }"
          >
            {{ f.username }}
          </li>
        </ul>
      </aside>

      <main class="chat-area">
        <div v-if="!selectedFriend" class="no-chat-selected">
          <p>Select a friend to start messaging</p>
        </div>

        <div v-else class="chat-container">
          <div class="chat-header">
            <h3>{{ selectedFriend.username }}</h3>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div ref="messagesContainer" class="messages-list">
            <div v-if="isLoading" class="loading-indicator">Loading messages...</div>

            <div v-else-if="messages.length === 0" class="no-messages">
              No messages yet. Start the conversation!
            </div>

            <div v-else class="messages-wrapper">
              <div
                v-for="(msg, index) in messages"
                :key="`${msg.sender}-${msg.content}-${index}`"
                class="message"
                :class="{
                  own: isOwnMessage(msg),
                  other: !isOwnMessage(msg),
                }"
              >
                <div class="message-content">
                  {{ msg.content }}
                </div>
              </div>
            </div>
          </div>

          <div class="message-input-container">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              placeholder="Type a message..."
              class="message-input"
            />
            <button @click="sendMessage" class="send-button">Send</button>
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
  --gap: 1rem;
}

* {
  box-sizing: border-box;
}

.messages-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  margin-left: 0vw;
}

.messages-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1rem;
  height: calc(100vh - 150px);
  width: fit-content;
  background: var(--white);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.friends-sidebar {
  background: linear-gradient(135deg, var(--accent), var(--primary));
  color: var(--white);
  padding: 1.5rem;
  overflow-y: auto;
}

.friends-sidebar h2 {
  margin: 0 0 1rem 0;
  font-weight: 700;
  font-size: 1.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 0.5rem;
}

.friends-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.friends-list li {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-weight: 600;
}

.friends-list li:hover {
  background: rgba(255, 255, 255, 0.2);
}

.friends-list li.active {
  background: var(--white);
  color: var(--primary);
}

.chat-area {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: var(--white);
}

.no-chat-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-gray);
  font-size: 1.1rem;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 2px solid var(--border-gray);
  background: linear-gradient(135deg, var(--accent), var(--primary));
  color: var(--white);
  flex-shrink: 0;
}

.chat-header h3 {
  margin: 0;
  font-weight: 700;
  font-size: 1.25rem;
}

.error-message {
  background: #fee;
  color: var(--error);
  padding: 0.75rem;
  margin: 1rem;
  border-radius: 8px;
  border: 1px solid var(--error);
  flex-shrink: 0;
}

.messages-list {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.messages-wrapper {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
}

.loading-indicator,
.no-messages {
  text-align: center;
  color: var(--text-gray);
  padding: 2rem;
  font-style: italic;
}

.message {
  display: flex;
  margin-bottom: 0.5rem;
}

.message.own {
  justify-content: flex-end;
}

.message.other {
  justify-content: flex-start;
}

.message-content {
  max-width: 60%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  word-wrap: break-word;
}

.message.own .message-content {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: #8dbbfc;
  border-bottom-right-radius: 4px;
}

.message.other .message-content {
  background: var(--bg-gray);
  color: rgb(255, 117, 117);
  border-bottom-left-radius: 4px;
}

.message-input-container {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 2px solid var(--border-gray);
  background: var(--white);
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--accent);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}

.message-input:focus {
  border-color: var(--primary);
}

.send-button {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: var(--white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: opacity 0.2s ease;
}

.send-button:hover {
  opacity: 0.9;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

@media (max-width: 768px) {
  .messages-container {
    grid-template-columns: 1fr;
    height: calc(100vh - 120px);
  }

  .friends-sidebar {
    display: none;
  }

  .message-content {
    max-width: 80%;
  }
}
</style>
