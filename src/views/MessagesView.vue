<script setup>
import { fetchResponse } from '@/assets/fetch'
import router from '@/router'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
// import { useRoute } from 'vue-router'

// const route = useRoute()
// const friends = ref([])
const selectedChat = ref(null)
const messages = ref([])
const newMessage = ref('')
const currentUser = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const messagesContainer = ref(null)
const pollingInterval = ref(null)

const chats = ref([])

async function fetchCurrentUser() {
  try {
    const response = await fetchResponse('/user', 'GET')

    if (!response.ok) {
      if (response.status === 400 || response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        router.push({ name: 'splash' })
      }
      return
    }

    const data = await response.json()
    currentUser.value = data.user
  } catch (err) {
    console.error('fetchCurrentUser error:', err)
  }
}

async function fetchChats() {
  try {
    const response = await fetchResponse('/chats', 'GET')

    if (!response.ok) {
      if (response.status === 400 || response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')

        router.push({ name: 'splash' })
        return
      }
      console.error('Chat fetch failed:', response.status)
      return
    }

    const data = await response.json()
    chats.value = data
  } catch (error) {
    console.log(error)
  }
}

async function fetchMessages(chatId, isInitialLoad = false) {
  if (!chatId) return

  if (isInitialLoad) {
    isLoading.value = true
  }

  try {
    const response = await fetchResponse(`/chat/${chatId}/messages`, 'GET')

    if (!response.ok) {
      errorMessage.value = 'Failed to load messages'
      return
    }

    const data = await response.json()

    const wasAtBottom = isAtBottom()
    messages.value = data.reverse()

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
    if (selectedChat.value) {
      fetchMessages(selectedChat.value._id, false)
    }
  }, 2000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

function selectChat(chat) {
  stopPolling()
  selectedChat.value = chat
  messages.value = []
  errorMessage.value = ''
  fetchMessages(chat._id, true)
  startPolling()
}

async function sendMessage() {
  console.log(selectedChat.value)

  if (!newMessage.value.trim() || !selectedChat.value) {
    return
  }

  const messageContent = newMessage.value.trim()
  newMessage.value = ''
  const data = { content: messageContent }

  try {
    const response = await fetchResponse(`/chat/${selectedChat.value._id}/message`, 'POST', data)

    if (!response.ok) {
      errorMessage.value = 'Failed to send message'
      newMessage.value = messageContent
      return
    }

    const sentMessage = await response.json()
    console.log('Message sent successfully:', sentMessage)

    setTimeout(() => {
      fetchMessages(selectedChat.value._id, false)
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

function getChatName(chat) {
  if (chat.chatType === 'group') {
    return chat.groupName
  }

  return chat.users[0].username === currentUser.value.username
    ? chat.users[1].username
    : chat.users[0].username
}

onMounted(async () => {
  fetchCurrentUser()
  fetchChats()
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
          <h1 class="grid-column-header">Messages</h1>
          <div v-if="chats.length === 0" class="empty-state">
            <p>Add friends or join groups to start messaging!</p>
          </div>
          <div class="grid-sidebar-content">
            <button
              v-for="c in chats"
              :key="c._id"
              @click="selectChat(c)"
              class="grid-sidebar-content-item"
              :class="{ active: selectedChat?.chatId === c.chatId }"
            >
              {{ getChatName(c) }}

              <div v-if="c.chatType === 'group'" class="group-indicator">
                <span class="material-symbols-outlined"> group </span>
                <span>{{ c.users.length }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="grid-content-wrapper">
        <div v-if="!selectedChat" class="grid-content-no-selection">
          <p>Select a friend to start messaging</p>
        </div>
        <div v-else class="grid-content">
          <div class="grid-column-header">
            <h1>{{ getChatName(selectedChat) }}</h1>
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
                  self: msg.senderUsername === currentUser.username,
                }"
              >
                <div class="message-sender">{{ msg.senderUsername }}</div>
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

.grid-sidebar-content-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grid-sidebar-content-item .material-symbols-outlined {
  font-size: inherit;
}

.group-indicator {
  display: flex;
  align-items: center;
  font-size: var(--fs-label);
  gap: 3px;
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
