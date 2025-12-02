<script setup>
import { fetchResponse } from '@/assets/fetch'
import { ref, onMounted, onUnmounted, watch } from 'vue'

let hasFriends = ref(true)
let userFriends = ref([])
let selectedFriends = ref([])
let groupName = ref()
let allGroups = ref([])
let userInvites = ref([])

let groupSelected = ref(true)
let messageCreated = ref()
let myUsername = localStorage.getItem('username')

let groupSelectedName = ref('')
let groupSelectedId = ref()
let groupMessages = ref([])
let activeGroup = ref()
let usersActive = ref([])
let addUsers = ref([])
let intervalId = setInterval(() => {}, 20000)

onMounted(() => {
  getAllGroups()
})

watch(groupSelected, (newVal) => {
  if (!newVal) {
    intervalId
  } else {
    clearInterval(intervalId)
  }
})

onUnmounted(() => {
  clearInterval(intervalId)
})

async function getAllGroups() {
  let response = await fetchResponse('/groups', 'GET')

  if (response.status === 200) {
    let data = await response.json()

    allGroups.value = data
  }
}

async function addToGroupMessages() {
  let response = await fetchResponse(`/group/${groupSelectedId.value}/messages`, 'GET')

  if (response.status === 200) {
    let messageData = await response.json()

    let newMessageData = messageData.filter((msg) => {
      return !groupMessages.value.some((existing) => existing._id === msg._id)
    })

    createGroupMessages(newMessageData)
  }
}

async function grabSelectedUsers(data) {
  addUsers.value = []
  userFriends.value = []
  let id = data.chatId

  let response = await fetchResponse(`/group/${id}`, 'GET')

  if (response.ok) {
    console.log(response.status)
    let chatData = await response.json()
    await getFriends()

    console.log(userFriends.value)

    usersActive.value = chatData.users

    addUsers.value = userFriends.value.filter((friend) => {
      return !usersActive.value.some((sel) => sel.username === friend.username)
    })
  } else {
    console.log(response.status)
  }
}

async function getGroupMessages(data) {
  let chatid = data['chatId']

  if (activeGroup.value === data) {
    addToGroupMessages()
  } else {
    activeGroup.value = data
    groupMessages.value = []
    addUsers.value = []

    let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/${chatid}/messages`

    let options = {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }

    let response = await fetch(url, options)

    if (response.status === 200) {
      let messageData = await response.json()

      groupSelectedId.value = chatid
      groupSelectedName.value = data.groupName
      groupSelected.value = false

      createGroupMessages(messageData)
    }
  }
}

async function createGroupMessages(messageArr) {
  let newArr = messageArr.filter((message) => 'content' in message)

  for (const message of newArr) {
    let user = await getUser(message.sender)
    groupMessages.value.push({
      content: message.content,
      senderName: user.user.username,
      _id: message._id,
    })
  }
}

async function sendMessage() {
  if (messageCreated.value == '') return

  let data = {
    content: messageCreated.value,
  }

  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/${groupSelectedId.value}/message`

  let options = {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    console.log('message sent successful')

    addToGroupMessages()
    messageCreated.value = ''
  } else {
    console.log(response.status)
  }
}

async function getGroupInvites() {
  let url = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/invites'

  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    let data = await response.json()

    userInvites.value = data
    let inviteModal = document.querySelector('.invites-modal')
    inviteModal.style.display = 'flex'

    console.log(data)
  }
}

async function sendInvite(id) {
  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/invite/${groupSelectedId.value}/${id}`

  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.ok) {
    console.log('successfull invite')
  } else {
    response.status
  }
}

async function getFriends() {
  let url = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app/friends'

  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    let data = await response.json()

    for (let i = 0; i < data.friends.length; i++) {
      console.log(data.friends[i])
      await getUsers(data.friends[i].friendId)
    }
  } else {
    console.log(response.status)
  }
}

async function getUser(id) {
  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/user/${id}`

  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    let user = await response.json()

    return user
  }
}

