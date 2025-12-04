<script setup>
import { fetchResponse } from '@/assets/fetch'
import router from '@/router'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const friends = ref([])
const selectedChat = ref(null)
const messages = ref([])
const newMessage = ref('')
const currentUser = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const messagesContainer = ref(null)
const pollingInterval = ref(null)

const creatingNewGroup = ref(false)
const invitingMembers = ref(false)

const chats = ref([])

const formModel = ref({ groupName: '', users: [] })

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

async function fetchFriends() {
  try {
    const response = await fetchResponse('/friends', 'GET')

    if (!response.ok) {
      if (response.status === 400 || response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        router.push({ name: 'splash' })
      }
      return
    }

    const data = await response.json()
    friends.value = data.friends
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

async function createGroup() {
  try {
    const data = formModel.value

    const response = await fetchResponse('/group', 'POST', data)

    if (response.ok) {
      await fetchChats()
    }
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
  creatingNewGroup.value = false
  invitingMembers.value = false
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

async function toggleGroupCreation() {
  creatingNewGroup.value = true
  invitingMembers.value = false
  selectedChat.value = null
  await fetchFriends()
}
async function toggleInviteMembers() {
  creatingNewGroup.value = false
  console.log(selectedChat.value)
  invitingMembers.value = true
  await fetchFriends()
  filterFriends()
}

async function filterFriends() {
  const alreadyInGroup = selectedChat.value.users.map((f) => {
    return f.userId
  })

  friends.value = friends.value.filter((f) => !alreadyInGroup.includes(f.friendId))
}

async function inviteMembers() {
  try {
    for (let i = 0; i < formModel.value.users.length; i++) {
      const userId = formModel.value.users[i]

      await fetchResponse(`/group/invite/${selectedChat.value._id}/${userId}`, 'POST')
    }

    invitingMembers.value = false
  } catch (error) {
    console.log(error)
  }
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
  <div class="main-column">
    <div class="main-column-heading">
      <h1>Messages</h1>
      <button class="clicker clicker-inverted" @click="toggleGroupCreation()">Create Group</button>
    </div>

    <div class="grid">
      <div class="grid-card">
        <div class="tabs">
          <div v-if="chats.length === 0" class="empty-state">
            <p>No chats found. Make friends</p>
          </div>
          <button
            v-else
            v-for="c in chats"
            :key="c._id"
            @click="selectChat(c)"
            class="tab clicker"
            :class="{ active: selectedChat?.chatId === c.chatId }"
          >
            <div class="tab-header">
              <div class="tab-title">{{ getChatName(c) }}</div>

              <div v-if="c.chatType === 'group'" class="group-indicator">
                <span class="material-symbols-outlined"> group </span>
                <span>{{ c.users.length }}</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div class="grid-card">
        <div v-if="creatingNewGroup" class="right-card-wrapper">
          <div class="right-card-header">
            <h3>New Group</h3>
          </div>

          <div class="form-container">
            <div class="form-group">
              <label>Group Name</label>
              <input v-model="formModel.groupName" placeholder="e.g. Artful Monkeys" />
            </div>

            <div class="form-group">
              <label>Users</label>

              <div v-for="friend in friends" :key="friend.friendId" class="form-row">
                <input
                  type="checkbox"
                  :id="friend.friendUsername"
                  :value="friend.friendId"
                  v-model="formModel.users"
                />
                <label :for="friend.friendUsername">{{ friend.friendUsername }}</label>
              </div>
            </div>
          </div>
          <button class="clicker-inverted" @click="createGroup()">Submit</button>
        </div>
        <div v-else-if="invitingMembers" class="right-card-wrapper">
          <div class="right-card-header">
            <h3>Inviting Users</h3>
          </div>

          <div class="form-container">
            <div class="form-group">
              <label>Users</label>

              <div v-for="friend in friends" :key="friend.friendId" class="form-row">
                <input
                  type="checkbox"
                  :id="friend.friendUsername"
                  :value="friend.friendId"
                  v-model="formModel.users"
                />
                <label :for="friend.friendUsername">{{ friend.friendUsername }}</label>
              </div>
            </div>
          </div>
          <button class="clicker-inverted" @click="inviteMembers()">Submit</button>
        </div>
        <div v-else-if="selectedChat" class="right-card-wrapper right-card-wrapper-tighter">
          <div class="right-card-header">
            <h3>{{ getChatName(selectedChat) }}</h3>
            <button
              v-if="selectedChat.chatType === 'group'"
              class="clicker-inverted"
              @click="toggleInviteMembers()"
            >
              +
            </button>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div class="messages-wrapper">
            <div v-if="messages.length === 0" class="grid-content-no-selection">
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
        <div v-else class="right-card-wrapper grid-content-no-selection">
          <p>Select a chat to start messaging</p>
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

.group-indicator {
  display: flex;
  align-items: center;
  font-size: var(--fs-label);
  gap: 3px;
}

.right-card-wrapper-tighter {
  gap: var(--space-050);
}

.form-container {
  justify-content: start;
  gap: var(--space-300);
}

.form-row {
  display: flex;
  gap: var(--space-100);

  align-items: center;
}
</style>
