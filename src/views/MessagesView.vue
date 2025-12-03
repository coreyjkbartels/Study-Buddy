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
  <div class="grid-wrapper">
    <div class="grid-2column">
      <div class="grid-sidebar-wrapper">
        <div class="grid-sidebar">
          <h1 class="grid-sidebar-header">Messages</h1>
          <div v-if="friends.length === 0" class="empty-state">
            <p>No friends yet. Add friends to start messaging!</p>
          </div>
          <div class="grid-sidebar-content">
            <button
              v-for="f in friends"
              :key="f.friendId"
              @click="selectFriend(f)"
              class="grid-sidebar-content-item"
              :class="{ active: selectedFriend?.friendId === f.friendId }"
            >
              {{ f.username }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid-content-wrapper">
        <div v-if="!selectedFriend" class="grid-content-no-selection">
          <p>Select a friend to start messaging</p>
        </div>
        <div v-else class="grid-content">
          <div class="grid-content-header">
            <h4>{{ selectedFriend.username }}</h4>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="messages-wrapper">
            <div v-if="isLoading" class="grid-content-no-selection">Loading messages...</div>
            <div v-else-if="messages.length === 0" class="grid-content-no-selection">
              No messages yet. Start the conversation!
            </div>
            <div v-else class="messages">
              <div
                v-for="(msg, index) in messages"
                :key="`${msg.sender}-${msg.content}-${index}`"
                class="message"
                :class="{
                  self: isOwnMessage(msg),
                }"
              >
                <div class="message-content">
                  {{ msg.content }}
                </div>
              </div>
            </div>
          </div>
          <div class="message-input">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              placeholder="Type a message..."
              class="message-input-field"
            />
            <button @click="sendMessage" class="clicker-inverted">Send</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