async function getUsers(data) {
  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/user/${data}`

  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    let data = await response.json()

    userFriends.value.push(data.user)
    return data
  } else {
    console.log(response.status)
  }
}

async function createGroup() {
  let data = {
    groupName: groupName.value,
    users: selectedFriends.value,
  }

  let response = await fetchResponse('/group', 'POST', data)

  if (response.status === 201) {
    let d = await response.json()
    console.log(d)
    console.log('group created successfully')
    allGroups.value.push(d)
    getAllGroups()
    groupName.value = ''
  } else {
    console.log(response.status)
  }
}

function save() {
  let modal = document.querySelector('.group-modal')
  modal.style.display = 'none'
  createGroup()
}

function add(id) {
  selectedFriends.value.push(id)
  console.log(selectedFriends.value)
}

function close() {
  let modal = document.querySelector('.group-modal')
  modal.style.display = 'none'
  selectedFriends.value = []
}

async function open() {
  let modal = document.querySelector('.group-modal')
  modal.style.display = 'flex'
  userFriends.value = []

  await getFriends()
}

function closeInvites() {
  let inviteModal = document.querySelector('.invites-modal')
  inviteModal.style.display = 'none'
}

function openAdd() {
  let modal = document.querySelector('.add-modal')
  modal.style.display = 'flex'
  grabSelectedUsers(activeGroup.value)
}

function closeAdd() {
  let modal = document.querySelector('.add-modal')
  modal.style.display = 'none'
  addUsers.value = []
}

async function acceptInvite(invite, decision) {
  let data = {
    isAccepted: decision,
  }
  let response = await fetchResponse(`/group/invite/${invite._id}`, 'PATCH', data)

  if (response.ok) {
    allGroups.value = []

    let index = userInvites.value.indexOf(invite)
    if (index !== -1) userInvites.value.splice(index, 1)
    getAllGroups()
  } else {
    console.log(response.status)
  }
}
</script>

<template>
  <div class="main-container">
    <div class="groupchat-container">
      <div class="sidebar-wrapper">
        <div class="sidebar">
          <div class="sidebar-header">
            <h1>Groupchats</h1>
          </div>
          <div class="sidebar-content">
            <button
              class="group"
              tabindex="0"
              v-for="group in allGroups.slice().reverse()"
              :key="group.id"
              @click="getGroupMessages(group)"
            >
              {{ group.groupName }}
            </button>
          </div>
          <div class="sidebar-footer">
            <button class="clicker-inverted" @click="getGroupInvites()">Invites</button>
            <button class="clicker-inverted" @click="open()">Create Group</button>
          </div>
        </div>
      </div>
      <div class="chat-container">
        <div class="no-selection" v-if="groupSelected">Select a group</div>
        <div class="selected-group-container" v-else>
          <div class="selected-group-header">
            <h4>{{ groupSelectedName }}</h4>
            <button class="clicker-inverted" @click="openAdd()">Add People</button>
          </div>
          <div class="messages-wrapper">
            <div class="messages">
              <div
                class="message"
                :class="{ self: message.senderName === myUsername }"
                v-for="message in groupMessages.slice().reverse()"
                :key="message.id"
              >
                <span class="message-sender">{{ message.senderName }}</span>
                <span class="message-content">{{ message.content }}</span>
              </div>
            </div>
          </div>

          <div class="selected-group-send-message">
            <textarea
              name=""
              id=""
              class="messageInput"
              v-model="messageCreated"
              placeholder="Send Message..."
            ></textarea>
            <button class="clicker-inverted" @click="sendMessage()">Send</button>
          </div>
        </div>
      </div>
    </div>

    <div class="group-modal">
      <div class="create-group-container">
        <h1 class="modal-heading">Create Group</h1>

        <div class="create-name-container">
          <input
            type="text"
            class="group-name"
            v-model="groupName"
            placeholder="Enter Group Name"
          />
        </div>

        <div class="added-friends-container" v-show="hasFriends">
          <div class="friend" v-for="friend in userFriends" :key="friend.id">
            <div>{{ friend.username }}</div>
            <button class="clicker-inverted" @click="add(friend['_id'])">Add</button>
          </div>
        </div>

        <div class="button-container">
          <button class="green-btn" @click="save()">Save</button>
          <button class="red-btn" @click="close()">Cancel</button>
        </div>
      </div>
    </div>

    <div class="invites-modal">
      <div class="invites-container">
        <h1 class="modal-heading">Group Invites</h1>
        <div class="show-invites">
          <div class="invite-box" v-for="invite in userInvites" :key="invite.id">
            <p class="invite-message">
              <span>{{ invite.sender[0].username }} </span> invited you to
              <span>{{ invite.group.name }}</span>
            </p>

            <div class="invite-buttons-container">
              <button class="green-btn" @click="acceptInvite(invite, true)">Accept</button>
              <button class="red-btn" @click="acceptInvite(invite, false)">Decline</button>
            </div>
          </div>
        </div>

        <button class="red-btn" @click="closeInvites()">Cancel</button>
      </div>
    </div>

    <div class="add-modal">
      <div class="add-modal-flex">
        <h1 class="modal-heading">Invite Friends</h1>
        <div>
          <div class="user-add-options" v-for="user in addUsers" :key="user.id">
            <span class="user-add-name">{{ user.username }}</span>
            <button class="clicker-inverted" @click="sendInvite(user._id)">Add</button>
          </div>
        </div>
        <button class="red-btn" @click="closeAdd()">Exit</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  height: 100%;
}
/* Groupchat Container - Using messages-container structure from HomeView */
.groupchat-container {
  display: grid;
  grid-template-columns: 300px 1fr;

  height: 100%;
  width: 100%;
  border-radius: 12px;

  overflow: hidden;
  border: 1px solid var(--c-primary);
}

/* Sidebar Styles - Matching friends-sidebar from HomeView */
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

/* Chatbox Container - Matching friends-list from HomeView */
.sidebar-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  list-style: none;

  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.group {
  text-align: left;
}

/* Chatbox Footer */
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

/* Chat Area - Matching chat-area from HomeView */
.chat-container {
  padding-block: var(--space-300);
  padding-inline: var(--space-400);
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.no-selection {
  color: var(--text-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* Selected Group Container - Matching chat-container from HomeView */
.selected-group-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.selected-group-header {
  width: 100%;
  margin-block-start: 9.6px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

/* Messages Area - Matching messages-list from HomeView */
.messages-wrapper {
  flex: 1;
  overflow-x: hidden;
  overflow-y: scroll;

  scrollbar-width: thin;
  scrollbar-color: var(--color-background-mute) transparent;

  margin-block: var(--space-300);
}

.messages {
  display: flex;
  flex-direction: column-reverse;
  gap: var(--space-075);
  min-height: 100%;
}

/* Friends Messages - Matching message structure from HomeView */
.message {
  display: flex;
  flex-direction: column;

  max-width: 60%;
  align-self: flex-start;
}

.message.self {
  justify-content: flex-end;
  align-self: flex-end;
}

.message-sender {
  font-size: var(--fs-label-small);
  text-align: start;
}

.message-content {
  text-align: start;
  overflow-wrap: break-word;
  font-size: var(--fs-body-medium);

  border-radius: 18px;
  padding-inline: var(--space-150);
  padding-block: var(--space-100);
  background: var(--color-background-mute);
}

.message.self .message-content {
  background: var(--c-primary);
}

.message.self .message-sender {
  text-align: end;
}

/* Message Input - Matching message-input-container from HomeView */
.selected-group-send-message {
  display: flex;
  gap: 0.75rem;
  border-top: 2px solid var(--border-gray);
  background: var(--white);
  flex-shrink: 0;
}

.messageInput {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--accent);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  resize: none;
  height: 50px;
}

.messageInput:focus {
  border-color: var(--primary);
}

.sendMessage {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: var(--white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: opacity 0.2s ease;
}

.sendMessage:hover {
  opacity: 0.9;
}

/* Modals - Matching modal styles */
.group-modal,
.invites-modal,
.add-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Create Group Modal */
.create-group-container {
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  background: var(--white);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 1px solid var(--c-primary);
  overflow-y: auto;
}

.added-friends-container {
  width: 100%;
  max-height: 300px;
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.friend {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: var(--space-150);
}

.group-name {
  width: 100%;
  height: 50px;
  padding: 0.75rem;
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}

.button-container {
  width: 100%;
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: 0.75rem;
}

.red-btn,
.green-btn {
  flex: 1;
}

/* Invites Modal */
.invites-container {
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  background: var(--white);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--c-primary);

  overflow-y: scroll;

  scrollbar-width: thin;
  scrollbar-color: var(--color-background-mute) transparent;
}

.show-invites {
  width: 100%;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  margin-bottom: 1rem;
  overflow-y: auto;
}

.invite-box {
  width: 100%;
  min-height: 80px;

  padding: 1rem;
  margin-bottom: 0.75rem;

  border: 2px solid var(--border-gray);
  border-radius: 8px;
  background: var(--bg-gray);

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.invite-from {
  font-weight: 700;
  color: #333;
  font-size: 1rem;
}

.invite-group-name {
  font-size: 0.9rem;
  color: var(--text-gray);
}

.invite-buttons-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;

  justify-content: end;
}

/* Add People Modal */
.add-modal-flex {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-400);

  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  overflow-y: auto;

  border: 1px solid var(--c-primary);
}

.modal-heading {
  text-align: center;
  border-bottom: 2px solid var(--color-background-mute);
}

.user-add-options {
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .groupchat-container {
    grid-template-columns: 1fr;
    height: calc(100vh - 120px);
  }

  .sidebar {
    display: none;
  }

  .chat-container {
    width: 100%;
  }

  .message {
    max-width: 80%;
  }
}
</style>
